import { db } from "$lib/server/db/client";
import { tagsAmiante, tagsPlomb, tagsTermite, projet } from "$lib/server/db/schema";
import { validateExportAuth, buildProjectConditions } from "$lib/server/db/queries";
import { eq, and } from "drizzle-orm";
import { generateRiskExcel } from "$lib/server/excel";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const authResult = await validateExportAuth(locals.user, url.searchParams.get("projectId"));

  if (!authResult.authorized) {
    return authResult.error;
  }

  const amianteConditions = buildProjectConditions(
    tagsAmiante.sidId,
    authResult.allowedProjectIds,
    authResult.projectId,
  );
  const plombConditions = buildProjectConditions(
    tagsPlomb.sidId,
    authResult.allowedProjectIds,
    authResult.projectId,
  );
  const termiteConditions = buildProjectConditions(
    tagsTermite.sidId,
    authResult.allowedProjectIds,
    authResult.projectId,
  );

  let amianteQuery = db
    .select({
      id: tagsAmiante.id,
      label: tagsAmiante.label,
      description: tagsAmiante.description,
      etage: tagsAmiante.etage,
      type: tagsAmiante.type,
      projetId: tagsAmiante.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsAmiante)
    .leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

  let plombQuery = db
    .select({
      id: tagsPlomb.id,
      label: tagsPlomb.label,
      description: tagsPlomb.description,
      etage: tagsPlomb.etage,
      type: tagsPlomb.id,
      projetId: tagsPlomb.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsPlomb)
    .leftJoin(projet, eq(tagsPlomb.sidId, projet.id));

  let termiteQuery = db
    .select({
      id: tagsTermite.id,
      label: tagsTermite.label,
      description: tagsTermite.description,
      etage: tagsTermite.etage,
      type: tagsTermite.id,
      projetId: tagsTermite.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsTermite)
    .leftJoin(projet, eq(tagsTermite.sidId, projet.id));

  if (amianteConditions.length > 0) {
    amianteQuery.where(and(...amianteConditions));
  }

  if (plombConditions.length > 0) {
    plombQuery.where(and(...plombConditions));
  }

  if (termiteConditions.length > 0) {
    termiteQuery.where(and(...termiteConditions));
  }

  const [amianteList, plombList, termiteList] = await Promise.all([
    amianteQuery.all(),
    plombQuery.all(),
    termiteQuery.all(),
  ]);

  const list = [
    ...amianteList.map((item) => ({ ...item, type: "Amiante" })),
    ...plombList.map((item) => ({ ...item, type: "Plomb" })),
    ...termiteList.map((item) => ({ ...item, type: "Termites" })),
  ];

  const buffer = await generateRiskExcel(list, "Risques");

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="inventaire_risques_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
};
