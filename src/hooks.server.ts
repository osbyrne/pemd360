import { getAuth } from "$lib/auth";
import { Effect } from "effect";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { error, redirect, type Handle } from "@sveltejs/kit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { Authentication } from "$lib/server/services/authentication";

export const handle: Handle = async ({ event, resolve }) => {
  const auth = getAuth();
  const sessionResult = await runServerEffect(
    Effect.gen(function* () {
      const authentication = yield* Authentication;
      return yield* authentication.getSession({ headers: event.request.headers });
    }),
  );

  if (sessionResult._tag === "defect") {
    console.error("Unexpected authentication defect:", sessionResult.cause);
    throw error(500, "Le service d'authentification est indisponible");
  }
  if (sessionResult._tag === "failure") {
    console.error("Authentication provider failure:", sessionResult.error.cause);
    throw error(500, "Le service d'authentification est indisponible");
  }

  const session = sessionResult.value;

  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  const url = event.url.pathname;

  if (url.startsWith("/app")) {
    if (!session?.user) {
      throw redirect(303, "/login");
    }
    if (url === "/app") {
      throw redirect(303, "/app/projets");
    }
  }

  if ((url === "/login" || url === "/signup") && session?.user) {
    throw redirect(303, "/app/projets");
  }

  if (url.startsWith("/app/admin")) {
    if (!session?.user) {
      throw redirect(303, "/login");
    }
    if (url === "/app/") {
      throw redirect(303, "/app/projets");
    }
  }

  return svelteKitHandler({ event, resolve, auth, building });
};
