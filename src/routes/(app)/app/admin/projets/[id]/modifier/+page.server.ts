import { error, fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { projet, etablissement, societe } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/server/admin";

export const load: PageServerLoad = async ({ params, parent }) => {
  await requireAdmin(parent);

  const { id } = params;

  // Récupérer le projet
  const result = await db.select().from(projet).where(eq(projet.id, id));

  if (result.length === 0) {
    throw error(404, "Projet non trouvé");
  }

  // Récupérer les établissements avec leurs sociétés
  const etablissements = await db
    .select({
      id: etablissement.id,
      nom: etablissement.nom,
      societeId: etablissement.societeId,
      societeNom: societe.nom,
    })
    .from(etablissement)
    .leftJoin(societe, eq(etablissement.societeId, societe.id));

  return {
    projet: result[0],
    etablissements,
  };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();

    const data = {
      libelle: (formData.get("libelle") as string) || "",
      reference: (formData.get("reference") as string) || "",
      etablissementId: parseInt(formData.get("etablissementId") as string) || 0,
      codeInsee: (formData.get("codeInsee") as string) || "",
      rue: (formData.get("rue") as string) || "",
      cp: (formData.get("cp") as string) || "",
      ville: (formData.get("ville") as string) || "",
      dateDemarrage: formData.get("dateDemarrage")
        ? new Date(formData.get("dateDemarrage") as string).getTime()
        : new Date().getTime(),
      section: (formData.get("section") as string) || "",
      parcelle: (formData.get("parcelle") as string) || "",
      typeOperation: (formData.get("typeOperation") as string) || null,
      maitreDOuvrage: (formData.get("maitreDOuvrage") as string) || null,
      dateDeFin: formData.get("dateDeFin")
        ? new Date(formData.get("dateDeFin") as string).getTime()
        : null,
    };

    // Validation des champs obligatoires
    if (
      !data.libelle ||
      !data.reference ||
      !data.etablissementId ||
      !data.rue ||
      !data.ville ||
      !data.section ||
      !data.parcelle
    ) {
      return fail(400, {
        data,
        message: "Veuillez remplir tous les champs obligatoires",
        success: false,
      });
    }

    try {
      await db.update(projet).set(data).where(eq(projet.id, id));

      throw redirect(303, `/app/admin/projets/${id}`);
    } catch (e) {
      if (e && typeof e === "object" && "status" in e && (e as any).status === 303) {
        throw e;
      }
      console.error("Erreur mise à jour projet:", e);
      return fail(500, {
        data,
        message:
          "Erreur lors de la mise à jour: " + (e instanceof Error ? e.message : "Erreur inconnue"),
        success: false,
      });
    }
  },
};
