import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import { deleteEstablishment, loadEstablishments } from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadEstablishments());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { etablissements: result.value };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(deleteEstablishment({ formData, user: locals.user }));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "message",
        "Erreur lors de la suppression",
        formDataForFailure(formData),
      );
    }
    return result.value;
  },
};
