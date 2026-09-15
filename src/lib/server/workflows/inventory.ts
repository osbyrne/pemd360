import { Effect } from "effect";
import { and, asc, count, eq, inArray, like, or, sql, type SQL } from "drizzle-orm";
import { ForbiddenError, UnauthenticatedError } from "$lib/effect/errors";
import { decodeFormData, requiredString } from "$lib/effect/schemas/forms";
import { RecordIdForm } from "$lib/effect/schemas/inventory";
import {
  categorieV2,
  groupe,
  natureV2,
  objets,
  pemd,
  projet,
  tagsAmiante,
  tagsPlomb,
  tagsTermite,
  userProjet,
} from "$lib/server/db/schema";
import { Database } from "$lib/server/services/database";
import { Authorization, type PermissionConfig } from "$lib/server/services/authorization";
import {
  loadUserProjects,
  type ProjectOption,
  type WorkflowUser,
} from "$lib/server/workflows/project";
import { Storage } from "$lib/server/services/storage";

const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export const DEFAULT_PER_PAGE = 25;
export const MAX_PER_PAGE = 100;

export type InventoryInput = {
  readonly user: WorkflowUser;
  readonly projectId: string | null;
  readonly q: string;
  readonly requestedPage: number;
  readonly perPage: number;
};

export function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadWasteInventory(input: InventoryInput) {
  return Effect.gen(function* () {
    const projects = yield* loadUserProjects(input.user);
    const allowedIds = input.user.role === "admin" ? null : projects.map((project) => project.id);
    if (allowedIds && allowedIds.length === 0) {
      return emptyWasteResult(input, projects);
    }

    const database = yield* Database;
    const summaryRows = yield* database.run("inventory.waste.summary", (db) =>
      db
        .select({
          total: count(),
          totalMass: sql<number>`coalesce(sum(${pemd.masse}), 0)`,
        })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
        .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
        .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
        .where(wasteConditions(input, allowedIds)),
    );
    const summary = summaryRows[0] ?? { total: 0, totalMass: 0 };
    const total = Number(summary.total);
    const totalPages = Math.max(1, Math.ceil(total / input.perPage));
    const page = Math.min(input.requestedPage, totalPages);

    const list = yield* database.run("inventory.waste.list", (db) =>
      db
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
        .where(wasteConditions(input, allowedIds))
        .orderBy(asc(pemd.id))
        .limit(input.perPage)
        .offset((page - 1) * input.perPage),
    );

    return {
      list,
      projects,
      selectedProjectId: input.projectId,
      q: input.q,
      totalMass: summary.totalMass,
      pagination: { page, perPage: input.perPage, total, totalPages },
    };
  });
}

export function loadReuseInventory(input: InventoryInput) {
  return Effect.gen(function* () {
    const projects = yield* loadUserProjects(input.user);
    const allowedIds = input.user.role === "admin" ? null : projects.map((project) => project.id);
    if (allowedIds && allowedIds.length === 0) {
      return emptyInventoryResult(input, projects);
    }

    const database = yield* Database;
    const summaryRows = yield* database.run("inventory.reuse.summary", (db) =>
      db
        .select({ total: count() })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .where(reuseConditions(input, allowedIds)),
    );
    const total = Number(summaryRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / input.perPage));
    const page = Math.min(input.requestedPage, totalPages);
    const list = yield* database.run("inventory.reuse.list", (db) =>
      db
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
        .leftJoin(projet, eq(pemd.sidId, projet.id))
        .where(reuseConditions(input, allowedIds))
        .orderBy(asc(pemd.id))
        .limit(input.perPage)
        .offset((page - 1) * input.perPage),
    );

    return {
      list,
      projects,
      selectedProjectId: input.projectId,
      q: input.q,
      pagination: { page, perPage: input.perPage, total, totalPages },
    };
  });
}

export function loadPemdInventory(input: InventoryInput) {
  return Effect.gen(function* () {
    const projects = yield* loadUserProjects(input.user);
    const allowedIds = input.user.role === "admin" ? null : projects.map((project) => project.id);
    if (allowedIds && allowedIds.length === 0) {
      return emptyInventoryResult(input, projects);
    }

    const database = yield* Database;
    const summaryRows = yield* database.run("inventory.pemd.summary", (db) =>
      db
        .select({ total: count() })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .where(pemdConditions(input, allowedIds)),
    );
    const total = Number(summaryRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / input.perPage));
    const page = Math.min(input.requestedPage, totalPages);
    const list = yield* database.run("inventory.pemd.list", (db) =>
      db
        .select({
          id: pemd.id,
          groupe: groupe.groupe,
          categorie: categorieV2.categoriev2,
          objet: objets.objet,
          estimationAge: pemd.estimationAge,
          quantite: pemd.quantite,
          description: pemd.description,
          etat: pemd.etat,
          nature: natureV2.nature,
          surface: pemd.surface,
          epaisseur: pemd.epaisseur,
          densite: natureV2.densite,
          masse: pemd.masse,
          constitution: pemd.constitution,
          imageHash: sql<string | null>`nullif(${pemd.image}, ${EMPTY_IMAGE_HASH})`,
          etage: pemd.etage,
          typologieAppart: pemd.typologieAppart,
          projetId: pemd.sidId,
          projetNom: projet.libelle,
        })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
        .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
        .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
        .leftJoin(projet, eq(pemd.sidId, projet.id))
        .where(pemdConditions(input, allowedIds))
        .orderBy(asc(pemd.id))
        .limit(input.perPage)
        .offset((page - 1) * input.perPage),
    );

    return {
      list,
      projects,
      selectedProjectId: input.projectId,
      q: input.q,
      pagination: { page, perPage: input.perPage, total, totalPages },
    };
  });
}

export function loadSynthesisInventory(input: InventoryInput) {
  return Effect.gen(function* () {
    const projects = yield* loadUserProjects(input.user);
    const allowedIds = input.user.role === "admin" ? null : projects.map((project) => project.id);
    if (allowedIds && allowedIds.length === 0) {
      return emptyInventoryResult(input, projects);
    }

    const database = yield* Database;
    const summaryRows = yield* database.run("inventory.synthesis.summary", (db) =>
      db
        .select({ total: count() })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .where(synthesisConditions(input, allowedIds)),
    );
    const total = Number(summaryRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / input.perPage));
    const page = Math.min(input.requestedPage, totalPages);
    const list = yield* database.run("inventory.synthesis.list", (db) =>
      db
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
        .where(synthesisConditions(input, allowedIds))
        .orderBy(asc(pemd.id))
        .limit(input.perPage)
        .offset((page - 1) * input.perPage),
    );

    return {
      list,
      projects,
      selectedProjectId: input.projectId,
      q: input.q,
      pagination: { page, perPage: input.perPage, total, totalPages },
    };
  });
}

export function loadRiskInventory(input: InventoryInput) {
  return Effect.gen(function* () {
    const projects = yield* loadUserProjects(input.user);
    const allowedIds = input.user.role === "admin" ? null : projects.map((project) => project.id);
    if (allowedIds && allowedIds.length === 0) {
      return { list: [], projects: [], selectedProjectId: input.projectId };
    }

    const database = yield* Database;
    const [amianteList, plombList, termiteList] = yield* Effect.all(
      [
        database.run("inventory.risk.amiante", (db) =>
          db
            .select({
              id: tagsAmiante.id,
              label: tagsAmiante.label,
              description: tagsAmiante.description,
              etage: tagsAmiante.etage,
              type: tagsAmiante.type,
              image: tagsAmiante.image,
              customImage: tagsAmiante.customImage,
              presenceAmiante: tagsAmiante.presenceAmiante,
              projetId: tagsAmiante.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsAmiante)
            .leftJoin(projet, eq(tagsAmiante.sidId, projet.id))
            .where(riskConditions(tagsAmiante.sidId, input, allowedIds)),
        ),
        database.run("inventory.risk.plomb", (db) =>
          db
            .select({
              id: tagsPlomb.id,
              label: tagsPlomb.label,
              description: tagsPlomb.description,
              etage: tagsPlomb.etage,
              image: tagsPlomb.image,
              customImage: tagsPlomb.customImage,
              projetId: tagsPlomb.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsPlomb)
            .leftJoin(projet, eq(tagsPlomb.sidId, projet.id))
            .where(riskConditions(tagsPlomb.sidId, input, allowedIds)),
        ),
        database.run("inventory.risk.termites", (db) =>
          db
            .select({
              id: tagsTermite.id,
              label: tagsTermite.label,
              description: tagsTermite.description,
              etage: tagsTermite.etage,
              image: tagsTermite.image,
              customImage: tagsTermite.customImage,
              presenceTermite: tagsTermite.presenceTermite,
              projetId: tagsTermite.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsTermite)
            .leftJoin(projet, eq(tagsTermite.sidId, projet.id))
            .where(riskConditions(tagsTermite.sidId, input, allowedIds)),
        ),
      ],
      { concurrency: 3 },
    );

    const rows = [
      ...amianteList.map((item) => ({
        ...item,
        riskType: "amiante" as const,
        riskLabel: "Amiante",
        uid: `amiante:${item.id}`,
      })),
      ...plombList.map((item) => ({
        ...item,
        type: "Plomb",
        riskType: "plomb" as const,
        riskLabel: "Plomb",
        uid: `plomb:${item.id}`,
      })),
      ...termiteList.map((item) => ({
        ...item,
        type: "Termites",
        riskType: "termites" as const,
        riskLabel: "Termites",
        uid: `termites:${item.id}`,
      })),
    ];
    const list = yield* Effect.forEach(
      rows,
      (item) =>
        resolveRiskThumbnail(item).pipe(Effect.map((thumbnailUrl) => ({ ...item, thumbnailUrl }))),
      { concurrency: 8 },
    );

    return { list, projects, selectedProjectId: input.projectId };
  });
}

export function deletePemdRecord(input: {
  readonly formData: FormData;
  readonly user: WorkflowUser | null | undefined;
  readonly permission?: PermissionConfig;
  readonly operation: string;
}) {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    if (input.permission) {
      const authorization = yield* Authorization;
      const permission = yield* authorization.checkPermission(user.id, input.permission);
      if (!permission.success)
        return yield* Effect.fail(new ForbiddenError({ message: "Permission refusée" }));
    }

    const form = yield* decodeFormData(RecordIdForm, input.formData);
    const id = yield* requiredString(form.id, "ID requis");
    const database = yield* Database;
    if (user.role !== "admin") {
      const access = yield* database.run(`${input.operation}.access`, (db) =>
        db
          .select({ id: pemd.id })
          .from(pemd)
          .innerJoin(userProjet, eq(pemd.sidId, userProjet.projetId))
          .where(and(eq(pemd.id, id), eq(userProjet.userId, user.id))),
      );
      if (access.length === 0)
        return yield* Effect.fail(new ForbiddenError({ message: "Accès non autorisé" }));
    }

    yield* database.run(`${input.operation}.delete`, (db) =>
      db.delete(pemd).where(eq(pemd.id, id)),
    );
    return { success: true } as const;
  });
}

export function deleteRiskRecord(input: {
  readonly formData: FormData;
  readonly user: WorkflowUser | null | undefined;
}) {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    const authorization = yield* Authorization;
    const permission = yield* authorization.checkPermission(user.id, {
      resource: "tags",
      action: "delete",
    });
    if (!permission.success)
      return yield* Effect.fail(new ForbiddenError({ message: "Permission refusée" }));

    const form = yield* decodeFormData(RecordIdForm, input.formData);
    const id = yield* requiredString(form.id, "ID requis");
    const riskType = form.riskType || "amiante";
    const database = yield* Database;
    if (riskType === "plomb") {
      yield* database.run("inventory.risk.plomb.delete", (db) =>
        db.delete(tagsPlomb).where(eq(tagsPlomb.id, id)),
      );
    } else if (riskType === "termites") {
      yield* database.run("inventory.risk.termites.delete", (db) =>
        db.delete(tagsTermite).where(eq(tagsTermite.id, id)),
      );
    } else {
      yield* database.run("inventory.risk.amiante.delete", (db) =>
        db.delete(tagsAmiante).where(eq(tagsAmiante.id, id)),
      );
    }
    return { success: true } as const;
  });
}

function wasteConditions(input: InventoryInput, allowedIds: string[] | null): SQL | undefined {
  const conditions: SQL[] = [];
  if (allowedIds) conditions.push(inArray(pemd.sidId, allowedIds));
  if (input.projectId) conditions.push(eq(pemd.sidId, input.projectId));
  if (input.q) {
    const search = `%${input.q}%`;
    conditions.push(
      or(
        like(natureV2.nature, search),
        like(sql<string>`cast(${natureV2.codeDechet} as text)`, search),
        like(natureV2.ecoOrganismeRep, search),
        like(natureV2.stockage, search),
      )!,
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function reuseConditions(input: InventoryInput, allowedIds: string[] | null): SQL | undefined {
  const conditions: SQL[] = [
    or(
      eq(pemd.reemploi, 1),
      and(
        sql`${pemd.potentielReemploi} IS NOT NULL`,
        sql`length(trim(${pemd.potentielReemploi})) > 0`,
      ),
    )!,
  ];
  if (allowedIds) conditions.push(inArray(pemd.sidId, allowedIds));
  if (input.projectId) conditions.push(eq(pemd.sidId, input.projectId));
  if (input.q) {
    const search = `%${input.q}%`;
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
  return and(...conditions);
}

function pemdConditions(input: InventoryInput, allowedIds: string[] | null): SQL | undefined {
  const conditions: SQL[] = [];
  if (allowedIds) conditions.push(inArray(pemd.sidId, allowedIds));
  if (input.projectId) conditions.push(eq(pemd.sidId, input.projectId));
  if (input.q) {
    const search = `%${input.q}%`;
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
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function synthesisConditions(input: InventoryInput, allowedIds: string[] | null): SQL | undefined {
  const conditions: SQL[] = [];
  if (allowedIds) conditions.push(inArray(pemd.sidId, allowedIds));
  if (input.projectId) conditions.push(eq(pemd.sidId, input.projectId));
  if (input.q) {
    const search = `%${input.q}%`;
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
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function riskConditions<
  Column extends typeof tagsAmiante.sidId | typeof tagsPlomb.sidId | typeof tagsTermite.sidId,
>(sidIdColumn: Column, input: InventoryInput, allowedIds: string[] | null): SQL | undefined {
  const conditions: SQL[] = [];
  if (allowedIds) conditions.push(inArray(sidIdColumn, allowedIds));
  if (input.projectId) conditions.push(eq(sidIdColumn, input.projectId));
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function resolveRiskThumbnail(item: { readonly customImage: string; readonly image: string }) {
  return Effect.gen(function* () {
    const storage = yield* Storage;
    const custom = yield* storage.signedImageUrl(item.customImage, ["png", "jpg", "jpeg", "webp"]);
    return custom ?? (yield* storage.signedImageUrl(item.image, ["jpg", "jpeg", "png", "webp"]));
  });
}

function authenticatedUser(
  user: WorkflowUser | null | undefined,
): Effect.Effect<WorkflowUser, UnauthenticatedError> {
  return user
    ? Effect.succeed(user)
    : Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));
}

function emptyInventoryResult(input: InventoryInput, projects: ProjectOption[]) {
  return {
    list: [],
    projects,
    selectedProjectId: input.projectId,
    q: input.q,
    pagination: { page: 1, perPage: input.perPage, total: 0, totalPages: 1 },
  };
}

function emptyWasteResult(input: InventoryInput, projects: ProjectOption[]) {
  return { ...emptyInventoryResult(input, projects), totalMass: 0 };
}
