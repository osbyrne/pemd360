import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { pemd, projet, objets, categorieV2, groupe } from "$lib/server/db/schema";
import { getUserProjects } from "$lib/server/db/queries";
import { createDeleteAction } from "$lib/server/db/actions";
import { eq, and, inArray, sql } from "drizzle-orm";

const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, "/login");
  }

  const projectId = url.searchParams.get("projectId");
  const projects = await getUserProjects(user);

  const query = db
    .select({
      id: pemd.id,
      objet: objets.objet,
      description: pemd.description,
      etat: pemd.etat,
      etage: pemd.etage,
      potentielReemploi: pemd.potentielReemploi,
      reemploi: pemd.reemploi,
      imageHash: sql<string | null>`nullif(${pemd.image}, ${EMPTY_IMAGE_HASH})`,
      masse: pemd.masse,
      projetId: pemd.sidId,
      projetNom: projet.libelle,
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .leftJoin(projet, eq(pemd.sidId, projet.id));

  const conditions = [];

  if (user.role !== "admin") {
    const allowedids = projects.map((p) => p.id);
    if (allowedids.length > 0) {
      conditions.push(inArray(pemd.sidId, allowedids));
    } else {
      return {
        list: [],
        projects: [],
        selectedProjectId: projectId,
      };
    }
  }

  if (projectId) {
    conditions.push(eq(pemd.sidId, projectId));
  }

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  const list = await query.all();

  return {
    list,
    projects,
    selectedProjectId: projectId,
  };
};

export const actions: Actions = {
  delete: createDeleteAction(pemd, pemd.id, "pemd réemploi", "string", {
    resource: "tags",
    action: "delete",
  }),
};
