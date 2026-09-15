import { Effect } from "effect";
import { eq, and } from "drizzle-orm";
import {
  DatabaseError,
  ForbiddenError,
  NotFoundError,
  ReportGenerationError,
  UnauthenticatedError,
  ValidationError,
} from "$lib/effect/errors";
import { requiredString } from "$lib/effect/schemas/forms";
import type { CerfaPdfData } from "$lib/server/cerfa";
import {
  categorieV2,
  cerfaDiagnostic,
  cerfaDiagnostiqueur,
  cerfaMtrOuvrage,
  cerfaOperation,
  groupe,
  pemd,
  projet,
  userProjet,
} from "$lib/server/db/schema";
import { Database } from "$lib/server/services/database";
import { Report } from "$lib/server/services/report";
import type { WorkflowUser } from "$lib/server/workflows/project";

type CerfaReportError =
  | DatabaseError
  | ReportGenerationError
  | UnauthenticatedError
  | ForbiddenError
  | NotFoundError
  | ValidationError;

export function generateCerfaPdfReport(input: {
  readonly projectId: string;
  readonly templateBuffer: ArrayBuffer | Uint8Array;
  readonly user: WorkflowUser | null | undefined;
}): Effect.Effect<Uint8Array, CerfaReportError, Database | Report> {
  return Effect.gen(function* () {
    const projectId = yield* requiredString(input.projectId, "Projet manquant");
    const user = input.user;
    if (!user) return yield* Effect.fail(new UnauthenticatedError({ message: "Non autorisé" }));

    const database = yield* Database;
    const projectRows = yield* database.run("report.cerfa.project", (db) =>
      db.select({ id: projet.id }).from(projet).where(eq(projet.id, projectId)).limit(1),
    );
    if (projectRows.length === 0) {
      return yield* Effect.fail(new NotFoundError({ message: "Projet non trouvé" }));
    }

    if (user.role !== "admin") {
      const accessRows = yield* database.run("report.cerfa.access", (db) =>
        db
          .select({ projetId: userProjet.projetId })
          .from(userProjet)
          .where(and(eq(userProjet.userId, user.id), eq(userProjet.projetId, projectId)))
          .limit(1),
      );
      if (accessRows.length === 0) {
        return yield* Effect.fail(
          new ForbiddenError({ message: "Accès non autorisé à ce projet" }),
        );
      }
    }

    const [diagnosticRows, diagnostiqueurRows, ouvrageRows, operationRows, pemdList] =
      yield* Effect.all(
        [
          database.run("report.cerfa.diagnostic", (db) =>
            db
              .select()
              .from(cerfaDiagnostic)
              .where(eq(cerfaDiagnostic.projetId, projectId))
              .limit(1),
          ),
          database.run("report.cerfa.diagnostiqueur", (db) =>
            db
              .select()
              .from(cerfaDiagnostiqueur)
              .where(eq(cerfaDiagnostiqueur.projetId, projectId))
              .limit(1),
          ),
          database.run("report.cerfa.ouvrage", (db) =>
            db
              .select()
              .from(cerfaMtrOuvrage)
              .where(eq(cerfaMtrOuvrage.projetId, projectId))
              .limit(1),
          ),
          database.run("report.cerfa.operation", (db) =>
            db.select().from(cerfaOperation).where(eq(cerfaOperation.projetId, projectId)).limit(1),
          ),
          database.run("report.cerfa.pemd", (db) =>
            db
              .select({
                id: pemd.id,
                description: pemd.description,
                quantite: pemd.quantite,
                masse: pemd.masse,
                volume: pemd.volume,
                surface: pemd.surface,
                etat: pemd.etat,
                amiante: pemd.amiante,
                plombifere: pemd.plombifere,
                termite: pemd.termite,
                reemploi: pemd.reemploi,
                potentielReemploi: pemd.potentielReemploi,
                categorie: categorieV2.categoriev2,
                famille: groupe.groupe,
              })
              .from(pemd)
              .leftJoin(categorieV2, eq(pemd.natureId, categorieV2.id))
              .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
              .where(eq(pemd.sidId, projectId)),
          ),
        ],
        { concurrency: 5 },
      );

    const reportData: CerfaPdfData = {
      diagnostic: diagnosticRows[0] ?? null,
      diagnostiqueur: diagnostiqueurRows[0] ?? null,
      ouvrage: ouvrageRows[0] ?? null,
      operation: operationRows[0] ?? null,
      pemdList,
    };
    const report = yield* Report;
    return yield* report.renderCerfaPdf(reportData, input.templateBuffer);
  });
}
