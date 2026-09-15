import { Context, Effect, Layer } from "effect";
import { AuthenticationProviderError } from "$lib/effect/errors";
import { getAuth, type Auth } from "$lib/auth";

export type PermissionInput = Parameters<Auth["api"]["userHasPermission"]>[0];
export type PermissionResult = Awaited<ReturnType<Auth["api"]["userHasPermission"]>>;

export type PermissionConfig =
  | {
      readonly resource: "project";
      readonly action: "create" | "share" | "update" | "delete" | "read";
    }
  | { readonly resource: "tags"; readonly action: "create" | "update" | "delete" | "read" }
  | {
      readonly resource: "user";
      readonly action:
        | "set-role"
        | "set-password"
        | "create"
        | "list"
        | "ban"
        | "impersonate"
        | "delete"
        | "get"
        | "update";
    }
  | { readonly resource: "session"; readonly action: "list" | "delete" | "revoke" };

export interface AuthorizationService {
  readonly userHasPermission: (
    input: PermissionInput,
  ) => Effect.Effect<PermissionResult, AuthenticationProviderError>;
  readonly checkPermission: (
    userId: string,
    permission: PermissionConfig,
  ) => Effect.Effect<PermissionResult, AuthenticationProviderError>;
}

export class Authorization extends Context.Tag("pemd360/Authorization")<
  Authorization,
  AuthorizationService
>() {}

export function makeAuthorizationService(
  getAuthClient: () => Auth = getAuth,
): AuthorizationService {
  return {
    userHasPermission: (input) =>
      Effect.tryPromise({
        try: () => getAuthClient().api.userHasPermission(input),
        catch: (cause) =>
          new AuthenticationProviderError({
            message: "Le service d'autorisation est indisponible",
            operation: "userHasPermission",
            cause,
          }),
      }),
    checkPermission: (userId, permission) =>
      Effect.tryPromise({
        try: () => getAuthClient().api.userHasPermission(permissionInput(userId, permission)),
        catch: (cause) =>
          new AuthenticationProviderError({
            message: "Le service d'autorisation est indisponible",
            operation: "userHasPermission",
            cause,
          }),
      }),
  };
}

function permissionInput(userId: string, permission: PermissionConfig): PermissionInput {
  switch (permission.resource) {
    case "project":
      return { body: { userId, permissions: { project: [permission.action] } } };
    case "tags":
      return { body: { userId, permissions: { tags: [permission.action] } } };
    case "user":
      return { body: { userId, permissions: { user: [permission.action] } } };
    case "session":
      return { body: { userId, permissions: { session: [permission.action] } } };
  }
}

export const AuthorizationLive = Layer.succeed(Authorization, makeAuthorizationService());
