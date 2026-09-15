import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadProjectList } from "$lib/server/workflows/project";

export const load: PageServerLoad = async ({ locals }) => {
  const result = await runServerEffect(loadProjectList(locals.user));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { projets: result.value };
};
