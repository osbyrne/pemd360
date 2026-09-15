import type { PageServerLoad } from "./$types";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import { loadAdminProject } from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ params, parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadAdminProject(params.id));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { projet: result.value };
};
