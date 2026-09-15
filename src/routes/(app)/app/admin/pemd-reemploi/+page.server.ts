import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { actionFailure, errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { formDataForFailure } from "$lib/effect/schemas/forms";
import {
  deletePemdRecord,
  loadReuseInventory,
  parsePositiveInt,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
} from "$lib/server/workflows/inventory";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) throw redirect(302, "/login");

  const result = await runServerEffect(
    loadReuseInventory({
      user,
      projectId: url.searchParams.get("projectId"),
      q: url.searchParams.get("q")?.trim() ?? "",
      requestedPage: parsePositiveInt(url.searchParams.get("page"), 1),
      perPage: Math.min(
        parsePositiveInt(url.searchParams.get("perPage"), DEFAULT_PER_PAGE),
        MAX_PER_PAGE,
      ),
    }),
  );
  if (!isBoundarySuccess(result)) return errorFailure(result);
  return result.value;
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const result = await runServerEffect(
      deletePemdRecord({
        formData,
        user: locals.user,
        permission: { resource: "tags", action: "delete" },
        operation: "inventory.reuse",
      }),
    );
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
