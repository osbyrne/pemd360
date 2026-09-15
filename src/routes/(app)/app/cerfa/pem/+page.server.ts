import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadCerfaPem } from "$lib/server/workflows/cerfa";

export const load: PageServerLoad = async () => {
  const result = await runServerEffect(loadCerfaPem());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};
