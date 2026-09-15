import { describe, expect, it, vi } from "vitest";
import { Effect, Layer } from "effect";
import { AdminAlreadyExistsError, AuthenticationProviderError } from "$lib/effect/errors";
import { makeCliRuntime, runCliEffect } from "$lib/cli/effect/runtime";
import {
  AdminDatabase,
  type AdminDatabaseService,
  type AdminTransaction,
} from "$lib/cli/services/database";
import {
  AdminAuthentication,
  type AdminAuthenticationService,
} from "$lib/cli/services/authentication";
import { createAdmin } from "$lib/cli/workflows/admin";

const input = { email: "admin@example.com", name: "Admin", password: "password-123" };
const transaction = {} as AdminTransaction;

function runtimeFor(
  existing: ReadonlyArray<{ readonly id: string }>,
  createUser: AdminAuthenticationService["createUser"],
) {
  const database: AdminDatabaseService = {
    findUserByEmail: () => Effect.succeed(existing),
    transaction: (operation) => operation(transaction),
  };
  return makeCliRuntime(
    Layer.merge(
      Layer.succeed(AdminDatabase, database),
      Layer.succeed(AdminAuthentication, { createUser }),
    ),
  );
}

describe("administrator CLI workflow", () => {
  it("refuses an existing account before calling Better Auth", async () => {
    const createUser = vi.fn(() =>
      Effect.fail(
        new AuthenticationProviderError({
          message: "should not run",
          operation: "test",
          cause: new Error("should not run"),
        }),
      ),
    );
    const runtime = runtimeFor([{ id: "existing" }], createUser);

    const result = await runCliEffect(runtime, createAdmin(input));

    expect(result._tag).toBe("failure");
    if (result._tag === "failure") expect(result.error).toBeInstanceOf(AdminAlreadyExistsError);
    expect(createUser).not.toHaveBeenCalled();
    await runtime.dispose();
  });

  it("creates exactly one administrator through the injected transaction", async () => {
    const createUser = vi.fn(() => Effect.succeed({ email: input.email }));
    const runtime = runtimeFor([], createUser);

    const result = await runCliEffect(runtime, createAdmin(input));

    expect(result).toMatchObject({ _tag: "success", value: { email: input.email } });
    expect(createUser).toHaveBeenCalledTimes(1);
    await runtime.dispose();
  });
});
