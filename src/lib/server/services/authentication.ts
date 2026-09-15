import { Context, Effect, Layer } from "effect";
import { AuthenticationProviderError } from "$lib/effect/errors";
import { getAuth, type Auth } from "$lib/auth";

export type SessionInput = Parameters<Auth["api"]["getSession"]>[0];
export type SessionResult = Awaited<ReturnType<Auth["api"]["getSession"]>>;

export interface AuthenticationService {
  readonly getSession: (
    input: SessionInput,
  ) => Effect.Effect<SessionResult, AuthenticationProviderError>;
}

export class Authentication extends Context.Tag("pemd360/Authentication")<
  Authentication,
  AuthenticationService
>() {}

export function makeAuthenticationService(
  getAuthClient: () => Auth = getAuth,
): AuthenticationService {
  return {
    getSession: (input) =>
      Effect.tryPromise({
        try: () => getAuthClient().api.getSession(input),
        catch: (cause) =>
          new AuthenticationProviderError({
            message: "Le service d'authentification est indisponible",
            operation: "getSession",
            cause,
          }),
      }),
  };
}

export const AuthenticationLive = Layer.succeed(Authentication, makeAuthenticationService());
