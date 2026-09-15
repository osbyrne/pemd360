import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { AuthenticationProviderError } from "$lib/effect/errors";
import {
  makeClientAuthenticationService,
  ClientAuthentication,
} from "$lib/client/services/authentication";
import { createUserWithAssignments } from "$lib/client/workflows/auth";
import { makeClientRuntime, runWithClientRuntime } from "$lib/client/effect/runtime";
import type { ClientAuthenticationApi } from "$lib/client/services/authentication";

function fakeApi(
  overrides: Partial<ClientAuthenticationApi["admin"]> = {},
): ClientAuthenticationApi {
  return {
    signIn: { email: async () => ({ data: {}, error: null }) },
    signOut: async () => ({ data: null, error: null }),
    admin: {
      createUser: async () => ({ data: { user: { id: "new-user" } }, error: null }),
      listUsers: async () => ({ data: { users: [], total: 0 }, error: null }),
      setRole: async () => ({ data: null, error: null }),
      setUserPassword: async () => ({ data: null, error: null }),
      banUser: async () => ({ data: null, error: null }),
      unbanUser: async () => ({ data: null, error: null }),
      removeUser: async () => ({ data: null, error: null }),
      ...overrides,
    },
  };
}

describe("client authentication workflows", () => {
  it("turns a returned provider error into AuthenticationProviderError", async () => {
    const service = makeClientAuthenticationService(
      fakeApi({
        setRole: async () => ({
          data: null,
          error: { message: "Role refused" },
        }),
      }),
    );
    const result = await Effect.runPromise(
      service.setRole({ userId: "user-1", role: "user" }).pipe(Effect.either),
    );

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(AuthenticationProviderError);
      expect(result.left.message).toBe("Role refused");
    }
  });

  it("reports assignment partial success without recreating the account", async () => {
    const service = makeClientAuthenticationService(fakeApi());
    const runtime = makeClientRuntime(Layer.succeed(ClientAuthentication, service));
    const result = await runWithClientRuntime(
      runtime,
      createUserWithAssignments({
        email: "new@example.com",
        password: "password-123",
        name: "New User",
        role: "user",
        projectIds: ["project-1"],
        assignProjects: () =>
          Effect.fail(
            new AuthenticationProviderError({
              message: "Assignment failed",
              operation: "test.assignment",
              cause: new Error("assignment failed"),
            }),
          ),
      }),
    );

    expect(result._tag).toBe("success");
    if (result._tag === "success") {
      expect(result.value).toMatchObject({
        userId: "new-user",
        assignment: "partial",
      });
    }
    await runtime.dispose();
  });
});
