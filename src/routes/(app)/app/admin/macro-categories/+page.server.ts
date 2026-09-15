import type { Actions, PageServerLoad } from "./$types";
import { actionFailure, errorFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";
import {
  createGroup,
  deleteGroup,
  loadGroupAdminData,
  updateGroup,
} from "$lib/server/workflows/admin";

export const load: PageServerLoad = async () => {
  const result = await runServerEffect(loadGroupAdminData());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { groupes: result.value };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const result = await runServerEffect(createGroup(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la création de groupe");
  },
  update: async ({ request }) => {
    const result = await runServerEffect(updateGroup(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la mise à jour de groupe");
  },
  delete: async ({ request, locals }) => {
    const result = await runServerEffect(deleteGroup(await request.formData(), locals.user));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la suppression");
  },
};
