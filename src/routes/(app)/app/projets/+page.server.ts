import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, societe } from '$lib/server/db/schema';
import { getAllowedProjectIds } from '$lib/server/db/queries';
import { desc, eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;

	if (!currentUser) {
		return { projets: [] };
	}

	// Admins get all projects, non-admins get only their allowed projects
	const isAdmin = currentUser.role === 'admin';

	// Only fetch allowed project IDs for non-admins (optimization)
	let projetIds: string[] = [];
	if (!isAdmin) {
		projetIds = await getAllowedProjectIds(currentUser);
		if (projetIds.length === 0) {
			return { projets: [] };
		}
	}

	let query = db
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
		.orderBy(desc(projet.dateDemarrage));

	// For non-admins, filter to only their allowed projects
	if (!isAdmin) {
		query = query.where(inArray(projet.id, projetIds));
	}

	const projetsWithEtab = await query;

	return { projets: projetsWithEtab };
};
