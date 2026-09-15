import type { Actions, PageServerLoad } from "./$types";
import {
  createNature,
  deleteNature,
  loadNatureAdminData,
  updateNature,
} from "$lib/server/workflows/admin";
import { actionFailure, errorFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";

export const load: PageServerLoad = async () => {
  const result = await runServerEffect(loadNatureAdminData());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { natures: result.value };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const result = await runServerEffect(createNature(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la création");
  },

  update: async ({ request }) => {
    const result = await runServerEffect(updateNature(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la mise à jour");
  },

  delete: async ({ request, locals }) => {
    const result = await runServerEffect(deleteNature(await request.formData(), locals.user));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la suppression");
  },
};
