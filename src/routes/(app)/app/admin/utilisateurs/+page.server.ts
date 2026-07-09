import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { projet, userProjet } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  // Charger tous les projets pour le dropdown
  const projets = await db
    .select({
      id: projet.id,
      libelle: projet.libelle,
      reference: projet.reference,
    })
    .from(projet);

  // Charger les associations utilisateur-projet
  const usersWithProjets = await db
    .select({
      userId: userProjet.userId,
      projetId: userProjet.projetId,
    })
    .from(userProjet);

  return {
    projets,
    usersWithProjets,
  };
};

export const actions: Actions = {
  setProjets: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const projetIds = formData.getAll("projetIds") as string[];

    if (!userId) {
      return fail(400, { error: "userId requis" });
    }

    try {
      // Supprimer toutes les associations existantes pour cet utilisateur
      await db.delete(userProjet).where(eq(userProjet.userId, userId));

      // Insérer les nouvelles associations
      if (projetIds.length > 0) {
        const newAssociations = projetIds.map((projetId) => ({
          userId,
          projetId,
        }));
        await db.insert(userProjet).values(newAssociations);
      }

      return { success: true };
    } catch (e) {
      console.error("Erreur mise à jour projets:", e);
      return fail(500, { error: "Erreur lors de la mise à jour" });
    }
  },
};
