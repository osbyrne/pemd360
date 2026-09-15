import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadProjectDetail } from "$lib/server/workflows/project";

export const load: PageServerLoad = async ({ params, locals }) => {
  const result = await runServerEffect(
    loadProjectDetail({ projectId: params.id, user: locals.user }),
  );
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};
