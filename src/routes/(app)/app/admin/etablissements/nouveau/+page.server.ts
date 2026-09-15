import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import { createEstablishment, loadCompanyOptions } from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadCompanyOptions());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { societes: result.value };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const result = await runServerEffect(createEstablishment(formData));
    if (!isBoundarySuccess(result)) {
      return actionFailure(
        result,
        "message",
        "Erreur lors de la création",
        formDataForFailure(formData),
      );
    }
    if (result.value.insertedId !== null) {
      throw redirect(303, "/app/admin/etablissements/" + result.value.insertedId);
    }
    throw redirect(303, "/app/admin/etablissements");
  },
};
