import { Effect } from "effect";
import {
  DatabaseError,
  ForbiddenError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import { formId, optionalNumber, requiredFormString } from "$lib/effect/schemas/forms";
import { Authorization, type PermissionConfig } from "$lib/server/services/authorization";
import { Database } from "$lib/server/services/database";
import type { AppDatabase } from "$lib/server/db/client";
import { categorieV2, groupe, natureV2, objets } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export type AdminWorkflowUser = {
  readonly id: string;
  readonly role?: string | null;
};

type AdminError = ValidationError | UnauthenticatedError | ForbiddenError | DatabaseError;
type DatabaseQuery<A> = (database: AppDatabase) => PromiseLike<A>;

export function readAdminData<A>(operation: string, query: DatabaseQuery<A>) {
  return Effect.gen(function* () {
    const database = yield* Database;
    return yield* database.run(operation, query);
  });
}

export function readAdminDataPair<A, B>(
  first: { readonly operation: string; readonly query: DatabaseQuery<A> },
  second: { readonly operation: string; readonly query: DatabaseQuery<B> },
) {
  return Effect.all(
    [readAdminData(first.operation, first.query), readAdminData(second.operation, second.query)],
    { concurrency: 2 },
  );
}

export function loadCategoryAdminData() {
  return readAdminDataPair(
    {
      operation: "admin.category.list",
      query: (db) =>
        db
          .select({
            id: categorieV2.id,
            categorie: categorieV2.categoriev2,
            groupeId: categorieV2.groupeId,
            groupeName: groupe.groupe,
          })
          .from(categorieV2)
          .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
          .all(),
    },
    {
      operation: "admin.group.list",
      query: (db) => db.select().from(groupe).all(),
    },
  );
}

export function loadGroupAdminData() {
  return readAdminData("admin.group.list", (db) => db.select().from(groupe).all());
}

export function loadNatureAdminData() {
  return readAdminData("admin.nature.list", (db) => db.select().from(natureV2).all());
}

export function loadObjectAdminData() {
  return readAdminDataPair(
    {
      operation: "admin.object.list",
      query: (db) =>
        db
          .select({
            id: objets.id,
            objet: objets.objet,
            categorieId: objets.categorieId,
            categorieName: categorieV2.categoriev2,
          })
          .from(objets)
          .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
          .all(),
    },
    {
      operation: "admin.category.list",
      query: (db) => db.select().from(categorieV2).all(),
    },
  );
}

export function createGroup(formData: FormData) {
  return createAdminEntity({
    formData,
    field: "groupe",
    entityName: "groupe",
    create: (db, name) => db.insert(groupe).values({ groupe: name }),
  });
}

export function updateGroup(formData: FormData) {
  return updateAdminEntity({
    formData,
    field: "groupe",
    idType: "number",
    entityName: "groupe",
    update: (db, id, name) => {
      if (typeof id !== "number") throw new Error("Group id must be numeric");
      return db.update(groupe).set({ groupe: name }).where(eq(groupe.id, id));
    },
  });
}

export function deleteGroup(formData: FormData, user: AdminWorkflowUser | null | undefined) {
  return deleteAdminEntity({
    formData,
    user,
    field: "id",
    entityName: "groupe",
    idType: "number",
    delete: (db, id) => {
      if (typeof id !== "number") throw new Error("Group id must be numeric");
      return db.delete(groupe).where(eq(groupe.id, id));
    },
  });
}

export function deleteCategory(formData: FormData, user: AdminWorkflowUser | null | undefined) {
  return deleteAdminEntity({
    formData,
    user,
    field: "id",
    entityName: "category",
    idType: "number",
    delete: (db, id) => {
      if (typeof id !== "number") throw new Error("Category id must be numeric");
      return db.delete(categorieV2).where(eq(categorieV2.id, id));
    },
  });
}

export function deleteNature(formData: FormData, user: AdminWorkflowUser | null | undefined) {
  return deleteAdminEntity({
    formData,
    user,
    field: "id",
    entityName: "nature",
    idType: "number",
    delete: (db, id) => {
      if (typeof id !== "number") throw new Error("Nature id must be numeric");
      return db.delete(natureV2).where(eq(natureV2.id, id));
    },
  });
}

export function deleteObject(formData: FormData, user: AdminWorkflowUser | null | undefined) {
  return deleteAdminEntity({
    formData,
    user,
    field: "id",
    entityName: "objet",
    idType: "number",
    delete: (db, id) => {
      if (typeof id !== "number") throw new Error("Object id must be numeric");
      return db.delete(objets).where(eq(objets.id, id));
    },
  });
}

export function deleteAdminEntity(input: {
  readonly formData: FormData;
  readonly user: AdminWorkflowUser | null | undefined;
  readonly field: string;
  readonly idType: "number" | "string";
  readonly entityName: string;
  readonly permission?: PermissionConfig;
  readonly delete: (database: AppDatabase, id: number | string) => PromiseLike<unknown>;
}): Effect.Effect<
  { readonly success: true },
  AdminError | import("$lib/effect/errors").AuthenticationProviderError,
  Database | Authorization
> {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);

    if (input.permission) {
      const authorization = yield* Authorization;
      const permission = yield* authorization.checkPermission(user.id, input.permission);
      if (!permission.success) {
        return yield* Effect.fail(new ForbiddenError({ message: "Permission refusée" }));
      }
    }

    const id = yield* formId(input.formData, input.field, input.idType, "ID requis");
    const database = yield* Database;
    yield* database.run(`admin.${input.entityName}.delete`, (db) => input.delete(db, id));
    return { success: true } as const;
  });
}

export function createAdminEntity(input: {
  readonly formData: FormData;
  readonly field: string;
  readonly entityName: string;
  readonly create: (database: AppDatabase, name: string) => PromiseLike<unknown>;
}): Effect.Effect<{ readonly success: true }, ValidationError | DatabaseError, Database> {
  return Effect.gen(function* () {
    const name = yield* requiredFormString(input.formData, input.field, "Le nom est requis");
    const database = yield* Database;
    yield* database.run(`admin.${input.entityName}.create`, (db) => input.create(db, name));
    return { success: true } as const;
  });
}

export function updateAdminEntity(input: {
  readonly formData: FormData;
  readonly field: string;
  readonly idType: "number" | "string";
  readonly entityName: string;
  readonly update: (
    database: AppDatabase,
    id: number | string,
    name: string,
  ) => PromiseLike<unknown>;
}): Effect.Effect<{ readonly success: true }, ValidationError | DatabaseError, Database> {
  return Effect.gen(function* () {
    const id = yield* formId(input.formData, "id", input.idType, "ID requis");
    const name = yield* requiredFormString(input.formData, input.field, "Le nom est requis");
    const database = yield* Database;
    yield* database.run(`admin.${input.entityName}.update`, (db) => input.update(db, id, name));
    return { success: true } as const;
  });
}

export function createCategory(formData: FormData) {
  return Effect.gen(function* () {
    const categorie = yield* requiredFormString(
      formData,
      "categorie",
      "Le nom de la catégorie et le groupe sont requis",
    );
    const groupeId = yield* formId(
      formData,
      "groupeId",
      "number",
      "Le nom de la catégorie et le groupe sont requis",
    );
    if (typeof groupeId !== "number") {
      return yield* Effect.fail(
        new ValidationError({ message: "Le nom de la catégorie et le groupe sont requis" }),
      );
    }
    const database = yield* Database;
    yield* database.run("admin.category.create", (db) =>
      db.insert(categorieV2).values({ categoriev2: categorie, groupeId }),
    );
    return { success: true } as const;
  });
}

export function updateCategory(formData: FormData) {
  return Effect.gen(function* () {
    const id = yield* formId(formData, "id", "number", "ID, nom de la catégorie et groupe requis");
    const categorie = yield* requiredFormString(
      formData,
      "categorie",
      "ID, nom de la catégorie et groupe requis",
    );
    const groupeId = yield* formId(
      formData,
      "groupeId",
      "number",
      "ID, nom de la catégorie et groupe requis",
    );
    if (typeof id !== "number" || typeof groupeId !== "number") {
      return yield* Effect.fail(
        new ValidationError({ message: "ID, nom de la catégorie et groupe requis" }),
      );
    }
    const database = yield* Database;
    yield* database.run("admin.category.update", (db) =>
      db
        .update(categorieV2)
        .set({ categoriev2: categorie, groupeId })
        .where(eq(categorieV2.id, id)),
    );
    return { success: true } as const;
  });
}

export function createNature(formData: FormData) {
  return natureMutation(formData, "create");
}

export function updateNature(formData: FormData) {
  return natureMutation(formData, "update");
}

function natureMutation(formData: FormData, mode: "create" | "update") {
  return Effect.gen(function* () {
    const nature = yield* requiredFormString(
      formData,
      "nature",
      mode === "create" ? "Le nom de la nature est requis" : "ID et nom de la nature requis",
    );
    const id =
      mode === "update"
        ? yield* formId(formData, "id", "number", "ID et nom de la nature requis")
        : null;
    if (mode === "update" && typeof id !== "number") {
      return yield* Effect.fail(new ValidationError({ message: "ID et nom de la nature requis" }));
    }

    const reutilisation = yield* formNumberOrZero(formData, "reutilisation");
    const recyclable = yield* formNumberOrZero(formData, "recyclable");
    const valorisationMatiere = yield* formNumberOrZero(formData, "valorisationMatiere");
    const valorisationEnergetique = yield* formNumberOrZero(formData, "valorisationEnergetique");
    const densite = yield* optionalFormNumber(formData, "densite");
    const codeDechet = yield* optionalFormNumber(formData, "codeDechet");
    const incinerationSansValorisationEnergetique = yield* formNumberOrZero(
      formData,
      "incinerationSansValorisationEnergetique",
    );
    const nonValorisation = yield* formNumberOrZero(formData, "nonValorisation");
    const stockage = optionalFormString(formData, "stockage");
    const ecoOrganismeRep = optionalFormString(formData, "ecoOrganismeRep");
    const values = {
      nature,
      reutilisation,
      recyclable,
      valorisationMatiere,
      valorisationEnergetique,
      densite,
      stockage,
      codeDechet,
      ecoOrganismeRep,
      incinerationSansValorisationEnergetique,
      nonValorisation,
    };
    const database = yield* Database;

    if (mode === "create") {
      yield* database.run("admin.nature.create", (db) => db.insert(natureV2).values(values));
    } else {
      yield* database.run("admin.nature.update", (db) =>
        db
          .update(natureV2)
          .set(values)
          .where(eq(natureV2.id, id as number)),
      );
    }

    return { success: true } as const;
  });
}

export function createObject(formData: FormData) {
  return objectMutation(formData, "create");
}

export function updateObject(formData: FormData) {
  return objectMutation(formData, "update");
}

function objectMutation(formData: FormData, mode: "create" | "update") {
  return Effect.gen(function* () {
    const objet = yield* requiredFormString(
      formData,
      "objet",
      mode === "create"
        ? "Le nom de l'objet et la catégorie sont requis"
        : "ID, nom de l'objet et catégorie requis",
    );
    const categorieId = yield* formId(
      formData,
      "categorieId",
      "number",
      mode === "create"
        ? "Le nom de l'objet et la catégorie sont requis"
        : "ID, nom de l'objet et catégorie requis",
    );
    const id =
      mode === "update"
        ? yield* formId(formData, "id", "number", "ID, nom de l'objet et catégorie requis")
        : null;
    if (typeof categorieId !== "number" || (mode === "update" && typeof id !== "number")) {
      return yield* Effect.fail(
        new ValidationError({
          message:
            mode === "create"
              ? "Le nom de l'objet et la catégorie sont requis"
              : "ID, nom de l'objet et catégorie requis",
        }),
      );
    }
    const database = yield* Database;
    if (mode === "create") {
      yield* database.run("admin.object.create", (db) =>
        db.insert(objets).values({ objet, categorieId }),
      );
    } else {
      yield* database.run("admin.object.update", (db) =>
        db
          .update(objets)
          .set({ objet, categorieId })
          .where(eq(objets.id, id as number)),
      );
    }
    return { success: true } as const;
  });
}

function optionalFormString(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function formNumberOrZero(formData: FormData, field: string) {
  const value = formData.get(field);
  if (value === null || value === "") return Effect.succeed(0);
  return optionalNumber(typeof value === "string" ? value : undefined, `${field} invalide`).pipe(
    Effect.map((number) => number ?? 0),
  );
}

function optionalFormNumber(formData: FormData, field: string) {
  const value = formData.get(field);
  return optionalNumber(typeof value === "string" ? value : undefined, `${field} invalide`);
}

function authenticatedUser(
  user: AdminWorkflowUser | null | undefined,
): Effect.Effect<AdminWorkflowUser, UnauthenticatedError> {
  return user
    ? Effect.succeed(user)
    : Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));
}
