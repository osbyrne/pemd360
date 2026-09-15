import { isBoundarySuccess, responseFailure } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { exportWasteInventory } from "$lib/server/workflows/exports";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const result = await runServerEffect(
    exportWasteInventory({
      user: locals.user,
      projectId: url.searchParams.get("projectId"),
    }),
  );
  if (!isBoundarySuccess(result)) return responseFailure(result, "Impossible de générer l'export");

  return new Response(result.value, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inventaire_pemd_dechets_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
};
