import { Effect } from "effect";
import {
  Matterport,
  type MatterportConnection,
  type MatterportService,
  type MatterportTagDescriptor,
} from "$lib/client/services/matterport";
import { MatterportError } from "$lib/effect/errors";
import { runClientBoundaryEffect, type ClientResult } from "$lib/client/effect/runtime";

export function connectMatterport(input: {
  readonly mode: "NPM" | "Script";
  readonly sdkKey: string;
  readonly iframe: HTMLIFrameElement;
  readonly timeoutMs?: number;
}): Effect.Effect<MatterportConnection, MatterportError, Matterport> {
  return Effect.gen(function* () {
    const matterport = yield* Matterport;
    return yield* matterport.connect(input);
  });
}

export type TagReconciliationResult = {
  readonly ids: readonly string[];
  readonly errors: readonly MatterportError[];
};

export function reconcileTagSet(
  connection: MatterportConnection,
  currentIds: readonly string[],
  desired: readonly MatterportTagDescriptor[],
): Effect.Effect<TagReconciliationResult, never> {
  return Effect.gen(function* () {
    const ids: string[] = [];
    const errors: MatterportError[] = [];
    const failedRemovals: string[] = [];
    for (const id of currentIds) {
      const result = yield* connection.removeTag(id).pipe(Effect.either);
      if (result._tag === "Left") {
        errors.push(result.left);
        failedRemovals.push(id);
      }
    }
    ids.push(...failedRemovals);

    for (const descriptor of desired) {
      const result = yield* connection.addTag(descriptor).pipe(Effect.either);
      if (result._tag === "Right") ids.push(result.right);
      else errors.push(result.left);
    }
    return { ids, errors };
  });
}

export function makeSerializedTagReconciler(
  connection: MatterportConnection,
  execute: <A>(
    effect: Effect.Effect<A, never>,
  ) => Promise<ClientResult<A, never>> = runClientBoundaryEffect,
) {
  let currentIds: string[] = [];
  let sequence = 0;
  let queue: Promise<void> = Promise.resolve();
  let disposed = false;

  return {
    schedule(desired: readonly MatterportTagDescriptor[]) {
      const request = ++sequence;
      let outcome: TagReconciliationResult | undefined;
      const work = queue.then(async () => {
        if (disposed) return;
        const result = await execute(reconcileTagSet(connection, currentIds, desired));
        if (result._tag !== "success") return;
        currentIds = [...result.value.ids];
        if (request === sequence) outcome = result.value;
      });
      queue = work.catch(() => undefined);
      return work.then(() => outcome);
    },
    dispose() {
      disposed = true;
      sequence += 1;
    },
    registerId(id: string) {
      if (!disposed && !currentIds.includes(id)) currentIds.push(id);
    },
    get currentIds() {
      return [...currentIds];
    },
  };
}

export function provideMatterportService<A, E>(
  effect: Effect.Effect<A, E, Matterport>,
  service: MatterportService,
) {
  return effect.pipe(Effect.provideService(Matterport, service));
}
