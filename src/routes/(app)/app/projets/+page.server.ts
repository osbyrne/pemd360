import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, user } from '$lib/server/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = locals.user;
	
	if (!currentUser) {
		return { projets: [] };
	}

	// Récupérer l'utilisateur avec sa société
	const userWithSociete = await db.select().from(user).where(eq(user.id, currentUser.id));
	const societeId = userWithSociete[0]?.societeId;

	// Si l'utilisateur est admin, afficher tous les projets
	if (currentUser.role === 'admin') {
		const projets = await db.select().from(projet).orderBy(desc(projet.dateDemarrage));
		return { projets };
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

	// Récupérer les projets des établissements de la société
	const projets = await db.select()
		.from(projet)
		.where(inArray(projet.idEtabId, etablissementIds))
		.orderBy(desc(projet.dateDemarrage));

	return {
		projets
	};
};