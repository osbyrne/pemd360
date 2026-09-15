import { Cause, Effect, Exit, ManagedRuntime, Option } from "effect";

export type CliResult<A, E> =
  | { readonly _tag: "success"; readonly value: A }
  | { readonly _tag: "failure"; readonly error: E }
  | { readonly _tag: "defect"; readonly cause: unknown };

export function makeCliRuntime<R>(
  layer: Parameters<typeof ManagedRuntime.make<R, never>>[0],
): ManagedRuntime.ManagedRuntime<R, never> {
  return ManagedRuntime.make(layer);
}

export async function runCliEffect<A, E, R>(
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  effect: Effect.Effect<A, E, R>,
): Promise<CliResult<A, E>> {
  const exit = await runtime.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) return { _tag: "success", value: exit.value };

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) return { _tag: "failure", error: failure.value };
  return { _tag: "defect", cause: Cause.squash(exit.cause) };
}
