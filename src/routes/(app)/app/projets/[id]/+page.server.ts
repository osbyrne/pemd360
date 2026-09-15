import { env } from "$env/dynamic/private";
import type { Actions, PageServerLoad } from "./$types";
import { actionFailure, errorFailure } from "$lib/server/effect/sveltekit";
import { isBoundarySuccess, runServerEffect } from "$lib/server/effect/runtime";
import { createPemdTag, deletePemdTag, loadProjectViewer } from "$lib/server/workflows/project";

export const load: PageServerLoad = async ({ params, locals }) => {
  const result = await runServerEffect(
    loadProjectViewer({
      projectId: params.id,
      user: locals.user,
      matterportSdkKey: env.MATTERPORT_SDK_KEY,
    }),
  );

  if (isBoundarySuccess(result)) return result.value;
  return errorFailure(result);
};

export const actions: Actions = {
  createPemdTag: async ({ request, params, locals }) => {
    const result = await runServerEffect(
      createPemdTag({
        projectId: params.id,
        user: locals.user,
        formData: await request.formData(),
      }),
    );

    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "error", "Échec de la création du tag");
  },

  deletePemdTag: async ({ request, locals }) => {
    const result = await runServerEffect(
      deletePemdTag({
        user: locals.user,
        formData: await request.formData(),
      }),
    );

    if (isBoundarySuccess(result)) return result.value;
    return actionFailure(result, "error", "Échec de la suppression du tag");
  },
};
