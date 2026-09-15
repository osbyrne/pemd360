import { Cause, Effect, Exit, Layer, ManagedRuntime, Option } from "effect";
import {
  ClientAuthentication,
  ClientAuthenticationLive,
} from "$lib/client/services/authentication";

export type ClientServices = ClientAuthentication;

export const clientRuntime = ManagedRuntime.make(ClientAuthenticationLive);

export function makeClientRuntime(): ManagedRuntime.ManagedRuntime<ClientServices, never>;
export function makeClientRuntime<R extends ClientServices>(
  layer: Layer.Layer<R, never, never>,
): ManagedRuntime.ManagedRuntime<R, never>;
export function makeClientRuntime<R extends ClientServices>(layer?: Layer.Layer<R, never, never>) {
  return ManagedRuntime.make(layer ?? ClientAuthenticationLive);
}

export type ClientSuccess<A> = { readonly _tag: "success"; readonly value: A };
export type ClientFailure<E> = { readonly _tag: "failure"; readonly error: E };
export type ClientDefect = { readonly _tag: "defect"; readonly cause: unknown };
export type ClientSkipped = { readonly _tag: "skipped" };
export type ClientResult<A, E> = ClientSuccess<A> | ClientFailure<E> | ClientDefect;

export async function runClientEffect<A, E>(
  effect: Effect.Effect<A, E, ClientServices>,
): Promise<ClientResult<A, E>> {
  return runWithClientRuntime(clientRuntime, effect);
}

export async function runClientBoundaryEffect<A, E>(
  effect: Effect.Effect<A, E>,
): Promise<ClientResult<A, E>> {
  return exitToClientResult(await Effect.runPromiseExit(effect));
}

export async function runWithClientRuntime<A, E, R extends ClientServices>(
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  effect: Effect.Effect<A, E, R>,
): Promise<ClientResult<A, E>> {
  return exitToClientResult(await runtime.runPromiseExit(effect));
}

function exitToClientResult<A, E>(exit: Exit.Exit<A, E>): ClientResult<A, E> {
  if (Exit.isSuccess(exit)) return { _tag: "success", value: exit.value };

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) return { _tag: "failure", error: failure.value };
  return { _tag: "defect", cause: Cause.squash(exit.cause) };
}
