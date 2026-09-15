import { isBoundarySuccess, responseFailure } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { exportCerfaWaste } from "$lib/server/workflows/exports";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const result = await runServerEffect(
    exportCerfaWaste({
      user: locals.user,
      projectId: url.searchParams.get("projetId"),
    }),
  );
  if (!isBoundarySuccess(result)) return responseFailure(result, "Impossible de générer l'export");

  return new Response(result.value, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="caracterisation_dechets.xlsx"`,
    },
  });
};
