import { describe, expect, it, vi } from "vitest";

vi.mock("$env/dynamic/private", () => ({
  env: {
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost",
    TURSO_CONNECTION_URL: "file:test",
    TURSO_AUTH_TOKEN: "test-token",
  },
}));
vi.mock("$lib/auth", () => ({
  getAuth: vi.fn(),
}));
import { Effect, Layer } from "effect";
import { ForbiddenError, DatabaseError } from "$lib/effect/errors";
import { decodeFormData } from "$lib/effect/schemas/forms";
import { PemdTagForm } from "$lib/effect/schemas/project";
import { actionFailure } from "$lib/server/effect/sveltekit";
import { makeServerRuntime, runWithServerRuntime } from "$lib/server/effect/runtime";
import { Authorization, type AuthorizationService } from "$lib/server/services/authorization";
import { Database, type DatabaseService } from "$lib/server/services/database";
import { createPemdTag } from "$lib/server/workflows/project";

describe("Effect server boundaries", () => {
  it("decodes repeated FormData values instead of silently dropping them", async () => {
    const form = new FormData();
    form.set("anchorPosition", '{"x":1}');
    form.set("stemVector", '{"x":0}');
    form.append("etage", "RDC");
    form.append("etage", "1");

    const result = await Effect.runPromise(decodeFormData(PemdTagForm, form).pipe(Effect.either));

    expect(result._tag).toBe("Left");
  });

  it("maps typed authorization failures to the existing action contract", () => {
    const result = {
      _tag: "failure" as const,
      error: new ForbiddenError({ message: "Permission refusée" }),
    };

    expect(actionFailure(result, "error")).toMatchObject({
      status: 403,
      data: { error: "Permission refusée" },
    });
  });

  it("checks authorization before any protected PEMD write", async () => {
    let databaseCalls = 0;
    const database: DatabaseService = {
      run: () => {
        databaseCalls += 1;
        return Effect.fail(
          new DatabaseError({
            message: "unexpected database call",
            operation: "test",
            cause: new Error("unexpected"),
          }),
        );
      },
    };
    const authorization: AuthorizationService = {
      userHasPermission: () => Effect.succeed({ success: false, error: null }),
      checkPermission: () => Effect.succeed({ success: false, error: null }),
    };
    const runtime = makeServerRuntime(
      Layer.merge(Layer.succeed(Database, database), Layer.succeed(Authorization, authorization)),
    );

    const form = new FormData();
    form.set("anchorPosition", '{"x":1}');
    form.set("stemVector", '{"x":0}');

    const result = await runWithServerRuntime(
      runtime,
      createPemdTag({ projectId: "project-1", user: { id: "user-1" }, formData: form }),
    );

    expect(result._tag).toBe("failure");
    if (result._tag === "failure") {
      expect(result.error).toMatchObject({ _tag: "ForbiddenError" });
    }
    expect(databaseCalls).toBe(0);
    await runtime.dispose();
  });
});
