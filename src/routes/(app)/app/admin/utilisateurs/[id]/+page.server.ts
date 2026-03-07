import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { projet, userProjet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	const projets = await db
		.select({ id: projet.id, libelle: projet.libelle, reference: projet.reference })
		.from(projet);

	const userProjets = await db
		.select({ projetId: userProjet.projetId })
		.from(userProjet)
		.where(eq(userProjet.userId, id));

	return {
		userId: id,
		projets,
		userProjetIds: userProjets.map((up) => up.projetId)
	};
};

export const actions: Actions = {
	setProjets: async ({ request, params }) => {
		const { id } = params;
		const formData = await request.formData();
		const projetIds = formData.getAll('projetIds') as string[];

		try {
			await db.delete(userProjet).where(eq(userProjet.userId, id));

			if (projetIds.length > 0) {
				await db
					.insert(userProjet)
					.values(projetIds.map((projetId) => ({ userId: id, projetId })));
			}

			return { success: true };
		} catch (e) {
			console.error('Erreur mise à jour projets:', e);
			return fail(500, { error: 'Erreur lors de la mise à jour' });
		}
	}
};
