import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadDiagnostic, saveDiagnostic } from "$lib/server/workflows/cerfa";

export const load: PageServerLoad = async ({ params, locals }) => {
  const result = await runServerEffect(loadDiagnostic(params.id, locals.user));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { diagnostic: result.value };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(saveDiagnostic(params.id, formData, locals.user));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "message",
        "Erreur lors de l'enregistrement",
        formDataForFailure(formData),
      );
    }
    throw redirect(303, "/app/cerfa/informations?projetId=" + params.id);
  },
};
