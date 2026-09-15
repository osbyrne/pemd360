import { Effect } from "effect";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import {
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import { decodeFormData, optionalNumber, requiredString } from "$lib/effect/schemas/forms";
import {
  DiagnosticForm,
  DiagnostiqueurForm,
  MaitreOuvrageForm,
  OperationForm,
} from "$lib/effect/schemas/cerfa";
import {
  categorieV2,
  cerfaDiagnostic,
  cerfaDiagnostiqueur,
  cerfaMtrOuvrage,
  cerfaOperation,
  groupe,
  natureV2,
  objets,
  pemd,
  projet,
  userProjet,
} from "$lib/server/db/schema";
import { Database } from "$lib/server/services/database";
import type { AppDatabase } from "$lib/server/db/client";
import type { WorkflowUser } from "$lib/server/workflows/project";

type CerfaError =
  | DatabaseError
  | UnauthenticatedError
  | ForbiddenError
  | NotFoundError
  | ValidationError;

export function loadCerfaInformationList(user: WorkflowUser | null | undefined) {
  return Effect.gen(function* () {
    const currentUser = yield* authenticatedUser(user);
    const database = yield* Database;
    const projectIds = yield* accessibleProjectIds(database, currentUser);
    if (projectIds && projectIds.length === 0) return { list: [] };

    const list = yield* database.run("cerfa.information.list", (db) =>
      db
        .select({
          projetId: projet.id,
          projetNom: projet.libelle,
          moaNom: cerfaMtrOuvrage.nomPerMorale,
          moaNomPhy: cerfaMtrOuvrage.nomPerPhy,
          moaPrenomPhy: cerfaMtrOuvrage.prenomPerPhy,
          moaSiretSiren: cerfaMtrOuvrage.siretSiren,
          moaAdresse: cerfaMtrOuvrage.adresse,
          moaCp: cerfaMtrOuvrage.cp,
          moaCommune: cerfaMtrOuvrage.commune,
          diagnostiqueurNom: cerfaDiagnostiqueur.nomPerMorale,
          diagnostiqueurNomPhy: cerfaDiagnostiqueur.nomPerPhy,
          diagnostiqueurPrenomPhy: cerfaDiagnostiqueur.prenomPerPhy,
          diagnostiqueurSiretSiren: cerfaDiagnostiqueur.siretSiren,
          diagnostiqueurAdresse: cerfaDiagnostiqueur.adresse,
          diagnostiqueurCp: cerfaDiagnostiqueur.cp,
          diagnostiqueurCommune: cerfaDiagnostiqueur.commune,
          operationAdresse: cerfaOperation.adresse,
          operationCp: cerfaOperation.cp,
          operationCommune: cerfaOperation.commune,
          operationDateDebut: cerfaOperation.dateDeDebut,
          operationDateFin: cerfaOperation.dateDeFin,
          operationType: cerfaOperation.operation,
          operationNbBatDemolition: cerfaOperation.nbBatDemolition,
          operationSurfaceDemolir: cerfaOperation.surfaceADemolir,
          operationNbBatRenovation: cerfaOperation.nbBatRenovation,
          operationSurfaceRenover: cerfaOperation.surfaceARenover,
          operationTypologie: cerfaOperation.typologieBat,
          datePermis: cerfaOperation.datePermisDeConstruire,
          operationSoumis: cerfaOperation.operationSoumis,
          diagnosticDerniereVisite: cerfaDiagnostic.derniereVisite,
          diagnosticBatVisite: cerfaDiagnostic.batVisite,
          diagnosticBatNonVisite: cerfaDiagnostic.batNonVisite,
          diagnosticRaisonsNePasVisite: cerfaDiagnostic.raisonsNePasVisite,
          diagnosticDesordres: cerfaDiagnostic.desordres,
          diagnosticPrecaution: cerfaDiagnostic.precaution,
          diagnosticDocumentConsultes: cerfaDiagnostic.documentsConsultes,
        })
        .from(projet)
        .leftJoin(cerfaMtrOuvrage, eq(projet.id, cerfaMtrOuvrage.projetId))
        .leftJoin(cerfaDiagnostiqueur, eq(projet.id, cerfaDiagnostiqueur.projetId))
        .leftJoin(cerfaOperation, eq(projet.id, cerfaOperation.projetId))
        .leftJoin(cerfaDiagnostic, eq(projet.id, cerfaDiagnostic.projetId))
        .where(projectIds ? inArray(projet.id, projectIds) : undefined),
    );
    return { list };
  });
}

export function loadCerfaWaste(input: {
  readonly projectId: string | null;
  readonly user: WorkflowUser | null | undefined;
}) {
  return Effect.gen(function* () {
    if (!input.projectId) return { dechets: [], projetInfo: null };
    const projectId = yield* ensureProjectAccess(input.projectId, input.user);
    const database = yield* Database;

    const projetInfo = yield* database.run("cerfa.waste.project", (db) =>
      db
        .select({ id: projet.id, libelle: projet.libelle, reference: projet.reference })
        .from(projet)
        .where(eq(projet.id, projectId))
        .limit(1),
    );
    const project = projetInfo[0] ?? null;
    const rows = yield* database.run("cerfa.waste.list", (db) =>
      db
        .select({
          id: pemd.id,
          sidId: pemd.sidId,
          reemploi: pemd.reemploi,
          potentielReemploi: pemd.potentielReemploi,
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
        .where(eq(pemd.sidId, projectId)),
    );

    return { dechets: groupWasteRows(rows), projetInfo: project };
  });
}

export function loadCerfaPem() {
  return Effect.gen(function* () {
    const database = yield* Database;
    const items = yield* database.run("cerfa.pem.list", (db) =>
      db
        .select({
          id: objets.id,
          objet: objets.objet,
          categorie: categorieV2.categoriev2,
          groupe: groupe.groupe,
          unite: objets.unite,
          masseUnitaire: objets.masseUnitaire,
          etat: objets.deposeReemlpoi,
        })
        .from(objets)
        .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
        .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
        .where(isNotNull(objets.deposeReemlpoi)),
    );
    return { items };
  });
}

export function loadDiagnostiqueur(projectId: string, user: WorkflowUser | null | undefined) {
  return loadSection(projectId, user, "diagnostiqueur");
}

export function loadMaitreOuvrage(projectId: string, user: WorkflowUser | null | undefined) {
  return loadSection(projectId, user, "moa");
}

export function loadDiagnostic(projectId: string, user: WorkflowUser | null | undefined) {
  return loadSection(projectId, user, "diagnostic");
}

export function loadOperation(projectId: string, user: WorkflowUser | null | undefined) {
  return loadSection(projectId, user, "operation");
}

function loadSection(
  projectId: string,
  user: WorkflowUser | null | undefined,
  kind: "diagnostiqueur",
): Effect.Effect<InferSelectModel<typeof cerfaDiagnostiqueur> | null, CerfaError, Database>;
function loadSection(
  projectId: string,
  user: WorkflowUser | null | undefined,
  kind: "moa",
): Effect.Effect<InferSelectModel<typeof cerfaMtrOuvrage> | null, CerfaError, Database>;
function loadSection(
  projectId: string,
  user: WorkflowUser | null | undefined,
  kind: "diagnostic",
): Effect.Effect<InferSelectModel<typeof cerfaDiagnostic> | null, CerfaError, Database>;
function loadSection(
  projectId: string,
  user: WorkflowUser | null | undefined,
  kind: "operation",
): Effect.Effect<InferSelectModel<typeof cerfaOperation> | null, CerfaError, Database>;
function loadSection(
  projectId: string,
  user: WorkflowUser | null | undefined,
  kind: "diagnostiqueur" | "moa" | "diagnostic" | "operation",
): Effect.Effect<
  | InferSelectModel<typeof cerfaDiagnostiqueur>
  | InferSelectModel<typeof cerfaMtrOuvrage>
  | InferSelectModel<typeof cerfaDiagnostic>
  | InferSelectModel<typeof cerfaOperation>
  | null,
  CerfaError,
  Database
> {
  return Effect.gen(function* () {
    const id = yield* ensureProjectAccess(projectId, user);
    const database = yield* Database;
    switch (kind) {
      case "diagnostiqueur": {
        const rows = yield* database.run("cerfa.diagnostiqueur.load", (db) =>
          db
            .select()
            .from(cerfaDiagnostiqueur)
            .where(eq(cerfaDiagnostiqueur.projetId, id))
            .limit(1),
        );
        return rows[0] ?? null;
      }
      case "moa": {
        const rows = yield* database.run("cerfa.moa.load", (db) =>
          db.select().from(cerfaMtrOuvrage).where(eq(cerfaMtrOuvrage.projetId, id)).limit(1),
        );
        return rows[0] ?? null;
      }
      case "diagnostic": {
        const rows = yield* database.run("cerfa.diagnostic.load", (db) =>
          db.select().from(cerfaDiagnostic).where(eq(cerfaDiagnostic.projetId, id)).limit(1),
        );
        return rows[0] ?? null;
      }
      case "operation": {
        const rows = yield* database.run("cerfa.operation.load", (db) =>
          db.select().from(cerfaOperation).where(eq(cerfaOperation.projetId, id)).limit(1),
        );
        return rows[0] ?? null;
      }
    }
  });
}

export function saveDiagnostiqueur(
  projectId: string,
  formData: FormData,
  user: WorkflowUser | null | undefined,
) {
  return Effect.gen(function* () {
    const id = yield* ensureProjectAccess(projectId, user);
    const form = yield* decodeFormData(DiagnostiqueurForm, formData);
    const values: InferInsertModel<typeof cerfaDiagnostiqueur> = {
      projetId: id,
      adresse: nullable(form.adresse),
      cp: nullable(form.cp),
      commune: nullable(form.commune),
      nomPerPhy: form.typePersonne === "physique" ? nullable(form.nom) : null,
      prenomPerPhy: form.typePersonne === "physique" ? nullable(form.prenom) : null,
      nomPerMorale: form.typePersonne === "morale" ? nullable(form.raisonSociale) : null,
      siretSiren: form.typePersonne === "morale" ? nullable(form.siretSiren) : null,
      engagementAssurance: form.engagementAssurance === "on" ? 1 : 0,
      nomAssurance: nullable(form.nomAssurance),
      numeroPolice: nullable(form.numeroPolice),
      dateDebutAssurance: yield* dateValue(
        form.dateDebutAssurance,
        "Date de début d'assurance invalide",
      ),
      dateFinAssurance: yield* dateValue(form.dateFinAssurance, "Date de fin d'assurance invalide"),
      competences: form.competences === "on" ? 1 : 0,
    };
    yield* upsertRecord("cerfa.diagnostiqueur.save", {
      find: (db) =>
        db
          .select({ id: cerfaDiagnostiqueur.id })
          .from(cerfaDiagnostiqueur)
          .where(eq(cerfaDiagnostiqueur.projetId, id))
          .limit(1),
      update: (db) =>
        db.update(cerfaDiagnostiqueur).set(values).where(eq(cerfaDiagnostiqueur.projetId, id)),
      insert: (db) => db.insert(cerfaDiagnostiqueur).values(values),
    });
    return { saved: true } as const;
  });
}

export function saveMaitreOuvrage(
  projectId: string,
  formData: FormData,
  user: WorkflowUser | null | undefined,
) {
  return Effect.gen(function* () {
    const id = yield* ensureProjectAccess(projectId, user);
    const form = yield* decodeFormData(MaitreOuvrageForm, formData);
    const values: InferInsertModel<typeof cerfaMtrOuvrage> = {
      projetId: id,
      adresse: nullable(form.adresse),
      cp: nullable(form.cp),
      commune: nullable(form.commune),
      nomPerPhy: form.typePersonne === "physique" ? nullable(form.nom) : null,
      prenomPerPhy: form.typePersonne === "physique" ? nullable(form.prenom) : null,
      nomPerMorale: form.typePersonne === "morale" ? nullable(form.raisonSociale) : null,
      siretSiren: nullable(form.siretSiren),
    };
    yield* upsertRecord("cerfa.moa.save", {
      find: (db) =>
        db
          .select({ id: cerfaMtrOuvrage.id })
          .from(cerfaMtrOuvrage)
          .where(eq(cerfaMtrOuvrage.projetId, id))
          .limit(1),
      update: (db) =>
        db.update(cerfaMtrOuvrage).set(values).where(eq(cerfaMtrOuvrage.projetId, id)),
      insert: (db) => db.insert(cerfaMtrOuvrage).values(values),
    });
    return { saved: true } as const;
  });
}

export function saveDiagnostic(
  projectId: string,
  formData: FormData,
  user: WorkflowUser | null | undefined,
) {
  return Effect.gen(function* () {
    const id = yield* ensureProjectAccess(projectId, user);
    const form = yield* decodeFormData(DiagnosticForm, formData);
    const values: InferInsertModel<typeof cerfaDiagnostic> = {
      projetId: id,
      derniereVisite: yield* dateValue(form.derniereVisite, "Date de visite invalide"),
      batVisite: nullable(form.batVisite),
      batNonVisite: nullable(form.batNonVisite),
      raisonsNePasVisite: nullable(form.raisonsNePasVisite),
      desordres: form.desordres === "true" ? 1 : 0,
      precaution: form.precaution === "true" ? 1 : 0,
      documentsConsultes: JSON.stringify(toStringArray(form.documentsConsultes)),
    };
    yield* upsertRecord("cerfa.diagnostic.save", {
      find: (db) =>
        db
          .select({ id: cerfaDiagnostic.id })
          .from(cerfaDiagnostic)
          .where(eq(cerfaDiagnostic.projetId, id))
          .limit(1),
      update: (db) =>
        db.update(cerfaDiagnostic).set(values).where(eq(cerfaDiagnostic.projetId, id)),
      insert: (db) => db.insert(cerfaDiagnostic).values(values),
    });
    return { saved: true } as const;
  });
}

export function saveOperation(
  projectId: string,
  formData: FormData,
  user: WorkflowUser | null | undefined,
) {
  return Effect.gen(function* () {
    const id = yield* ensureProjectAccess(projectId, user);
    const form = yield* decodeFormData(OperationForm, formData);
    const values: InferInsertModel<typeof cerfaOperation> = {
      projetId: id,
      adresse: nullable(form.adresse),
      cp: nullable(form.cp),
      commune: nullable(form.commune),
      dateDeDebut: yield* dateValue(form.dateDebut, "Date de début invalide"),
      dateDeFin: yield* dateValue(form.dateFin, "Date de fin invalide"),
      operation: nullable(form.operation),
      nbBatDemolition: yield* numberValue(
        form.nbBatDemolition,
        "Nombre de bâtiments à démolir invalide",
      ),
      surfaceADemolir: yield* numberValue(form.surfaceDemolir, "Surface à démolir invalide"),
      nbBatRenovation: yield* numberValue(
        form.nbBatRenovation,
        "Nombre de bâtiments à rénover invalide",
      ),
      surfaceARenover: yield* numberValue(form.surfaceRenover, "Surface à rénover invalide"),
      typologieBat: JSON.stringify(toStringArray(form.typologies)),
      datePermisDeConstruire: yield* dateValue(form.datePermis, "Date du permis invalide"),
      operationSoumis: JSON.stringify(toStringArray(form.operationsSoumis)),
    };
    yield* upsertRecord("cerfa.operation.save", {
      find: (db) =>
        db
          .select({ id: cerfaOperation.id })
          .from(cerfaOperation)
          .where(eq(cerfaOperation.projetId, id))
          .limit(1),
      update: (db) => db.update(cerfaOperation).set(values).where(eq(cerfaOperation.projetId, id)),
      insert: (db) => db.insert(cerfaOperation).values(values),
    });
    return { saved: true } as const;
  });
}

function accessibleProjectIds(
  database: DatabaseServiceType,
  user: WorkflowUser,
): Effect.Effect<string[] | null, DatabaseError> {
  if (user.role === "admin") return Effect.succeed(null);
  return database.run("cerfa.access.projects", (db) =>
    db
      .select({ id: userProjet.projetId })
      .from(userProjet)
      .where(eq(userProjet.userId, user.id))
      .then((rows) => rows.map((row) => row.id)),
  );
}

function ensureProjectAccess(projectId: string, user: WorkflowUser | null | undefined) {
  return Effect.gen(function* () {
    const currentUser = yield* authenticatedUser(user);
    const id = yield* requiredString(projectId, "Projet manquant");
    const database = yield* Database;
    if (currentUser.role !== "admin") {
      const rows = yield* database.run("cerfa.access.project", (db) =>
        db
          .select({ id: userProjet.projetId })
          .from(userProjet)
          .where(and(eq(userProjet.userId, currentUser.id), eq(userProjet.projetId, id))),
      );
      if (rows.length === 0)
        return yield* Effect.fail(
          new ForbiddenError({ message: "Accès non autorisé à ce projet" }),
        );
    }
    return id;
  });
}

function upsertRecord(
  operation: string,
  input: {
    readonly find: (database: AppDatabase) => PromiseLike<ReadonlyArray<{ readonly id: number }>>;
    readonly update: (database: AppDatabase) => PromiseLike<unknown>;
    readonly insert: (database: AppDatabase) => PromiseLike<unknown>;
  },
) {
  return Effect.gen(function* () {
    const database = yield* Database;
    yield* database.run(operation, async (db) => {
      const existing = await input.find(db);
      if (existing.length > 0) {
        await input.update(db);
      } else {
        await input.insert(db);
      }
    });
  });
}

type DatabaseServiceType = import("$lib/server/services/database").DatabaseService;

function nullable(value: string | undefined): string | null {
  return value && value.length > 0 ? value : null;
}

function toStringArray(value: string | readonly string[] | undefined): string[] {
  if (value === undefined) return [];
  if (typeof value === "string") return [value];
  return Array.from(value);
}

function dateValue(
  value: string | undefined,
  message: string,
): Effect.Effect<number | null, ValidationError> {
  if (!value) return Effect.succeed(null);
  const date = new Date(value).getTime();
  return Number.isFinite(date)
    ? Effect.succeed(date)
    : Effect.fail(new ValidationError({ message }));
}

function numberValue(
  value: string | undefined,
  message: string,
): Effect.Effect<number, ValidationError> {
  if (!value) return Effect.succeed(0);
  return optionalNumber(value, message).pipe(
    Effect.flatMap((number) => (number === null ? Effect.succeed(0) : Effect.succeed(number))),
  );
}

function authenticatedUser(
  user: WorkflowUser | null | undefined,
): Effect.Effect<WorkflowUser, UnauthenticatedError> {
  return user
    ? Effect.succeed(user)
    : Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));
}

function groupWasteRows<
  Row extends {
    readonly categorie: string | null;
    readonly nature: string | null;
    readonly codeDechet: number | null;
    readonly masse: number | null;
    readonly volume: number | null;
    readonly reemploi: number | null;
  },
>(rows: Row[]) {
  type Grouped = Row & { masse: number; volume: number; count: number };
  const groups = new Map<string, Grouped>();
  for (const item of rows) {
    if (item.reemploi !== 0 && item.reemploi !== null) continue;
    const key = `${item.categorie || "Inconnu"}_${item.nature || "Inconnu"}_${item.codeDechet || "NC"}`;
    const existing = groups.get(key);
    if (existing) {
      existing.masse += item.masse || 0;
      existing.volume += item.volume || 0;
      existing.count += 1;
    } else {
      groups.set(key, { ...item, masse: item.masse || 0, volume: item.volume || 0, count: 1 });
    }
  }
  return Array.from(groups.values());
}
