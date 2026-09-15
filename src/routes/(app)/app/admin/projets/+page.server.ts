import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import { deleteAdminProject, loadAdminProjects } from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadAdminProjects());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { projets: result.value };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(deleteAdminProject({ formData, user: locals.user }));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "error",
        "Erreur lors de la suppression",
        formDataForFailure(formData),
      );
    }
    return result.value;
  },
};
