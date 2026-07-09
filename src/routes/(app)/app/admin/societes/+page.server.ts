import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { societe } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "$lib/server/admin";

export const load: PageServerLoad = async ({ parent }) => {
  await requireAdmin(parent);

  const societes = await db.select().from(societe);

  return {
    societes,
  };
};

export const actions: Actions = {
  update: async ({ request, locals }) => {
    const formData = await request.formData();

    const id = Number(formData.get("id"));
    const nom = (formData.get("nom") as string) || "";
    const raisonSocial = (formData.get("raisonSocial") as string) || "";
    const rue = (formData.get("rue") as string) || "";
    const cp = (formData.get("cp") as string) || "";
    const ville = (formData.get("ville") as string) || "";
    const tel = (formData.get("tel") as string) || "";
    const fax = (formData.get("fax") as string) || "";
    const email = (formData.get("email") as string) || "";
    const siren = (formData.get("siren") as string) || "";
    const type = Number(formData.get("type")) || 0;

    if (!id || !nom) {
      return fail(400, { error: "Données manquantes" });
    }

    try {
      await db
        .update(societe)
        .set({
          nom,
          raisonSocial,
          rue,
          cp,
          ville,
          tel,
          fax,
          email,
          siren,
          type,
        })
        .where(eq(societe.id, id));

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      return fail(500, { error: "Erreur lors de la mise à jour" });
    }
  },

  create: async ({ request, locals }) => {
    const formData = await request.formData();

    const nom = (formData.get("nom") as string) || "";
    const raisonSocial = (formData.get("raisonSocial") as string) || "";
    const rue = (formData.get("rue") as string) || "";
    const cp = (formData.get("cp") as string) || "";
    const ville = (formData.get("ville") as string) || "";
    const tel = (formData.get("tel") as string) || "";
    const fax = (formData.get("fax") as string) || "";
    const email = (formData.get("email") as string) || "";
    const siren = (formData.get("siren") as string) || "";
    const type = Number(formData.get("type")) || 0;

    if (!nom) {
      return fail(400, { error: "Le nom est requis" });
    }

    try {
      await db.insert(societe).values({
        nom,
        raisonSocial,
        rue,
        cp,
        ville,
        tel,
        fax,
        email,
        siren,
        type,
      });

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      return fail(500, { error: "Erreur lors de la création" });
    }
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));

    if (!id) {
      return fail(400, { error: "ID manquant" });
    }

    try {
      await db.delete(societe).where(eq(societe.id, id));
      return { success: true };
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      return fail(500, { error: "Erreur lors de la suppression" });
    }
  },
};
