import { db } from '$lib/server/db/client';
import { cerfaMtrOuvrage, cerfaDiagnostiqueur, cerfaOperation, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Récupération des informations CERFA par projet
    const list = await db.select({
        projetId: projet.id,
        projetNom: projet.libelle,
        moaNom: cerfaMtrOuvrage.nomPerMorale, // ou perPhy
        diagnostiqueurNom: cerfaDiagnostiqueur.nomPerMorale,
        operationAdresse: cerfaOperation.adresse,
        datePermis: cerfaOperation.datePermisDeConstruire
    })
    .from(projet)
    .leftJoin(cerfaMtrOuvrage, eq(projet.id, cerfaMtrOuvrage.projetId))
    .leftJoin(cerfaDiagnostiqueur, eq(projet.id, cerfaDiagnostiqueur.projetId))
    .leftJoin(cerfaOperation, eq(projet.id, cerfaOperation.projetId))
    .all();

    return {
        list
    };
};
