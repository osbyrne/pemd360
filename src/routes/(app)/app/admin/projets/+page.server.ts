import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, societe } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
    const { isAdmin } = await parent();

    if (!isAdmin) {
        throw redirect(303, '/app/unauthorized');
    }

    // Récupérer tous les projets avec leurs établissements et sociétés
    const projets = await db
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
            etablissementId: projet.idEtabId,
            etablissementNom: etablissement.nom,
            societeNom: societe.nom,
        })
        .from(projet)
        .leftJoin(etablissement, eq(projet.idEtabId, etablissement.id))
        .leftJoin(societe, eq(etablissement.idSocieteId, societe.id));

    return {
        projets
    };
};

export const actions: Actions = {
    delete: async ({ request, locals }) => {
        const formData = await request.formData();
        const projetId = formData.get('projetId') as string;

        if (!projetId) {
            return fail(400, { error: 'ID du projet requis' });
        }

        try {
            await db.delete(projet).where(eq(projet.id, projetId));
            return { success: true };
        } catch (e) {
            console.error('Erreur suppression projet:', e);
            return fail(500, { error: 'Erreur lors de la suppression' });
        }
    }
};
