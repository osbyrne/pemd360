import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import { loadAdminProjectEdit, updateAdminProject } from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ params, parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadAdminProjectEdit(params.id));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const formData = await request.formData();
    const result = await runServerEffect(updateAdminProject(params.id, formData));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "message",
        "Erreur lors de la mise à jour",
        formDataForFailure(formData),
      );
    }
    throw redirect(303, "/app/admin/projets/" + result.value.updatedId);
  },
};
