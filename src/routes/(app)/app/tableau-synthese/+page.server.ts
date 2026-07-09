import { redirect, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { pemd, projet, objets } from "$lib/server/db/schema";
import { getUserProjects } from "$lib/server/db/queries";
import { eq, and, inArray, count, or, like, sql, asc, type SQL } from "drizzle-orm";

const DEFAULT_PER_PAGE = 25;
const MAX_PER_PAGE = 100;
const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, "/login");
  }

  const projectId = url.searchParams.get("projectId");
  const q = url.searchParams.get("q")?.trim() ?? "";
  const requestedPage = parsePositiveInt(url.searchParams.get("page"), 1);
  const perPage = Math.min(
    parsePositiveInt(url.searchParams.get("perPage"), DEFAULT_PER_PAGE),
    MAX_PER_PAGE,
  );
  const projects = await getUserProjects(user);

  const conditions: SQL[] = [];

  if (user.role !== "admin") {
    const allowedids = projects.map((p) => p.id);
    if (allowedids.length > 0) {
      conditions.push(inArray(pemd.sidId, allowedids));
    } else {
      return {
        list: [],
        projects: [],
        selectedProjectId: projectId,
        q,
        pagination: {
          page: 1,
          perPage,
          total: 0,
          totalPages: 1,
        },
      };
    }
  }

  if (projectId) {
    conditions.push(eq(pemd.sidId, projectId));
  }

  if (q) {
    const search = `%${q}%`;
    conditions.push(
      or(
        like(objets.objet, search),
        like(pemd.description, search),
        like(pemd.etat, search),
        like(pemd.etage, search),
        like(pemd.potentielReemploi, search),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ total }] = await db
    .select({
      total: count(),
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .where(where);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * perPage;

  const list = await db
    .select({
      id: pemd.id,
      objet: objets.objet,
      description: pemd.description,
      etat: pemd.etat,
      etage: pemd.etage,
      potentielReemploi: pemd.potentielReemploi,
      reemploi: pemd.reemploi,
      imageHash: sql<string | null>`nullif(${pemd.image}, ${EMPTY_IMAGE_HASH})`,
      projetId: pemd.sidId,
      projetNom: projet.libelle,
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(projet, eq(pemd.sidId, projet.id))
    .where(where)
    .orderBy(asc(pemd.id))
    .limit(perPage)
    .offset(offset);

  return {
    list,
    projects,
    selectedProjectId: projectId,
    q,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };
};

export const actions: Actions = {
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return fail(400, { message: "ID requis" });
    }

    try {
      await db.delete(pemd).where(eq(pemd.id, id));
      return { success: true };
    } catch (e: any) {
      console.error("Error deleting pemd:", e);
      return fail(500, { message: "Erreur lors de la suppression" });
    }
  },
};
