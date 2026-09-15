import type { Actions, PageServerLoad } from "./$types";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { requireAdmin } from "$lib/server/admin";
import {
  createCompany,
  deleteCompany,
  loadCompanies,
  updateCompany,
} from "$lib/server/workflows/administration";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);
  const result = await runServerEffect(loadCompanies());
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return { societes: result.value };
};

export const actions: Actions = {
  update: async ({ request }) =>
    runCompanyAction(request, updateCompany, "Erreur lors de la mise à jour"),
  create: async ({ request }) =>
    runCompanyAction(request, createCompany, "Erreur lors de la création"),
  delete: async ({ request }) =>
    runCompanyAction(request, deleteCompany, "Erreur lors de la suppression"),
};

async function runCompanyAction(
  request: Request,
  operation: (formData: FormData) => ReturnType<typeof updateCompany>,
  fallback: string,
) {
  const formData = await request.formData();
  const result = await runServerEffect(operation(formData));
  if (!isBoundarySuccess(result)) {
    return actionFailure(result, "error", fallback, formDataForFailure(formData));
  }
  return result.value;
}
