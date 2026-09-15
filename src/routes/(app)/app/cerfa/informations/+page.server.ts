import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadCerfaInformationList } from "$lib/server/workflows/cerfa";

export const load: PageServerLoad = async ({ locals }) => {
  const result = await runServerEffect(loadCerfaInformationList(locals.user));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};
