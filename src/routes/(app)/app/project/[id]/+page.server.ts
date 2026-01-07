import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { projet, etablissement, user, societe } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
    const { id } = params;
    const currentUser = locals.user;

    if (!currentUser) {
        throw error(401, 'Non autorisé');
    }

    const result = await db.select({
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
        idEtabId: projet.idEtabId,
        etablissementNom: etablissement.nom,
        societeNom: societe.nom,
    })
    .from(projet)
    .leftJoin(etablissement, eq(projet.idEtabId, etablissement.id))
    .leftJoin(societe, eq(etablissement.idSocieteId, societe.id))
    .where(eq(projet.id, id));
    
    const project = result[0];

    if (!project) {
        throw error(404, 'Projet non trouvé');
    }

    // Vérifier que l'utilisateur a accès à ce projet (admin ou même société)
    if (currentUser.role !== 'admin') {
        const userWithSociete = await db.select().from(user).where(eq(user.id, currentUser.id));
        const societeId = userWithSociete[0]?.societeId;

        if (societeId) {
            // Récupérer les établissements de la société
            const etablissements = await db.select({ id: etablissement.id })
                .from(etablissement)
                .where(eq(etablissement.idSocieteId, societeId));

            const etablissementIds = etablissements.map(e => e.id);

            if (!etablissementIds.includes(project.idEtabId)) {
                throw error(403, 'Accès non autorisé à ce projet');
            }
        }
    }

    return {
        projet: project
    };
};
