import { Effect } from "effect";
import type { InferInsertModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
import {
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import { decodeFormData, optionalNumber, requiredString } from "$lib/effect/schemas/forms";
import {
  CompanyForm,
  EstablishmentForm,
  ProjectForm,
  UserProjectAssignmentForm,
} from "$lib/effect/schemas/administration";
import { etablissement, projet, societe, userProjet } from "$lib/server/db/schema";
import type { AppDatabase } from "$lib/server/db/client";
import { Database } from "$lib/server/services/database";

export type AdminUser = {
  readonly id: string;
  readonly role?: string | null;
};

export type AdminProjectListRow = {
  readonly id: string;
  readonly libelle: string;
  readonly reference: string;
  readonly rue: string;
  readonly cp: string;
  readonly ville: string;
  readonly dateDemarrage: number;
  readonly dateDeFin: number | null;
  readonly typeOperation: string | null;
  readonly maitreDOuvrage: string | null;
  readonly etablissementId: number;
  readonly etablissementNom: string | null;
  readonly societeNom: string | null;
};

export type ProjectListRow = {
  readonly id: string;
  readonly libelle: string;
  readonly reference: string;
  readonly ville: string;
  readonly cp: string;
  readonly rue: string;
  readonly dateDemarrage: number;
  readonly dateDeFin: number | null;
  readonly codeInsee: string;
  readonly section: string;
  readonly parcelle: string;
  readonly typeOperation: string | null;
  readonly maitreDOuvrage: string | null;
  readonly etablissementId: number;
  readonly etablissementNom: string | null;
  readonly societeNom: string | null;
};

export type EstablishmentOption = {
  readonly id: number;
  readonly nom: string;
  readonly societeId: number;
  readonly societeNom: string | null;
};

export function loadEstablishments() {
  return read("admin.establishments.list", (database) => database.select().from(etablissement));
}

export function loadEstablishment(idValue: string) {
  return Effect.gen(function* () {
    const id = yield* numericId(idValue, "ID invalide");
    const row = yield* read("admin.establishment.detail", (database) =>
      database
        .select()
        .from(etablissement)
        .leftJoin(societe, eq(etablissement.societeId, societe.id))
        .where(eq(etablissement.id, id))
        .limit(1),
    );

    if (row.length === 0) {
      return yield* Effect.fail(new NotFoundError({ message: "Établissement non trouvé" }));
    }

    return {
      etablissement: row[0].etablissement,
      societe: row[0].societe,
    };
  });
}

export function loadEstablishmentEdit(idValue: string) {
  return Effect.gen(function* () {
    const id = yield* numericId(idValue, "ID invalide");
    const [establishmentRows, companies] = yield* Effect.all(
      [
        read("admin.establishment.edit", (database) =>
          database.select().from(etablissement).where(eq(etablissement.id, id)).limit(1),
        ),
        loadCompanies(),
      ],
      { concurrency: 2 },
    );

    if (establishmentRows.length === 0) {
      return yield* Effect.fail(new NotFoundError({ message: "Établissement non trouvé" }));
    }

    return { etablissement: establishmentRows[0], societes: companies };
  });
}

export function loadCompanyOptions() {
  return read("admin.establishment.companies", (database) => database.select().from(societe));
}

export function createEstablishment(formData: FormData) {
  return Effect.gen(function* () {
    const form = yield* decodeFormData(EstablishmentForm, formData);
    const data = yield* establishmentValues(form, "Veuillez remplir tous les champs obligatoires");
    const inserted = yield* read("admin.establishment.create", (database) =>
      database.insert(etablissement).values(data).returning({ insertedId: etablissement.id }),
    );

    return { insertedId: inserted[0]?.insertedId ?? null };
  });
}

export function updateEstablishment(idValue: string, formData: FormData) {
  return Effect.gen(function* () {
    const id = yield* numericId(idValue, "ID invalide");
    const form = yield* decodeFormData(EstablishmentForm, formData);
    const data = yield* establishmentValues(form, "Veuillez remplir les champs obligatoires", true);
    yield* read("admin.establishment.update", (database) =>
      database.update(etablissement).set(data).where(eq(etablissement.id, id)),
    );
    return { updatedId: id };
  });
}

export function deleteEstablishment(input: {
  readonly formData: FormData;
  readonly user: AdminUser | null | undefined;
}) {
  return Effect.gen(function* () {
    yield* requireAdminUser(input.user);
    const id = yield* numericFormId(input.formData, "id", "ID invalide");
    const linked = yield* read("admin.establishment.linked-projects", (database) =>
      database.select({ id: projet.id }).from(projet).where(eq(projet.etablissementId, id)),
    );

    if (linked.length > 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: `Impossible de supprimer : ${linked.length} projet(s) sont encore liés à cet établissement. Veuillez d'abord les réassigner ou les supprimer.`,
        }),
      );
    }

    yield* read("admin.establishment.delete", (database) =>
      database.delete(etablissement).where(eq(etablissement.id, id)),
    );
    return { success: true, message: "Établissement supprimé avec succès" } as const;
  });
}

export function loadAdminProjects() {
  return read("admin.projects.list", (database) =>
    database
      .select({
        id: projet.id,
        libelle: projet.libelle,
        reference: projet.reference,
        rue: projet.rue,
        cp: projet.cp,
        ville: projet.ville,
        dateDemarrage: projet.dateDemarrage,
        dateDeFin: projet.dateDeFin,
        typeOperation: projet.typeOperation,
        maitreDOuvrage: projet.maitreDOuvrage,
        etablissementId: projet.etablissementId,
        etablissementNom: etablissement.nom,
        societeNom: societe.nom,
      })
      .from(projet)
      .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
      .leftJoin(societe, eq(etablissement.societeId, societe.id)),
  );
}

export function loadAdminProject(idValue: string) {
  return Effect.gen(function* () {
    const id = yield* requiredString(idValue, "Projet manquant");
    const rows = yield* read("admin.project.detail", (database) =>
      database
        .select({
          id: projet.id,
          libelle: projet.libelle,
          reference: projet.reference,
          codeInsee: projet.codeInsee,
          rue: projet.rue,
          cp: projet.cp,
          ville: projet.ville,
          dateDemarrage: projet.dateDemarrage,
          dateDeFin: projet.dateDeFin,
          section: projet.section,
          parcelle: projet.parcelle,
          typeOperation: projet.typeOperation,
          maitreDOuvrage: projet.maitreDOuvrage,
          etablissementId: projet.etablissementId,
          etablissementNom: etablissement.nom,
          etablissementVille: etablissement.ville,
          societeId: societe.id,
          societeNom: societe.nom,
        })
        .from(projet)
        .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
        .leftJoin(societe, eq(etablissement.societeId, societe.id))
        .where(eq(projet.id, id)),
    );

    if (rows.length === 0) {
      return yield* Effect.fail(new NotFoundError({ message: "Projet non trouvé" }));
    }
    return rows[0];
  });
}

export function loadProjectFormOptions() {
  return read("admin.project.establishments", (database) =>
    database
      .select({
        id: etablissement.id,
        nom: etablissement.nom,
        societeId: etablissement.societeId,
        societeNom: societe.nom,
      })
      .from(etablissement)
      .leftJoin(societe, eq(etablissement.societeId, societe.id)),
  );
}

export function loadAdminProjectEdit(idValue: string) {
  return Effect.gen(function* () {
    const id = yield* requiredString(idValue, "Projet manquant");
    const [projectRows, establishments] = yield* Effect.all(
      [
        read("admin.project.edit", (database) =>
          database.select().from(projet).where(eq(projet.id, id)),
        ),
        loadProjectFormOptions(),
      ],
      { concurrency: 2 },
    );
    if (projectRows.length === 0) {
      return yield* Effect.fail(new NotFoundError({ message: "Projet non trouvé" }));
    }
    return { projet: projectRows[0], etablissements: establishments };
  });
}

export function createAdminProject(formData: FormData) {
  return Effect.gen(function* () {
    const form = yield* decodeFormData(ProjectForm, formData);
    const data = yield* projectValues(form, true);
    const inserted = yield* read("admin.project.create", (database) =>
      database.insert(projet).values(data).returning({ insertedId: projet.id }),
    );
    return { insertedId: inserted[0]?.insertedId ?? null };
  });
}

export function updateAdminProject(idValue: string, formData: FormData) {
  return Effect.gen(function* () {
    const id = yield* requiredString(idValue, "Projet manquant");
    const form = yield* decodeFormData(ProjectForm, formData);
    const data = yield* projectValues(form, false);
    yield* read("admin.project.update", (database) =>
      database.update(projet).set(data).where(eq(projet.id, id)),
    );
    return { updatedId: id };
  });
}

export function deleteAdminProject(input: {
  readonly formData: FormData;
  readonly user: AdminUser | null | undefined;
}) {
  return Effect.gen(function* () {
    yield* requireAdminUser(input.user);
    const id = yield* stringFormId(input.formData, "projetId", "ID du projet requis");
    yield* read("admin.project.delete", (database) =>
      database.delete(projet).where(eq(projet.id, id)),
    );
    return { success: true } as const;
  });
}

export function loadCompanies() {
  return read("admin.companies.list", (database) => database.select().from(societe));
}

export function updateCompany(formData: FormData) {
  return Effect.gen(function* () {
    const form = yield* decodeFormData(CompanyForm, formData);
    const id = yield* formNumber(form.id, "Données manquantes", true);
    const data = yield* companyValues(form, "Données manquantes", true);
    yield* read("admin.company.update", (database) =>
      database.update(societe).set(data).where(eq(societe.id, id)),
    );
    return { success: true } as const;
  });
}

export function createCompany(formData: FormData) {
  return Effect.gen(function* () {
    const form = yield* decodeFormData(CompanyForm, formData);
    const data = yield* companyValues(form, "Le nom est requis", false);
    yield* read("admin.company.create", (database) => database.insert(societe).values(data));
    return { success: true } as const;
  });
}

export function deleteCompany(formData: FormData) {
  return Effect.gen(function* () {
    const form = yield* decodeFormData(CompanyForm, formData);
    const id = yield* formNumber(form.id, "ID manquant", true);
    yield* read("admin.company.delete", (database) =>
      database.delete(societe).where(eq(societe.id, id)),
    );
    return { success: true } as const;
  });
}

export function loadUserProjectAssignments() {
  return Effect.all(
    [
      read("admin.user-projects.projects", (database) =>
        database
          .select({ id: projet.id, libelle: projet.libelle, reference: projet.reference })
          .from(projet),
      ),
      read("admin.user-projects.assignments", (database) =>
        database
          .select({ userId: userProjet.userId, projetId: userProjet.projetId })
          .from(userProjet),
      ),
    ],
    { concurrency: 2 },
  ).pipe(Effect.map(([projets, usersWithProjets]) => ({ projets, usersWithProjets })));
}

export function setUserProjectAssignments(formData: FormData) {
  return Effect.gen(function* () {
    const base = yield* decodeFormData(UserProjectAssignmentForm, formData);
    const userId = yield* requiredString(base.userId, "userId requis");
    const rawProjectIds = formData.getAll("projetIds");
    if (rawProjectIds.some((value) => typeof value !== "string")) {
      return yield* Effect.fail(new ValidationError({ message: "Données de projets invalides" }));
    }
    const projectIds = rawProjectIds as string[];
    yield* read("admin.user-projects.set", (database) =>
      database.transaction(async (transaction) => {
        await transaction.delete(userProjet).where(eq(userProjet.userId, userId));
        if (projectIds.length > 0) {
          await transaction
            .insert(userProjet)
            .values(projectIds.map((projetId) => ({ userId, projetId })));
        }
      }),
    );
    return { success: true } as const;
  });
}

function read<A>(operation: string, query: (database: AppDatabase) => PromiseLike<A>) {
  return Effect.gen(function* () {
    const database = yield* Database;
    return yield* database.run(operation, query);
  });
}

function requireAdminUser(user: AdminUser | null | undefined) {
  if (!user) return Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));
  if (user.role !== "admin") return Effect.fail(new ForbiddenError({ message: "Non autorisé" }));
  return Effect.succeed(user);
}

function numericId(value: string, message: string): Effect.Effect<number, ValidationError> {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0
    ? Effect.succeed(parsed)
    : Effect.fail(new ValidationError({ message }));
}

function formId(
  formData: FormData,
  field: string,
  message: string,
): Effect.Effect<number | string, ValidationError> {
  const value = formData.get(field);
  if (typeof value !== "string" || value.length === 0)
    return Effect.fail(new ValidationError({ message }));
  const parsed = Number(value);
  if (field === "projetId") return Effect.succeed(value);
  return Number.isInteger(parsed) && parsed > 0
    ? Effect.succeed(parsed)
    : Effect.fail(new ValidationError({ message }));
}

function numericFormId(
  formData: FormData,
  field: string,
  message: string,
): Effect.Effect<number, ValidationError> {
  return Effect.gen(function* () {
    const id = yield* formId(formData, field, message);
    return typeof id === "number" ? id : yield* Effect.fail(new ValidationError({ message }));
  });
}

function stringFormId(
  formData: FormData,
  field: string,
  message: string,
): Effect.Effect<string, ValidationError> {
  return Effect.gen(function* () {
    const id = yield* formId(formData, field, message);
    return typeof id === "string" ? id : yield* Effect.fail(new ValidationError({ message }));
  });
}

function text(value: string | undefined): string {
  return value ?? "";
}

function optionalText(value: string | undefined): string | null {
  const normalized = text(value);
  return normalized.length > 0 ? normalized : null;
}

function formNumber(
  value: string | undefined,
  message: string,
  required: boolean,
): Effect.Effect<number, ValidationError> {
  if (!value || value.length === 0) {
    return required ? Effect.fail(new ValidationError({ message })) : Effect.succeed(0);
  }
  return optionalNumber(value, message).pipe(
    Effect.flatMap((parsed) =>
      parsed === null || (parsed === 0 && required)
        ? Effect.fail(new ValidationError({ message }))
        : Effect.succeed(parsed),
    ),
  );
}

function establishmentValues(
  form: import("$lib/effect/schemas/administration").EstablishmentFormInput,
  message: string,
  update = false,
): Effect.Effect<InferInsertModel<typeof etablissement>, ValidationError> {
  return Effect.gen(function* () {
    const data = {
      nom: text(form.nom),
      societeId: yield* formNumber(form.societeId, message, true),
      raisonSocial: text(form.raisonSocial),
      rue: text(form.rue),
      cp: text(form.cp),
      ville: text(form.ville),
      tel: text(form.tel),
      fax: text(form.fax),
      email: text(form.email),
      siret: text(form.siret),
    };
    const valid = update
      ? Boolean(data.nom && data.societeId && data.siret)
      : Boolean(
          data.nom &&
          data.societeId &&
          data.siret &&
          data.raisonSocial &&
          data.rue &&
          data.cp &&
          data.ville &&
          data.tel &&
          data.email,
        );
    return valid ? data : yield* Effect.fail(new ValidationError({ message }));
  });
}

function parseDate(value: string | undefined, fallback: number | null, message: string) {
  if (!value) return Effect.succeed(fallback);
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed)
    ? Effect.succeed(parsed as number | null)
    : Effect.fail(new ValidationError({ message }));
}

function projectValues(
  form: import("$lib/effect/schemas/administration").ProjectFormInput,
  creating: true,
): Effect.Effect<InferInsertModel<typeof projet>, ValidationError>;
function projectValues(
  form: import("$lib/effect/schemas/administration").ProjectFormInput,
  creating: false,
): Effect.Effect<Omit<InferInsertModel<typeof projet>, "id">, ValidationError>;
function projectValues(
  form: import("$lib/effect/schemas/administration").ProjectFormInput,
  creating: boolean,
): Effect.Effect<
  InferInsertModel<typeof projet> | Omit<InferInsertModel<typeof projet>, "id">,
  ValidationError
> {
  return Effect.gen(function* () {
    const id = text(form.id);
    if (creating && !id) {
      return yield* Effect.fail(
        new ValidationError({ message: "L'ID Matterport est obligatoire" }),
      );
    }
    const libelle = text(form.libelle);
    const reference = text(form.reference);
    const etablissementId = yield* formNumber(
      form.etablissementId,
      "Veuillez remplir tous les champs obligatoires",
      true,
    );
    const rue = text(form.rue);
    const ville = text(form.ville);
    const section = text(form.section);
    const parcelle = text(form.parcelle);
    if (!libelle || !reference || !etablissementId || !rue || !ville || !section || !parcelle) {
      return yield* Effect.fail(
        new ValidationError({ message: "Veuillez remplir tous les champs obligatoires" }),
      );
    }
    const dateDemarrage = yield* parseDate(
      form.dateDemarrage,
      Date.now(),
      "Date de démarrage invalide",
    );
    const dateDeFin = yield* parseDate(form.dateDeFin, null, "Date de fin invalide");
    if (dateDemarrage === null) {
      return yield* Effect.fail(new ValidationError({ message: "Date de démarrage invalide" }));
    }
    const common = {
      libelle,
      reference,
      etablissementId,
      codeInsee: text(form.codeInsee),
      rue,
      cp: text(form.cp),
      ville,
      dateDemarrage,
      section,
      parcelle,
      typeOperation: optionalText(form.typeOperation),
      maitreDOuvrage: optionalText(form.maitreDOuvrage),
      dateDeFin,
    };
    return creating ? { id, ...common } : common;
  });
}

function companyValues(
  form: import("$lib/effect/schemas/administration").CompanyFormInput,
  message: string,
  updating: boolean,
): Effect.Effect<InferInsertModel<typeof societe>, ValidationError> {
  return Effect.gen(function* () {
    const nom = text(form.nom);
    if (!nom) return yield* Effect.fail(new ValidationError({ message }));
    const type = yield* formNumber(form.type, "Données manquantes", false);
    return {
      nom,
      raisonSocial: text(form.raisonSocial),
      rue: text(form.rue),
      cp: text(form.cp),
      ville: text(form.ville),
      tel: text(form.tel),
      fax: text(form.fax),
      email: text(form.email),
      siren: optionalText(form.siren),
      type,
      ...(updating ? {} : {}),
    };
  });
}
