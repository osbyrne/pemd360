import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, societe } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { isAdmin } = await parent();

    if (!isAdmin) {
        throw redirect(303, '/app/unauthorized');
    }

    const { id } = params;

    const result = await db
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
            etablissementId: projet.idEtabId,
            etablissementNom: etablissement.nom,
            etablissementVille: etablissement.ville,
            societeId: societe.id,
            societeNom: societe.nom,
        })
        .from(projet)
        .leftJoin(etablissement, eq(projet.idEtabId, etablissement.id))
        .leftJoin(societe, eq(etablissement.idSocieteId, societe.id))
        .where(eq(projet.id, id));

    if (result.length === 0) {
        throw error(404, 'Projet non trouvé');
    }

    return {
        projet: result[0]
    };
};
