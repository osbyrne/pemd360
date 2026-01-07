import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, societe, userProjet } from '$lib/server/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;
	
	if (!currentUser) {
		return { projets: [] };
	}

	// Si l'utilisateur est admin, afficher tous les projets avec leurs établissements et sociétés
	if (currentUser.role === 'admin') {
		const projetsWithEtab = await db.select({
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
		.orderBy(desc(projet.dateDemarrage));
		
		return { projets: projetsWithEtab };
	}

	// Récupérer les IDs des projets associés à l'utilisateur
	const userProjets = await db.select({ projetId: userProjet.projetId })
		.from(userProjet)
		.where(eq(userProjet.userId, currentUser.id));

	const projetIds = userProjets.map(up => up.projetId);

	// Si l'utilisateur n'a pas de projets associés, ne montrer aucun projet
	if (projetIds.length === 0) {
		return { projets: [] };
	}

	// Récupérer les projets associés à l'utilisateur avec les infos établissement/société
	const projetsWithEtab = await db.select({
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
	.where(inArray(projet.id, projetIds))
	.orderBy(desc(projet.dateDemarrage));

	return {
		projets: projetsWithEtab
	};
};