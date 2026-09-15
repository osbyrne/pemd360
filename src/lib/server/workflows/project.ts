import { Effect } from "effect";
import { nanoid } from "nanoid";
import type { InferSelectModel } from "drizzle-orm";
import {
  AuthenticationProviderError,
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import {
  decodeFormData,
  optionalInteger,
  optionalNumber,
  requiredString,
} from "$lib/effect/schemas/forms";
import { DeletePemdTagForm, PemdTagForm } from "$lib/effect/schemas/project";
import { Authorization } from "$lib/server/services/authorization";
import { Database } from "$lib/server/services/database";
import {
  categorieV2,
  etablissement,
  groupe,
  objets,
  pemd,
  projet,
  societe,
  tagMail,
  tagsAmiante,
  tagsPlomb,
  tagsTermite,
  userProjet,
} from "$lib/server/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export type WorkflowUser = {
  readonly id: string;
  readonly role?: string | null;
};

export type ProjectOption = {
  readonly id: string;
  readonly libelle: string;
};

export type ProjectViewerData = {
  readonly projet: InferSelectModel<typeof projet>;
  readonly tags: Array<InferSelectModel<typeof tagMail>>;
  readonly amianteTags: Array<InferSelectModel<typeof tagsAmiante>>;
  readonly plombTags: Array<InferSelectModel<typeof tagsPlomb>>;
  readonly termiteTags: Array<InferSelectModel<typeof tagsTermite>>;
  readonly pemdTags: Array<InferSelectModel<typeof pemd>>;
  readonly pemdFacets: Array<{
    readonly groupeId: number | null;
    readonly groupeName: string | null;
    readonly categorieId: number | null;
    readonly categorieName: string | null;
    readonly objetId: number | null;
    readonly objetName: string | null;
  }>;
  readonly groups: Array<{ readonly id: number; readonly name: string }>;
  readonly categoriesV2: Array<{
    readonly id: number;
    readonly name: string;
    readonly groupeId: number;
  }>;
  readonly allPemdObjects: Array<{
    readonly id: number;
    readonly name: string;
    readonly categorieId: number;
  }>;
  readonly matterportSdkKey: string;
};

type ProjectError = UnauthenticatedError | ForbiddenError | NotFoundError | ValidationError;
type ProjectIntegrationError = DatabaseError | AuthenticationProviderError;

export function loadProjectViewer(input: {
  readonly projectId: string;
  readonly user: WorkflowUser | null | undefined;
  readonly matterportSdkKey: string;
}): Effect.Effect<ProjectViewerData, ProjectError | ProjectIntegrationError, Database> {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    const projectId = yield* requiredString(input.projectId, "Projet manquant");
    const database = yield* Database;

    const projectRows = yield* database.run("project.viewer.project", (db) =>
      db.select().from(projet).where(eq(projet.id, projectId)),
    );
    const project = projectRows[0];
    if (!project) {
      return yield* Effect.fail(new NotFoundError({ message: "Projet non trouvé" }));
    }

    if (user.role !== "admin") {
      const access = yield* database.run("project.viewer.access", (db) =>
        db
          .select({ userId: userProjet.userId })
          .from(userProjet)
          .where(and(eq(userProjet.userId, user.id), eq(userProjet.projetId, projectId))),
      );

      if (access.length === 0) {
        return yield* Effect.fail(
          new ForbiddenError({ message: "Accès non autorisé à ce projet" }),
        );
      }
    }

    const [
      tags,
      amianteTags,
      plombTags,
      termiteTags,
      pemdTags,
      pemdFacets,
      groups,
      categoriesV2,
      allPemdObjects,
    ] = yield* Effect.all(
      [
        database.run("project.viewer.tags", (db) =>
          db.select().from(tagMail).where(eq(tagMail.projetId, projectId)),
        ),
        database.run("project.viewer.amiante", (db) =>
          db.select().from(tagsAmiante).where(eq(tagsAmiante.sidId, projectId)),
        ),
        database.run("project.viewer.plomb", (db) =>
          db.select().from(tagsPlomb).where(eq(tagsPlomb.sidId, projectId)),
        ),
        database.run("project.viewer.termite", (db) =>
          db.select().from(tagsTermite).where(eq(tagsTermite.sidId, projectId)),
        ),
        database.run("project.viewer.pemd", (db) =>
          db.select().from(pemd).where(eq(pemd.sidId, projectId)),
        ),
        database.run("project.viewer.facets", (db) =>
          db
            .select({
              groupeId: groupe.id,
              groupeName: groupe.groupe,
              categorieId: categorieV2.id,
              categorieName: categorieV2.categoriev2,
              objetId: objets.id,
              objetName: objets.objet,
            })
            .from(pemd)
            .leftJoin(objets, eq(pemd.objetId, objets.id))
            .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
            .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
            .where(eq(pemd.sidId, projectId))
            .orderBy(groupe.groupe, categorieV2.categoriev2, objets.objet),
        ),
        database.run("project.viewer.groups", (db) =>
          db.select({ id: groupe.id, name: groupe.groupe }).from(groupe).orderBy(groupe.groupe),
        ),
        database.run("project.viewer.categories", (db) =>
          db
            .select({
              id: categorieV2.id,
              name: categorieV2.categoriev2,
              groupeId: categorieV2.groupeId,
            })
            .from(categorieV2)
            .orderBy(categorieV2.categoriev2),
        ),
        database.run("project.viewer.objects", (db) =>
          db
            .select({ id: objets.id, name: objets.objet, categorieId: objets.categorieId })
            .from(objets)
            .orderBy(objets.objet),
        ),
      ],
      { concurrency: 4 },
    );

    return {
      projet: project,
      tags,
      amianteTags,
      plombTags,
      termiteTags,
      pemdTags,
      pemdFacets,
      groups,
      categoriesV2,
      allPemdObjects,
      matterportSdkKey: input.matterportSdkKey,
    };
  });
}

export function loadProjectList(user: WorkflowUser | null | undefined) {
  return Effect.gen(function* () {
    if (!user) return [];

    const database = yield* Database;
    const selection = {
      id: projet.id,
      libelle: projet.libelle,
      reference: projet.reference,
      ville: projet.ville,
      cp: projet.cp,
      rue: projet.rue,
      dateDemarrage: projet.dateDemarrage,
      dateDeFin: projet.dateDeFin,
      codeInsee: projet.codeInsee,
      section: projet.section,
      parcelle: projet.parcelle,
      typeOperation: projet.typeOperation,
      maitreDOuvrage: projet.maitreDOuvrage,
      etablissementId: projet.etablissementId,
      etablissementNom: etablissement.nom,
      societeNom: societe.nom,
    };

    if (user.role !== "admin") {
      const allowed = yield* database.run("project.list.allowed-ids", (db) =>
        db
          .select({ id: projet.id })
          .from(projet)
          .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
          .where(eq(userProjet.userId, user.id)),
      );
      if (allowed.length === 0) return [];

      return yield* database.run("project.list.allowed", (db) =>
        db
          .select(selection)
          .from(projet)
          .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
          .leftJoin(societe, eq(etablissement.societeId, societe.id))
          .where(
            inArray(
              projet.id,
              allowed.map((row) => row.id),
            ),
          )
          .orderBy(desc(projet.dateDemarrage)),
      );
    }

    return yield* database.run("project.list.all", (db) =>
      db
        .select(selection)
        .from(projet)
        .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
        .leftJoin(societe, eq(etablissement.societeId, societe.id))
        .orderBy(desc(projet.dateDemarrage)),
    );
  });
}

export function loadUserProjects(
  user: WorkflowUser,
): Effect.Effect<ProjectOption[], DatabaseError, Database> {
  return Effect.gen(function* () {
    const database = yield* Database;
    if (user.role === "admin") {
      return yield* database.run("project.access.all", (db) =>
        db.select({ id: projet.id, libelle: projet.libelle }).from(projet),
      );
    }

    return yield* database.run("project.access.user", (db) =>
      db
        .select({ id: projet.id, libelle: projet.libelle })
        .from(projet)
        .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
        .where(eq(userProjet.userId, user.id)),
    );
  });
}

export function loadProjectDetail(input: {
  readonly projectId: string;
  readonly user: WorkflowUser | null | undefined;
}) {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    const projectId = yield* requiredString(input.projectId, "Projet manquant");
    const database = yield* Database;
    const rows = yield* database.run("project.detail", (db) =>
      db
        .select({
          id: projet.id,
          libelle: projet.libelle,
          reference: projet.reference,
          ville: projet.ville,
          cp: projet.cp,
          rue: projet.rue,
          dateDemarrage: projet.dateDemarrage,
          dateDeFin: projet.dateDeFin,
          codeInsee: projet.codeInsee,
          section: projet.section,
          parcelle: projet.parcelle,
          typeOperation: projet.typeOperation,
          maitreDOuvrage: projet.maitreDOuvrage,
          etablissementId: projet.etablissementId,
          etablissementNom: etablissement.nom,
          societeNom: societe.nom,
        })
        .from(projet)
        .leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
        .leftJoin(societe, eq(etablissement.societeId, societe.id))
        .where(eq(projet.id, projectId)),
    );
    const project = rows[0];
    if (!project) return yield* Effect.fail(new NotFoundError({ message: "Projet non trouvé" }));

    if (user.role !== "admin") {
      const access = yield* database.run("project.detail.access", (db) =>
        db
          .select({ userId: userProjet.userId })
          .from(userProjet)
          .where(and(eq(userProjet.userId, user.id), eq(userProjet.projetId, projectId))),
      );
      if (access.length === 0) {
        return yield* Effect.fail(
          new ForbiddenError({ message: "Accès non autorisé à ce projet" }),
        );
      }
    }

    return { projet: project };
  });
}

export function createPemdTag(input: {
  readonly projectId: string;
  readonly user: WorkflowUser | null | undefined;
  readonly formData: FormData;
}): Effect.Effect<
  App.TagResponse,
  ProjectError | ProjectIntegrationError,
  Database | Authorization
> {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    const authorization = yield* Authorization;
    const permission = yield* authorization.userHasPermission({
      body: { userId: user.id, permissions: { tags: ["create"] } },
    });
    if (!permission.success) {
      return yield* Effect.fail(new ForbiddenError({ message: "Permission refusée" }));
    }

    const form = yield* decodeFormData(PemdTagForm, input.formData);
    const anchorPosition = yield* requiredString(form.anchorPosition, "Position manquante");
    const stemVector = yield* requiredString(form.stemVector, "Position manquante");
    const objetId = yield* optionalInteger(form.objetId, "Identifiant d'objet invalide");
    const natureId = yield* optionalInteger(form.natureId, "Identifiant de nature invalide");
    const quantite = yield* optionalNumber(form.quantite, "Quantité invalide");
    const longueur = yield* optionalNumber(form.longueur, "Longueur invalide");
    const largeur = yield* optionalNumber(form.largeur, "Largeur invalide");
    const epaisseur = yield* optionalNumber(form.epaisseur, "Épaisseur invalide");
    const database = yield* Database;
    const id = nanoid();

    yield* database.run("project.pemd.create", (db) =>
      db.insert(pemd).values({
        id,
        sidId: input.projectId,
        objetId,
        natureId,
        description: form.description || null,
        quantite,
        etage: form.etage || null,
        etat: form.etat || null,
        anchorPosition,
        stemVector,
        longueur,
        largeur,
        epaisseur,
        potentielReemploi: form.potentielReemploi || null,
        color: "#9933FF",
      }),
    );

    return {
      success: true,
      tag: {
        id,
        sidId: input.projectId,
        objetId,
        description: form.description || null,
        quantite,
        etage: form.etage || null,
        etat: form.etat || null,
        anchorPosition,
        stemVector,
      },
    };
  });
}

export function deletePemdTag(input: {
  readonly user: WorkflowUser | null | undefined;
  readonly formData: FormData;
}): Effect.Effect<
  { readonly success: true; readonly deletedId: string },
  ProjectError | ProjectIntegrationError,
  Database | Authorization
> {
  return Effect.gen(function* () {
    const user = yield* authenticatedUser(input.user);
    const authorization = yield* Authorization;
    const permission = yield* authorization.userHasPermission({
      body: { userId: user.id, permissions: { tags: ["delete"] } },
    });
    if (!permission.success) {
      return yield* Effect.fail(new ForbiddenError({ message: "Permission refusée" }));
    }

    const form = yield* decodeFormData(DeletePemdTagForm, input.formData);
    const tagId = yield* requiredString(form.tagId, "ID du tag manquant");
    const database = yield* Database;
    yield* database.run("project.pemd.delete", (db) => db.delete(pemd).where(eq(pemd.id, tagId)));
    return { success: true, deletedId: tagId } as const;
  });
}

function authenticatedUser(
  user: WorkflowUser | null | undefined,
): Effect.Effect<WorkflowUser, UnauthenticatedError> {
  return user
    ? Effect.succeed(user)
    : Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));
}
