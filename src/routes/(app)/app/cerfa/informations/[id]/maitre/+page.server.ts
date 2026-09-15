import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadMaitreOuvrage, saveMaitreOuvrage } from "$lib/server/workflows/cerfa";

export const load: PageServerLoad = async ({ params, locals }) => {
  const result = await runServerEffect(loadMaitreOuvrage(params.id, locals.user));
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { moa: result.value };
};

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(saveMaitreOuvrage(params.id, formData, locals.user));
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
