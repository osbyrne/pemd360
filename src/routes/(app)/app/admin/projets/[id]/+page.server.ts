import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { db } from "$lib/server/db/client";
import { projet, etablissement, societe } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/server/admin";

export const load: PageServerLoad = async ({ params, parent }) => {
  await requireAdmin(parent);

  const { id } = params;

  const result = await db
    .select({
      id: projet.id,
      libelle: projet.libelle,
      reference: projet.reference,
      codeInsee: projet.codeInsee,
      rue: projet.rue,
      cp: projet.cp,
      ville: projet.ville,
      dateDemarrage: projet.dateDemarrage,
      dateDeFin: projet.dateDeFin,
      section: projet.section,
      parcelle: projet.parcelle,
      typeOperation: projet.typeOperation,
      maitreDOuvrage: projet.maitreDOuvrage,
      etablissementId: projet.etablissementId,
      etablissementNom: etablissement.nom,
      etablissementVille: etablissement.ville,
      societeId: societe.id,
      societeNom: societe.nom,
    })
    .from(projet)
    .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
    .leftJoin(societe, eq(etablissement.societeId, societe.id))
    .where(eq(projet.id, id));

  if (result.length === 0) {
    throw error(404, "Projet non trouvé");
  }

  return {
    projet: result[0],
  };
};
