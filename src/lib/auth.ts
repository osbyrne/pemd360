import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { getRequestEvent } from "$app/server";
import { env } from "$env/dynamic/private";
import { db } from "./server/db/client";
import * as schema from "./server/db/schema";
import { sendPasswordResetEmail } from "./server/email/resend";
import { admin } from "better-auth/plugins";

import { ac, admin as adminRole, user, collaborator } from "./auth/permissions";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schema,
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        recipientName: user.name,
        resetUrl: url,
      });
    },
  },
  plugins: [
    sveltekitCookies(getRequestEvent),
    admin({
      ac,
      roles: {
        admin: adminRole,
        user,
        collaborator,
      },
    }),
  ],
});
