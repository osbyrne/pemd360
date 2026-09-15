import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import {
  loadUserProjectAssignments,
  setUserProjectAssignments,
} from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadUserProjectAssignments());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};

export const actions: Actions = {
  setProjets: async ({ request }) => {
    const formData = await request.formData();
    const result = await runServerEffect(setUserProjectAssignments(formData));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "error",
        "Erreur lors de la mise à jour",
        formDataForFailure(formData),
      );
    }
    return result.value;
  },
};
