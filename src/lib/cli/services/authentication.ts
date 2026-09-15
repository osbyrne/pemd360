import { Context, Effect, Layer } from "effect";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { AuthenticationProviderError } from "../../effect/errors";
import type { AdminTransaction } from "./database";
import { ac, admin, collaborator, user as userRole } from "../../auth/permissions";
import * as schema from "../../server/db/schema";

export type AdminUserInput = {
  readonly email: string;
  readonly name: string;
  readonly password: string;
};

export interface AdminAuthenticationService {
  readonly createUser: (
    database: AdminTransaction,
    input: AdminUserInput,
  ) => Effect.Effect<{ readonly email: string }, AuthenticationProviderError>;
}

export class AdminAuthentication extends Context.Tag("pemd360/cli/AdminAuthentication")<
  AdminAuthentication,
  AdminAuthenticationService
>() {}

export function makeAdminAuthenticationService(config: {
  readonly secret: string;
  readonly baseURL?: string;
}): AdminAuthenticationService {
  return {
    createUser: (database, input) =>
      Effect.tryPromise({
        try: async () => {
          const auth = betterAuth({
            secret: config.secret,
            baseURL: config.baseURL,
            database: drizzleAdapter(database, {
              provider: "sqlite",
              schema,
            }),
            emailAndPassword: { enabled: true, disableSignUp: true },
            plugins: [
              adminPlugin({
                ac,
                roles: { admin, user: userRole, collaborator },
              }),
            ],
          });
          const created: unknown = await auth.api.createUser({
            body: { email: input.email, name: input.name, password: input.password, role: "admin" },
          });
          if (!isRecord(created)) {
            throw new Error(returnedErrorMessage({}));
          }
          const createdUser = created.user;
          if (!isRecord(createdUser) || typeof createdUser.email !== "string") {
            throw new Error(returnedErrorMessage(created));
          }
          return { email: createdUser.email };
        },
        catch: (cause) =>
          new AuthenticationProviderError({
            message: "La création du compte administrateur a échoué",
            operation: "cli.admin.create-user",
            cause,
          }),
      }),
  };
}

export function makeAdminAuthenticationLayer(config: {
  readonly secret: string;
  readonly baseURL?: string;
}): Layer.Layer<AdminAuthentication> {
  return Layer.succeed(AdminAuthentication, makeAdminAuthenticationService(config));
}

function returnedErrorMessage(value: Record<string, unknown>): string {
  const error = value.error;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "Better Auth n'a pas retourné le compte créé";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
