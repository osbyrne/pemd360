import { describe, expect, it } from "vitest";
import { Effect, Layer } from "effect";
import { createOperation } from "$lib/client/effect/operation.svelte";
import {
  ClientAuthentication,
  type ClientAuthenticationService,
} from "$lib/client/services/authentication";
import { makeClientRuntime } from "$lib/client/effect/runtime";

const fakeService: ClientAuthenticationService = {
  signInEmail: () => Effect.succeed(undefined),
  signOut: () => Effect.succeed(undefined),
  createUser: () => Effect.succeed({ userId: "user-1" }),
  listUsers: () => Effect.succeed({ users: [], total: 0 }),
  setRole: () => Effect.succeed(undefined),
  setUserPassword: () => Effect.succeed(undefined),
  banUser: () => Effect.succeed(undefined),
  unbanUser: () => Effect.succeed(undefined),
  removeUser: () => Effect.succeed(undefined),
};

describe("component operation bridge", () => {
  it("drops duplicate writes and suppresses completion after disposal", async () => {
    let resolve: (() => void) | undefined;
    const pending = new Promise<void>((finish) => {
      resolve = finish;
    });
    const runtime = makeClientRuntime(Layer.succeed(ClientAuthentication, fakeService));
    const operation = createOperation<void, never>(runtime);
    const effect = Effect.promise(() => pending);
    const first = operation.execute(effect);
    const duplicate = await operation.execute(effect);

    expect(duplicate).toMatchObject({ _tag: "skipped" });
    operation.dispose();
    resolve?.();
    await first;
    expect(operation.state.pending).toBe(false);
    expect(operation.state.value).toBeNull();
    await runtime.dispose();
  });
});
