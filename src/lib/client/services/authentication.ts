import { Context, Effect, Layer } from "effect";
import { AuthenticationProviderError, ValidationError } from "$lib/effect/errors";
import { authClient } from "$lib/auth-client";

export type ClientRole = "user" | "collaborator" | "admin";

export type ClientUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role?: string;
  readonly banned: boolean;
  readonly image: string | null;
  readonly createdAt: Date;
  readonly emailVerified: boolean;
};

export type ClientUserPage = {
  readonly users: readonly ClientUser[];
  readonly total: number;
};

export type ClientAuthenticationApi = {
  readonly signIn: {
    readonly email: (input: {
      readonly email: string;
      readonly password: string;
    }) => Promise<unknown>;
  };
  readonly signOut: () => Promise<unknown>;
  readonly admin: {
    readonly createUser: (input: {
      readonly email: string;
      readonly password: string;
      readonly name: string;
      readonly role: ClientRole;
    }) => Promise<unknown>;
    readonly listUsers: (input: {
      readonly query: {
        readonly limit: number;
        readonly sortBy: "createdAt";
        readonly sortDirection: "asc" | "desc";
      };
    }) => Promise<unknown>;
    readonly setRole: (input: {
      readonly userId: string;
      readonly role: ClientRole;
    }) => Promise<unknown>;
    readonly setUserPassword: (input: {
      readonly userId: string;
      readonly newPassword: string;
    }) => Promise<unknown>;
    readonly banUser: (input: {
      readonly userId: string;
      readonly banReason: string;
    }) => Promise<unknown>;
    readonly unbanUser: (input: { readonly userId: string }) => Promise<unknown>;
    readonly removeUser: (input: { readonly userId: string }) => Promise<unknown>;
  };
};

export interface ClientAuthenticationService {
  readonly signInEmail: (input: {
    readonly email: string;
    readonly password: string;
  }) => Effect.Effect<void, AuthenticationProviderError | ValidationError>;
  readonly signOut: () => Effect.Effect<void, AuthenticationProviderError>;
  readonly createUser: (input: {
    readonly email: string;
    readonly password: string;
    readonly name: string;
    readonly role: ClientRole;
  }) => Effect.Effect<{ readonly userId: string }, AuthenticationProviderError>;
  readonly listUsers: (input: {
    readonly limit: number;
    readonly sortBy: "createdAt";
    readonly sortDirection: "asc" | "desc";
  }) => Effect.Effect<ClientUserPage, AuthenticationProviderError>;
  readonly setRole: (input: {
    readonly userId: string;
    readonly role: ClientRole;
  }) => Effect.Effect<void, AuthenticationProviderError>;
  readonly setUserPassword: (input: {
    readonly userId: string;
    readonly newPassword: string;
  }) => Effect.Effect<void, AuthenticationProviderError>;
  readonly banUser: (input: {
    readonly userId: string;
    readonly banReason: string;
  }) => Effect.Effect<void, AuthenticationProviderError>;
  readonly unbanUser: (input: {
    readonly userId: string;
  }) => Effect.Effect<void, AuthenticationProviderError>;
  readonly removeUser: (input: {
    readonly userId: string;
  }) => Effect.Effect<void, AuthenticationProviderError>;
}

export class ClientAuthentication extends Context.Tag("pemd360/ClientAuthentication")<
  ClientAuthentication,
  ClientAuthenticationService
>() {}

export function makeClientAuthenticationService(
  client: ClientAuthenticationApi = authClient,
): ClientAuthenticationService {
  return {
    signInEmail: (input) => {
      if (!input.email.trim() || !input.password) {
        return Effect.fail(new ValidationError({ message: "Tous les champs sont requis" }));
      }
      return request("auth.sign-in", () => client.signIn.email(input)).pipe(
        Effect.map(() => undefined),
      );
    },
    signOut: () =>
      request("auth.sign-out", () => client.signOut()).pipe(Effect.map(() => undefined)),
    createUser: (input) =>
      request("auth.admin.create-user", () => client.admin.createUser(input)).pipe(
        Effect.flatMap((response) => {
          const data = responseData(response);
          if (!isRecord(data) || !isRecord(data.user) || typeof data.user.id !== "string") {
            return Effect.fail(
              providerError(
                "auth.admin.create-user",
                "La création de l'utilisateur a échoué",
                data,
              ),
            );
          }
          return Effect.succeed({ userId: data.user.id });
        }),
      ),
    listUsers: (input) =>
      request("auth.admin.list-users", () => client.admin.listUsers({ query: input })).pipe(
        Effect.flatMap((response) => {
          const data = responseData(response);
          if (!isRecord(data) || !Array.isArray(data.users)) {
            return Effect.fail(
              providerError(
                "auth.admin.list-users",
                "Le chargement des utilisateurs a échoué",
                data,
              ),
            );
          }
          const users = data.users.flatMap((value) => {
            const user = decodeUser(value);
            return user ? [user] : [];
          });
          return Effect.succeed({
            users,
            total: typeof data.total === "number" ? data.total : users.length,
          });
        }),
      ),
    setRole: (input) =>
      request("auth.admin.set-role", () => client.admin.setRole(input)).pipe(
        Effect.map(() => undefined),
      ),
    setUserPassword: (input) =>
      request("auth.admin.set-password", () => client.admin.setUserPassword(input)).pipe(
        Effect.map(() => undefined),
      ),
    banUser: (input) =>
      request("auth.admin.ban-user", () => client.admin.banUser(input)).pipe(
        Effect.map(() => undefined),
      ),
    unbanUser: (input) =>
      request("auth.admin.unban-user", () => client.admin.unbanUser(input)).pipe(
        Effect.map(() => undefined),
      ),
    removeUser: (input) =>
      request("auth.admin.remove-user", () => client.admin.removeUser(input)).pipe(
        Effect.map(() => undefined),
      ),
  };
}

export const ClientAuthenticationLive = Layer.succeed(
  ClientAuthentication,
  makeClientAuthenticationService(),
);

function request(operation: string, call: () => Promise<unknown>) {
  return Effect.tryPromise({
    try: call,
    catch: (cause) =>
      providerError(operation, "Le service d'authentification est indisponible", cause),
  }).pipe(
    Effect.flatMap((response) => {
      if (!isRecord(response)) {
        return Effect.fail(
          providerError(operation, "Réponse d'authentification invalide", response),
        );
      }
      if (response.error) {
        return Effect.fail(
          providerError(operation, providerMessage(response.error), response.error),
        );
      }
      return Effect.succeed(response);
    }),
  );
}

function providerError(operation: string, message: string, cause: unknown) {
  return new AuthenticationProviderError({ message, operation, cause });
}

function providerMessage(value: unknown): string {
  if (isRecord(value) && typeof value.message === "string" && value.message.trim())
    return value.message;
  return "Le service d'authentification a refusé l'opération";
}

function responseData(value: unknown): unknown {
  return isRecord(value) ? value.data : undefined;
}

function decodeUser(value: unknown): ClientUser | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string"
  ) {
    return undefined;
  }
  const date =
    value.createdAt instanceof Date ? value.createdAt : new Date(String(value.createdAt ?? ""));
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    role: typeof value.role === "string" ? value.role : undefined,
    banned: value.banned === true,
    image: typeof value.image === "string" ? value.image : null,
    createdAt: Number.isNaN(date.getTime()) ? new Date(0) : date,
    emailVerified: value.emailVerified === true,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
