import { db } from "$lib/server/db/client";
import { categorieV2, groupe } from "$lib/server/db/schema";
import { createDeleteAction } from "$lib/server/db/actions";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  const categories = await db
    .select({
      id: categorieV2.id,
      categorie: categorieV2.categoriev2,
      groupeId: categorieV2.groupeId,
      groupeName: groupe.groupe,
    })
    .from(categorieV2)
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .all();

  const groupes = await db.select().from(groupe).all();

  return {
    categories,
    groupes,
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const categorieName = formData.get("categorie") as string;
    const groupeId = Number(formData.get("groupeId"));

    if (!categorieName || !groupeId) {
      return fail(400, { message: "Le nom de la catégorie et le groupe sont requis" });
    }

    try {
      await db.insert(categorieV2).values({
        categoriev2: categorieName,
        groupeId: groupeId,
      });

      return { success: true };
    } catch (e: any) {
      console.error("Error creating category:", e);
      return fail(500, { message: "Erreur lors de la création" });
    }
  },

  update: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get("id"));
    const categorieName = formData.get("categorie") as string;
    const groupeId = Number(formData.get("groupeId"));

    if (!id || !categorieName || !groupeId) {
      return fail(400, { message: "ID, nom de la catégorie et groupe requis" });
    }

    try {
      await db
        .update(categorieV2)
        .set({
          categoriev2: categorieName,
          groupeId: groupeId,
        })
        .where(eq(categorieV2.id, id));

      return { success: true };
    } catch (e: any) {
      console.error("Error updating category:", e);
      return fail(500, { message: "Erreur lors de la mise à jour" });
    }
  },

  delete: createDeleteAction(categorieV2, categorieV2.id, "category"),
};
