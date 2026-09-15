import type { Actions, PageServerLoad } from "./$types";
import {
  createObject,
  deleteObject,
  loadObjectAdminData,
  updateObject,
} from "$lib/server/workflows/admin";
import { actionFailure, errorFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";

export const load: PageServerLoad = async () => {
  const result = await runServerEffect(loadObjectAdminData());

  if (!isBoundarySuccess(result)) return errorFailure(result);
  const [objetsList, categories] = result.value;
  return { objets: objetsList, categories };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const result = await runServerEffect(createObject(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la création");
  },

  update: async ({ request }) => {
    const result = await runServerEffect(updateObject(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la mise à jour");
  },

  delete: async ({ request, locals }) => {
    const result = await runServerEffect(deleteObject(await request.formData(), locals.user));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la suppression");
  },
};
