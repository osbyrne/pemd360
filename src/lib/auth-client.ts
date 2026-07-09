import { createAuthClient } from "better-auth/svelte";
import { adminClient } from "better-auth/client/plugins";
import { ac, admin, user, collaborator } from "./auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
        collaborator,
      },
    }),
  ],
});
