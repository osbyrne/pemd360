import { Context, Effect, Layer } from "effect";
import { retryTransientRead } from "$lib/server/effect/transient-read";
import { AuthenticationProviderError } from "$lib/effect/errors";
import { getAuth, type Auth } from "$lib/auth";

export type SessionInput = Parameters<Auth["api"]["getSession"]>[0];
export type SessionResult = Awaited<ReturnType<Auth["api"]["getSession"]>>;

export interface AuthenticationService {
  readonly getSession: (
    input: SessionInput,
  ) => Effect.Effect<SessionResult, AuthenticationProviderError>;
}

export class Authentication extends Context.Service<Authentication, AuthenticationService>()(
  "pemd360/Authentication",
) {}

export function makeAuthenticationService(
  getAuthClient: () => Auth = getAuth,
): AuthenticationService {
  return {
    getSession: (input) =>
      retryTransientRead(
        Effect.tryPromise({
          try: () => getAuthClient().api.getSession(input),
          catch: (cause) =>
            new AuthenticationProviderError({
              message: "Le service d'authentification est indisponible",
              operation: "getSession",
              cause,
            }),
        }),
      ).pipe(
        Effect.timeoutOrElse({
          duration: "15 seconds",
          orElse: () =>
            Effect.fail(
              new AuthenticationProviderError({
                message: "Le service d'authentification est indisponible",
                operation: "getSession",
                cause: new Error("Session lookup timed out"),
              }),
            ),
        }),
      ),
  };
}

export const AuthenticationLive = Layer.succeed(Authentication, makeAuthenticationService());
