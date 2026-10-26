import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import { runServerEffect } from "$lib/server/effect/runtime";
import { errorFailure, isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { loadCerfaProjects } from "$lib/server/workflows/cerfa";

export const load: LayoutServerLoad = async ({ params, url, locals }) => {
  const result = await runServerEffect(
    loadCerfaProjects({
      projectId: params.id ?? url.searchParams.get("projetId"),
      user: locals.user,
    }),
  );
  if (!isBoundarySuccess(result)) return errorFailure(result);
  if (!params.id && result.value.cerfaProject && !url.searchParams.get("projetId")) {
    const target = new URL(url);
    if (target.pathname === "/app/cerfa") target.pathname = "/app/cerfa/informations";
    target.searchParams.set("projetId", result.value.cerfaProject.id);
    redirect(307, target.pathname + target.search);
  }
  return result.value;
};
