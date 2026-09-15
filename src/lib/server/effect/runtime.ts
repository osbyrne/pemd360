import { Cause, Effect, Exit, Layer, ManagedRuntime, Option } from "effect";
import { Database, DatabaseLive } from "$lib/server/services/database";
import { Authorization, AuthorizationLive } from "$lib/server/services/authorization";
import { Authentication, AuthenticationLive } from "$lib/server/services/authentication";
import { Email, EmailLive } from "$lib/server/services/email";
import { Report, ReportLive } from "$lib/server/services/report";
import { Storage, StorageLive } from "$lib/server/services/storage";

export type ServerServices = Database | Authorization | Authentication | Storage | Email | Report;
export const ServerLive = Layer.mergeAll(
  DatabaseLive,
  AuthorizationLive,
  AuthenticationLive,
  StorageLive,
  EmailLive,
  ReportLive,
);

export const serverRuntime = ManagedRuntime.make(ServerLive);

export function makeServerRuntime(): ManagedRuntime.ManagedRuntime<ServerServices, never>;
export function makeServerRuntime<R extends ServerServices>(
  layer: Layer.Layer<R, never, never>,
): ManagedRuntime.ManagedRuntime<R, never>;
export function makeServerRuntime<R extends ServerServices>(layer?: Layer.Layer<R, never, never>) {
  return ManagedRuntime.make(layer ?? ServerLive);
}

export type BoundarySuccess<A> = {
  readonly _tag: "success";
  readonly value: A;
};

export type BoundaryFailure<E> = {
  readonly _tag: "failure";
  readonly error: E;
};

export type BoundaryDefect = {
  readonly _tag: "defect";
  readonly cause: unknown;
};

export type BoundaryResult<A, E> = BoundarySuccess<A> | BoundaryFailure<E> | BoundaryDefect;

/** The only shared server execution point. Request data is supplied by each Effect invocation. */
export async function runServerEffect<A, E>(
  effect: Effect.Effect<A, E, ServerServices>,
): Promise<BoundaryResult<A, E>> {
  return runWithServerRuntime(serverRuntime, effect);
}

export async function runWithServerRuntime<A, E, R extends ServerServices>(
  runtime: ManagedRuntime.ManagedRuntime<R, never>,
  effect: Effect.Effect<A, E, R>,
): Promise<BoundaryResult<A, E>> {
  const exit = await runtime.runPromiseExit(effect);

  if (Exit.isSuccess(exit)) {
    return { _tag: "success", value: exit.value };
  }

  const failure = Cause.failureOption(exit.cause);
  if (Option.isSome(failure)) {
    return { _tag: "failure", error: failure.value };
  }

  return { _tag: "defect", cause: Cause.squash(exit.cause) };
}

export function isBoundarySuccess<A, E>(
  result: BoundaryResult<A, E>,
): result is BoundarySuccess<A> {
  return result._tag === "success";
}
