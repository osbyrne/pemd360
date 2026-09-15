import { Effect } from "effect";
import { AuthenticationProviderError, ValidationError } from "$lib/effect/errors";
import {
  ClientAuthentication,
  type ClientAuthenticationService,
  type ClientRole,
} from "$lib/client/services/authentication";

type ClientAuthError = AuthenticationProviderError | ValidationError;

export function signIn(input: {
  readonly email: string;
  readonly password: string;
}): Effect.Effect<void, ClientAuthError, ClientAuthentication> {
  return Effect.gen(function* () {
    const authentication = yield* ClientAuthentication;
    yield* authentication.signInEmail(input);
  });
}

export function signOut(): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return Effect.gen(function* () {
    const authentication = yield* ClientAuthentication;
    yield* authentication.signOut();
  });
}

export type UserCreationResult = {
  readonly userId: string;
  readonly assignment: "not-requested" | "succeeded" | "partial";
  readonly assignmentError?: AuthenticationProviderError;
};

export function createUserWithAssignments(input: {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly role: ClientRole;
  readonly projectIds: readonly string[];
  readonly assignProjects?: (
    userId: string,
    projectIds: readonly string[],
  ) => Effect.Effect<void, AuthenticationProviderError>;
}): Effect.Effect<UserCreationResult, AuthenticationProviderError, ClientAuthentication> {
  return Effect.gen(function* () {
    const authentication = yield* ClientAuthentication;
    const created = yield* authentication.createUser(input);
    if (input.projectIds.length === 0 || !input.assignProjects) {
      return { userId: created.userId, assignment: "not-requested" };
    }

    const assignment = yield* input
      .assignProjects(created.userId, input.projectIds)
      .pipe(Effect.either);
    if (assignment._tag === "Left") {
      return {
        userId: created.userId,
        assignment: "partial",
        assignmentError: assignment.left,
      };
    }
    return { userId: created.userId, assignment: "succeeded" };
  });
}

export function setUserRole(input: {
  readonly userId: string;
  readonly role: ClientRole;
}): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return withAuthentication((authentication) => authentication.setRole(input));
}

export function setUserPassword(input: {
  readonly userId: string;
  readonly newPassword: string;
}): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return withAuthentication((authentication) => authentication.setUserPassword(input));
}

export function banUser(input: {
  readonly userId: string;
  readonly banReason: string;
}): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return withAuthentication((authentication) => authentication.banUser(input));
}

export function unbanUser(input: {
  readonly userId: string;
}): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return withAuthentication((authentication) => authentication.unbanUser(input));
}

export function removeUser(input: {
  readonly userId: string;
}): Effect.Effect<void, AuthenticationProviderError, ClientAuthentication> {
  return withAuthentication((authentication) => authentication.removeUser(input));
}

export function listUsers(input: {
  readonly limit: number;
  readonly sortBy: "createdAt";
  readonly sortDirection: "asc" | "desc";
}) {
  return withAuthentication((authentication) => authentication.listUsers(input));
}

function withAuthentication<A, E>(
  operation: (authentication: ClientAuthenticationService) => Effect.Effect<A, E>,
): Effect.Effect<A, E, ClientAuthentication> {
  return Effect.gen(function* () {
    const authentication = yield* ClientAuthentication;
    return yield* operation(authentication);
  });
}
