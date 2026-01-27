import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { etablissement, projet, userLegacy } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, parent }) => {
	const { isAdmin } = await parent();

	// Rediriger si l'utilisateur n'est pas admin
	if (!isAdmin) {
		throw redirect(303, '/app/unauthorized');
	}

	const etablissements = await db.select().from(etablissement);

	return {
		etablissements
	};
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const user = locals.user;
		if (!user || user.role !== 'admin') {
			return fail(403, { message: 'Non autorisé' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id') as string);

		if (isNaN(id)) {
			return fail(400, { message: 'ID invalide' });
		}

		try {
			// D'abord, dissocier les projets liés à cet établissement
			await db
				.update(projet)
				.set({ idEtablissementId: null })
				.where(eq(projet.idEtablissementId, id));

			// Mettre à jour idEtabId des projets (si nécessaire, on peut aussi les supprimer)
			// Note: idEtabId est NOT NULL, donc on doit supprimer les projets ou les réassigner
			// Vérifions d'abord s'il y a des projets avec idEtabId = id
			const projetsLies = await db.select().from(projet).where(eq(projet.idEtabId, id));

			if (projetsLies.length > 0) {
				return fail(400, {
					message: `Impossible de supprimer : ${projetsLies.length} projet(s) sont encore liés à cet établissement. Veuillez d'abord les réassigner ou les supprimer.`
				});
			}

			// Vérifier les utilisateurs legacy liés
			const usersLies = await db.select().from(userLegacy).where(eq(userLegacy.idEtabId, id));

			if (usersLies.length > 0) {
				return fail(400, {
					message: `Impossible de supprimer : ${usersLies.length} utilisateur(s) legacy sont encore liés à cet établissement.`
				});
			}

			// Supprimer l'établissement
			await db.delete(etablissement).where(eq(etablissement.id, id));

			return { success: true, message: 'Établissement supprimé avec succès' };
		} catch (e) {
			console.error('Erreur suppression établissement:', e);
			return fail(500, {
				message:
					'Erreur lors de la suppression: ' + (e instanceof Error ? e.message : 'Erreur inconnue')
			});
		}
	}
};
