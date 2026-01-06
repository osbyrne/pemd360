import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, user, societe } from '$lib/server/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;
	
	if (!currentUser) {
		return { projets: [] };
	}

	// Récupérer l'utilisateur avec sa société
	const userWithSociete = await db.select().from(user).where(eq(user.id, currentUser.id));
	const societeId = userWithSociete[0]?.societeId;

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

	// Si l'utilisateur n'a pas de société assignée, ne montrer aucun projet
	if (!societeId) {
		return { projets: [] };
	}

	// Récupérer les établissements de la société de l'utilisateur
	const etablissements = await db.select({ id: etablissement.id })
		.from(etablissement)
		.where(eq(etablissement.idSocieteId, societeId));

	const etablissementIds = etablissements.map(e => e.id);

	if (etablissementIds.length === 0) {
		return { projets: [] };
	}

	// Récupérer les projets des établissements de la société avec les infos
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
	.where(inArray(projet.idEtabId, etablissementIds))
	.orderBy(desc(projet.dateDemarrage));

	return {
		projets: projetsWithEtab
	};
};