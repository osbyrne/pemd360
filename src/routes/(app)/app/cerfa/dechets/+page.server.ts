import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadCerfaWaste } from "$lib/server/workflows/cerfa";

export const load: PageServerLoad = async ({ url, locals }) => {
  const result = await runServerEffect(
    loadCerfaWaste({
      projectId: url.searchParams.get("projetId"),
      user: locals.user,
    }),
  );
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};
