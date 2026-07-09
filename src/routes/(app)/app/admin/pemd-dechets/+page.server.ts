import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { db } from "$lib/server/db/client";
import { pemd, projet, objets, categorieV2, groupe, natureV2 } from "$lib/server/db/schema";
import { getUserProjects } from "$lib/server/db/queries";
import { createDeleteAction } from "$lib/server/db/actions";
import { eq, and, inArray, count, or, like, sql, asc, type SQL } from "drizzle-orm";

const DEFAULT_PER_PAGE = 25;
const MAX_PER_PAGE = 100;

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
        totalMass: 0,
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
        like(natureV2.nature, search),
        like(sql<string>`cast(${natureV2.codeDechet} as text)`, search),
        like(natureV2.ecoOrganismeRep, search),
        like(natureV2.stockage, search),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ total, totalMass }] = await db
    .select({
      total: count(),
      totalMass: sql<number>`coalesce(sum(${pemd.masse}), 0)`,
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
    .where(where);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * perPage;

  const list = await db
    .select({
      id: pemd.id,
      nature: natureV2.nature,
      codeDechet: natureV2.codeDechet,
      masse: pemd.masse,
      reutilisation: natureV2.reutilisation,
      recyclable: natureV2.recyclable,
      valorisationMatiere: natureV2.valorisationMatiere,
      valorisationEnergetique: natureV2.valorisationEnergetique,
      nonValorisation: natureV2.nonValorisation,
      incinerationSansValorisationEnergetique: natureV2.incinerationSansValorisationEnergetique,
      ecoOrganismeRep: natureV2.ecoOrganismeRep,
      stockage: natureV2.stockage,
      projetId: pemd.sidId,
      projetNom: projet.libelle,
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
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
    totalMass,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
    },
  };
};

export const actions: Actions = {
  delete: createDeleteAction(pemd, pemd.id, "pemd déchet", "string", {
    resource: "tags",
    action: "delete",
  }),
};
