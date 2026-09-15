import { betterAuth } from "better-auth";
import { Effect } from "effect";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { getDatabase } from "./server/db/client";
import * as schema from "./server/db/schema";
import { makeEmailService } from "./server/services/email";
import { admin } from "better-auth/plugins";

import { ac, admin as adminRole, user, collaborator } from "./auth/permissions";

function createAuth() {
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDatabase(), {
      provider: "sqlite",
      schema: schema,
    }),

    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async ({ user, url }) => {
        const email = makeEmailService();
        await Effect.runPromise(
          email.sendPasswordResetEmail({
            to: user.email,
            recipientName: user.name,
            resetUrl: url,
          }),
        );
      },
    },
    plugins: [
      admin({
        ac,
        roles: {
          admin: adminRole,
          user,
          collaborator,
        },
      }),
      sveltekitCookies(getRequestEvent),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;

let cachedAuth: Auth | undefined;

/** Build Better Auth only when an authentication operation is actually requested. */
export function getAuth(): Auth {
  cachedAuth ??= createAuth();
  return cachedAuth;
}
