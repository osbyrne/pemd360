import { Effect } from "effect";
import { eq, inArray } from "drizzle-orm";
import {
  DatabaseError,
  ForbiddenError,
  ReportGenerationError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import { parseExportProjectId, requireExportProjectId } from "$lib/effect/schemas/export";
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
import { Report } from "$lib/server/services/report";
import type {
  PemExcelRow,
  ReemploiExcelRow,
  RiskExcelRow,
  SynthesisExcelRow,
  WasteExcelRow,
} from "$lib/server/excel";
import type { WorkflowUser } from "$lib/server/workflows/project";

type ExportWorkflowError =
  | DatabaseError
  | ReportGenerationError
  | UnauthenticatedError
  | ForbiddenError
  | ValidationError;

type ExportAuthorization = {
  readonly allowedProjectIds: readonly string[];
  readonly projectId: string | null;
};

export function exportTableauSynthese(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateTableauSyntheseExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.tableau-synthese.query", (db) =>
      db
        .select({
          id: pemd.id,
          objet: objets.objet,
          description: pemd.description,
          etat: pemd.etat,
          etage: pemd.etage,
          potentielReemploi: pemd.potentielReemploi,
          reemploi: pemd.reemploi,
          projetId: pemd.sidId,
          projetNom: projet.libelle,
        })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(projet, eq(pemd.sidId, projet.id))
        .where(projectFilter(pemd.sidId, access)),
    );
    const report = yield* Report;
    return yield* report.generateTableauSyntheseExcel(rows satisfies readonly SynthesisExcelRow[]);
  });
}

export function exportTableauSyntheseReemploi(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateTableauSyntheseReemploiExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.tableau-synthese-reemploi.query", (db) =>
      db
        .select({
          id: pemd.id,
          objet: objets.objet,
          description: pemd.description,
          etat: pemd.etat,
          etage: pemd.etage,
          potentielReemploi: pemd.potentielReemploi,
          reemploi: pemd.reemploi,
          projetId: pemd.sidId,
          projetNom: projet.libelle,
        })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(projet, eq(pemd.sidId, projet.id))
        .where(projectFilter(pemd.sidId, access)),
    );
    const filteredRows = rows.filter(
      (item) =>
        item.reemploi === 1 || (item.potentielReemploi && item.potentielReemploi.trim() !== ""),
    );
    const report = yield* Report;
    return yield* report.generateTableauSyntheseReemploiExcel(
      filteredRows satisfies readonly SynthesisExcelRow[],
    );
  });
}

export function exportWasteInventory(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateDechetsExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.waste.query", (db) =>
      db
        .select({
          id: pemd.id,
          categorie: categorieV2.categoriev2,
          objet: objets.objet,
          nature: natureV2.nature,
          codeDechet: natureV2.codeDechet,
          masse: pemd.masse,
          volume: pemd.volume,
          reutilisation: natureV2.reutilisation,
          recyclable: natureV2.recyclable,
          valorisationMatiere: natureV2.valorisationMatiere,
          valorisationEnergetique: natureV2.valorisationEnergetique,
          nonValorisation: natureV2.nonValorisation,
          incinerationSansValo: natureV2.incinerationSansValorisationEnergetique,
          ecoOrganisme: natureV2.ecoOrganismeRep,
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
        .where(projectFilter(pemd.sidId, access)),
    );
    const report = yield* Report;
    return yield* report.generateDechetsExcel(rows satisfies readonly WasteExcelRow[]);
  });
}

export function exportReuseInventory(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateReemploiExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.reuse.query", (db) =>
      db
        .select({
          id: pemd.id,
          objet: objets.objet,
          description: pemd.description,
          etat: pemd.etat,
          etage: pemd.etage,
          potentielReemploi: pemd.potentielReemploi,
          reemploi: pemd.reemploi,
          image: pemd.image,
          masse: pemd.masse,
          projetId: pemd.sidId,
          projetNom: projet.libelle,
        })
        .from(pemd)
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
        .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
        .leftJoin(projet, eq(pemd.sidId, projet.id))
        .where(projectFilter(pemd.sidId, access)),
    );
    const report = yield* Report;
    return yield* report.generateReemploiExcel(rows satisfies readonly ReemploiExcelRow[]);
  });
}

export function exportPemInventory(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generatePemExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.pem.query", (db) =>
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
          image: pemd.image,
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
        .where(projectFilter(pemd.sidId, access)),
    );
    const report = yield* Report;
    return yield* report.generatePemExcel(rows satisfies readonly PemExcelRow[]);
  });
}

export function exportRiskInventory(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateRiskExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const access = yield* authorizeExport(input.user, input.projectId);
    const database = yield* Database;
    const [amiante, plomb, termites] = yield* Effect.all(
      [
        database.run("export.risk.amiante.query", (db) =>
          db
            .select({
              id: tagsAmiante.id,
              label: tagsAmiante.label,
              description: tagsAmiante.description,
              etage: tagsAmiante.etage,
              projetId: tagsAmiante.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsAmiante)
            .leftJoin(projet, eq(tagsAmiante.sidId, projet.id))
            .where(projectFilter(tagsAmiante.sidId, access)),
        ),
        database.run("export.risk.plomb.query", (db) =>
          db
            .select({
              id: tagsPlomb.id,
              label: tagsPlomb.label,
              description: tagsPlomb.description,
              etage: tagsPlomb.etage,
              projetId: tagsPlomb.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsPlomb)
            .leftJoin(projet, eq(tagsPlomb.sidId, projet.id))
            .where(projectFilter(tagsPlomb.sidId, access)),
        ),
        database.run("export.risk.termites.query", (db) =>
          db
            .select({
              id: tagsTermite.id,
              label: tagsTermite.label,
              description: tagsTermite.description,
              etage: tagsTermite.etage,
              projetId: tagsTermite.sidId,
              projetNom: projet.libelle,
            })
            .from(tagsTermite)
            .leftJoin(projet, eq(tagsTermite.sidId, projet.id))
            .where(projectFilter(tagsTermite.sidId, access)),
        ),
      ],
      { concurrency: 3 },
    );
    const rows: RiskExcelRow[] = [
      ...amiante.map((item) => ({ ...item, type: "Amiante" })),
      ...plomb.map((item) => ({ ...item, type: "Plomb" })),
      ...termites.map((item) => ({ ...item, type: "Termites" })),
    ];
    const report = yield* Report;
    return yield* report.generateRiskExcel(rows, "Risques");
  });
}

export function exportCerfaWaste(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly projectId: string | null;
}): Effect.Effect<
  Awaited<ReturnType<typeof import("$lib/server/excel").generateDechetsExcel>>,
  ExportWorkflowError,
  Database | Report
> {
  return Effect.gen(function* () {
    const projectId = yield* requireExportProjectId(input.projectId);
    const access = yield* authorizeExport(input.user, projectId);
    const database = yield* Database;
    const rows = yield* database.run("export.cerfa-waste.query", (db) =>
      db
        .select({
          id: pemd.id,
          sidId: pemd.sidId,
          reemploi: pemd.reemploi,
          categorie: categorieV2.categoriev2,
          objet: objets.objet,
          codeDechet: natureV2.codeDechet,
          masse: pemd.masse,
          volume: pemd.volume,
          description: pemd.description,
          nature: natureV2.nature,
          reutilisation: natureV2.reutilisation,
          recyclable: natureV2.recyclable,
          valorisationMatiere: natureV2.valorisationMatiere,
          valorisationEnergetique: natureV2.valorisationEnergetique,
          incinerationSansValo: natureV2.incinerationSansValorisationEnergetique,
          nonValorisation: natureV2.nonValorisation,
          stockage: natureV2.stockage,
          ecoOrganisme: natureV2.ecoOrganismeRep,
        })
        .from(pemd)
        .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
        .leftJoin(objets, eq(pemd.objetId, objets.id))
        .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
        .where(projectFilter(pemd.sidId, access)),
    );
    const dechets = groupWasteRows(rows);
    const report = yield* Report;
    return yield* report.generateDechetsExcel(dechets);
  });
}

function authorizeExport(
  user: WorkflowUser | null | undefined,
  projectId: string | null,
): Effect.Effect<
  ExportAuthorization,
  DatabaseError | UnauthenticatedError | ForbiddenError | ValidationError,
  Database
> {
  return Effect.gen(function* () {
    if (!user) return yield* Effect.fail(new UnauthenticatedError({ message: "Unauthorized" }));
    const normalizedProjectId = yield* parseExportProjectId(projectId);
    const database = yield* Database;
    const allowedProjectIds = yield* database.run("export.authorization.projects", (db) => {
      if (user.role === "admin") {
        return db
          .select({ id: projet.id })
          .from(projet)
          .then((rows) => rows.map((row) => row.id));
      }
      return db
        .select({ id: userProjet.projetId })
        .from(userProjet)
        .where(eq(userProjet.userId, user.id))
        .then((rows) => rows.map((row) => row.id));
    });

    if (allowedProjectIds.length === 0) {
      return yield* Effect.fail(new ForbiddenError({ message: "No access to any project" }));
    }
    if (normalizedProjectId && !allowedProjectIds.includes(normalizedProjectId)) {
      return yield* Effect.fail(new ForbiddenError({ message: "Unauthorized for this project" }));
    }
    return { allowedProjectIds, projectId: normalizedProjectId };
  });
}

function projectFilter(
  sidIdColumn:
    | typeof pemd.sidId
    | typeof tagsAmiante.sidId
    | typeof tagsPlomb.sidId
    | typeof tagsTermite.sidId,
  access: ExportAuthorization,
) {
  return access.projectId
    ? eq(sidIdColumn, access.projectId)
    : inArray(sidIdColumn, access.allowedProjectIds);
}

type WasteGroupRow = WasteExcelRow & {
  readonly id: string;
  readonly sidId: string;
  readonly reemploi: number | null;
};

function groupWasteRows(rows: readonly WasteGroupRow[]): WasteExcelRow[] {
  const grouped = new Map<string, WasteExcelRow>();
  for (const item of rows) {
    if (item.reemploi !== 0 && item.reemploi !== null) continue;
    const key = `${item.categorie || "Inconnu"}_${item.nature || "Inconnu"}_${item.codeDechet || "NC"}`;
    const current = grouped.get(key);
    if (current) {
      grouped.set(key, {
        ...current,
        masse: (current.masse || 0) + (item.masse || 0),
        volume: (current.volume || 0) + (item.volume || 0),
      });
    } else {
      grouped.set(key, { ...item, masse: item.masse || 0, volume: item.volume || 0 });
    }
  }
  return Array.from(grouped.values());
}
