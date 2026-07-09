import { db } from "$lib/server/db/client";
import {
  cerfaMtrOuvrage,
  cerfaDiagnostiqueur,
  cerfaOperation,
  cerfaDiagnostic,
  projet,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Récupération des informations CERFA par projet
  const list = await db
    .select({
      projetId: projet.id,
      projetNom: projet.libelle,
      // Maître d'Ouvrage
      moaNom: cerfaMtrOuvrage.nomPerMorale,
      moaNomPhy: cerfaMtrOuvrage.nomPerPhy,
      moaPrenomPhy: cerfaMtrOuvrage.prenomPerPhy,
      moaSiretSiren: cerfaMtrOuvrage.siretSiren,
      moaAdresse: cerfaMtrOuvrage.adresse,
      moaCp: cerfaMtrOuvrage.cp,
      moaCommune: cerfaMtrOuvrage.commune,
      // Diagnostiqueur
      diagnostiqueurNom: cerfaDiagnostiqueur.nomPerMorale,
      diagnostiqueurNomPhy: cerfaDiagnostiqueur.nomPerPhy,
      diagnostiqueurPrenomPhy: cerfaDiagnostiqueur.prenomPerPhy,
      diagnostiqueurSiretSiren: cerfaDiagnostiqueur.siretSiren,
      diagnostiqueurAdresse: cerfaDiagnostiqueur.adresse,
      diagnostiqueurCp: cerfaDiagnostiqueur.cp,
      diagnostiqueurCommune: cerfaDiagnostiqueur.commune,
      // Opération
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
      // Diagnostic
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
    .all();

  return {
    list,
  };
};
