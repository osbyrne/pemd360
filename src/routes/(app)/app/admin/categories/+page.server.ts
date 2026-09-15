import type { Actions, PageServerLoad } from "./$types";
import {
  createCategory,
  deleteCategory,
  loadCategoryAdminData,
  updateCategory,
} from "$lib/server/workflows/admin";
import { actionFailure, errorFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";

export const load: PageServerLoad = async () => {
  const result = await runServerEffect(loadCategoryAdminData());

  if (!isBoundarySuccess(result)) return errorFailure(result);
  const [categories, groupes] = result.value;
  return { categories, groupes };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const result = await runServerEffect(createCategory(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la création");
  },

  update: async ({ request }) => {
    const result = await runServerEffect(updateCategory(await request.formData()));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la mise à jour");
  },

  delete: async ({ request, locals }) => {
    const result = await runServerEffect(deleteCategory(await request.formData(), locals.user));
    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "message", "Erreur lors de la suppression");
  },
};
