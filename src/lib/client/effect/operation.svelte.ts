import { Effect } from "effect";
import {
  clientRuntime,
  runWithClientRuntime,
  type ClientDefect,
  type ClientFailure,
  type ClientResult,
  type ClientServices,
  type ClientSkipped,
  type ClientSuccess,
} from "$lib/client/effect/runtime";
import type { ManagedRuntime } from "effect";

export type OperationState<A, E> = {
  pending: boolean;
  value: A | null;
  error: E | unknown | null;
};

export type OperationResult<A, E> = ClientResult<A, E> | ClientSkipped;
export type OperationMode = "drop" | "latest";

export function createOperation<A, E>(
  runtime: ManagedRuntime.ManagedRuntime<ClientServices, never> = clientRuntime,
) {
  const initialState: OperationState<A, E> = { pending: false, value: null, error: null };
  let state: OperationState<A, E>;
  try {
    const reactiveState = $state(initialState);
    state = reactiveState;
  } catch (cause) {
    if (!(cause instanceof ReferenceError)) throw cause;
    state = initialState;
  }
  let disposed = false;
  let sequence = 0;

  async function execute(
    effect: Effect.Effect<A, E, ClientServices>,
    options: { readonly mode?: OperationMode } = {},
  ): Promise<OperationResult<A, E>> {
    if (state.pending && options.mode !== "latest") return { _tag: "skipped" };
    const operation = ++sequence;
    state.pending = true;
    state.error = null;
    const result = await runWithClientRuntime(runtime, effect);
    if (!disposed && operation === sequence) {
      state.pending = false;
      if (result._tag === "success") {
        state.value = result.value;
      } else {
        state.error = result._tag === "failure" ? result.error : result.cause;
      }
    }
    return result;
  }

  function dispose() {
    disposed = true;
    sequence += 1;
    state.pending = false;
  }

  return { state, execute, dispose };
}

export function isOperationSuccess<A, E>(
  result: OperationResult<A, E>,
): result is ClientSuccess<A> {
  return result._tag === "success";
}

export function isOperationFailure<A, E>(
  result: OperationResult<A, E>,
): result is ClientFailure<E> | ClientDefect {
  return result._tag === "failure" || result._tag === "defect";
}

export function operationErrorMessage<A, E>(
  result: OperationResult<A, E>,
  fallback: string,
): string {
  if (result._tag === "failure" && result.error instanceof Error)
    return result.error.message || fallback;
  if (
    result._tag === "failure" &&
    typeof result.error === "object" &&
    result.error !== null &&
    "message" in result.error
  ) {
    const message = result.error.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}
