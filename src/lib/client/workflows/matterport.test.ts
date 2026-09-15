import { describe, expect, it } from "vitest";
import { Effect } from "effect";
import { MatterportError } from "$lib/effect/errors";
import { makeSerializedTagReconciler, reconcileTagSet } from "$lib/client/workflows/matterport";
import type {
  MatterportConnection,
  MatterportTagDescriptor,
} from "$lib/client/services/matterport";

const descriptor = (label: string): MatterportTagDescriptor => ({
  label,
  anchorPosition: { x: 1, y: 2, z: 3 },
  stemVector: { x: 0, y: 1, z: 0 },
});

function fakeConnection(overrides: Partial<MatterportConnection> = {}): MatterportConnection {
  return {
    addTag: () => Effect.succeed("added"),
    removeTag: () => Effect.succeed(undefined),
    subscribePointer: () => Effect.succeed(() => undefined),
    disconnect: () => Effect.succeed(undefined),
    ...overrides,
  };
}

describe("Matterport tag workflows", () => {
  it("keeps failed removals while continuing independent additions", async () => {
    const connection = fakeConnection({
      removeTag: (id) =>
        id === "stale"
          ? Effect.fail(
              new MatterportError({
                message: "remove failed",
                operation: "test.remove",
                cause: new Error("remove failed"),
              }),
            )
          : Effect.succeed(undefined),
      addTag: () =>
        Effect.fail(
          new MatterportError({
            message: "add failed",
            operation: "test.add",
            cause: new Error("add failed"),
          }),
        ),
    });

    const result = await Effect.runPromise(
      reconcileTagSet(connection, ["stale", "removed"], [descriptor("desired")]),
    );

    expect(result.ids).toEqual(["stale"]);
    expect(result.errors).toHaveLength(2);
  });

  it("serializes requests and only publishes the latest result", async () => {
    let releaseFirst: (() => void) | undefined;
    let additions = 0;
    const connection = fakeConnection({
      addTag: () => {
        additions += 1;
        if (additions === 1) {
          return Effect.promise(
            () => new Promise<string>((resolve) => (releaseFirst = () => resolve("first"))),
          );
        }
        return Effect.succeed("second");
      },
    });
    const reconciler = makeSerializedTagReconciler(connection);

    const first = reconciler.schedule([descriptor("first")]);
    const second = reconciler.schedule([descriptor("second")]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    releaseFirst?.();

    await expect(first).resolves.toBeUndefined();
    await expect(second).resolves.toMatchObject({ ids: ["second"] });
    expect(reconciler.currentIds).toEqual(["second"]);
  });
});
