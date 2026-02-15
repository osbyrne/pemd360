import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { projet, etablissement, user, societe, userProjet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const currentUser = locals.user;

	if (!currentUser) {
		throw error(401, 'Non autorisé');
	}

	const result = await db
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
			societeNom: societe.nom
		})
		.from(projet)
		.leftJoin(etablissement, eq(projet.etablissementId, etablissement.id))
		.leftJoin(societe, eq(etablissement.societeId, societe.id))
		.where(eq(projet.id, id));

	const project = result[0];

	if (!project) {
		throw error(404, 'Projet non trouvé');
	}

	// Vérifier que l'utilisateur a accès à ce projet (admin ou lié via userProjet)
	if (currentUser.role !== 'admin') {
		const userProjetAccess = await db
			.select()
			.from(userProjet)
			.where(eq(userProjet.userId, currentUser.id))
			.where(eq(userProjet.projetId, id));

		if (userProjetAccess.length === 0) {
			throw error(403, 'Accès non autorisé à ce projet');
		}
	}

	return {
		projet: project
	};
};
