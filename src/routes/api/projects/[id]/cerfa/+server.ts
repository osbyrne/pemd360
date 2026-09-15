import { isBoundarySuccess, responseFailure } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { generateCerfaPdfReport } from "$lib/server/workflows/reports";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, fetch, locals }) => {
  try {
    // Fetch the template PDF from static assets
    // Using fetch with relative path works in SvelteKit for static files
    const response = await fetch("/CERFA_Exemple.pdf");
    if (!response.ok) return new Response("Error generating PDF", { status: 500 });
    const templateBuffer = await response.arrayBuffer();

    const result = await runServerEffect(
      generateCerfaPdfReport({
        projectId: params.id,
        templateBuffer,
        user: locals.user,
      }),
    );
    if (!isBoundarySuccess(result)) return responseFailure(result, "Error generating PDF");

    return new Response(result.value as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="cerfa_${params.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error loading CERFA template:", error);
    return new Response("Error generating PDF", { status: 500 });
  }
};
