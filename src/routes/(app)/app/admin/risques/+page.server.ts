import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { deleteRiskRecord, loadRiskInventory } from "$lib/server/workflows/inventory";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, "/login");

  const result = await runServerEffect(
    loadRiskInventory({
      user,
      projectId: url.searchParams.get("projectId"),
      q: "",
      requestedPage: 1,
      perPage: 1,
    }),
  );
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(deleteRiskRecord({ formData, user: locals.user }));
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
