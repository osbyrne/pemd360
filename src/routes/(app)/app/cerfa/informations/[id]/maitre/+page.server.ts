import { db } from "$lib/server/db/client";
import { cerfaMtrOuvrage } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  const moa = await db.select().from(cerfaMtrOuvrage).where(eq(cerfaMtrOuvrage.projetId, id)).get();
  return { moa };
};

export const actions: Actions = {
  default: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const typePersonne = formData.get("typePersonne")?.toString();

    const values = {
      projetId: id,
      adresse: formData.get("adresse")?.toString() || null,
      cp: formData.get("cp")?.toString() || null,
      commune: formData.get("commune")?.toString() || null,
      nomPerPhy: typePersonne === "physique" ? formData.get("nom")?.toString() || null : null,
      prenomPerPhy: typePersonne === "physique" ? formData.get("prenom")?.toString() || null : null,
      nomPerMorale:
        typePersonne === "morale" ? formData.get("raisonSociale")?.toString() || null : null,
      siretSiren: formData.get("siretSiren")?.toString() || null,
    };

    const existing = await db
      .select({ id: cerfaMtrOuvrage.id })
      .from(cerfaMtrOuvrage)
      .where(eq(cerfaMtrOuvrage.projetId, id))
      .get();

    if (existing) {
      await db.update(cerfaMtrOuvrage).set(values).where(eq(cerfaMtrOuvrage.projetId, id));
    } else {
      await db.insert(cerfaMtrOuvrage).values(values);
    }

    redirect(303, `/app/cerfa/informations?projetId=${id}`);
  },
};
