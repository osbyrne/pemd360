import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import {
	etablissement as etablissementTable,
	societe as societeTable
} from '$lib/server/db/schema';
import { requireAdmin } from '$lib/server/admin';

export const load: PageServerLoad = async ({ parent }) => {
	await requireAdmin(parent);

	const societes = await db.select().from(societeTable);

	return {
		societes
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();

		const data = {
			nom: (formData.get('nom') as string) || '',
			societeId: parseInt(formData.get('societeId') as string) || 0,
			raisonSocial: (formData.get('raisonSocial') as string) || '',
			rue: (formData.get('rue') as string) || '',
			cp: (formData.get('cp') as string) || '',
			ville: (formData.get('ville') as string) || '',
			tel: (formData.get('tel') as string) || '',
			fax: (formData.get('fax') as string) || '',
			email: (formData.get('email') as string) || '',
			siret: (formData.get('siret') as string) || ''
		};

		// Validation de tous les champs obligatoires
		if (
			!data.nom ||
			!data.societeId ||
			!data.siret ||
			!data.raisonSocial ||
			!data.rue ||
			!data.cp ||
			!data.ville ||
			!data.tel ||
			!data.email
		) {
			return fail(400, {
				data,
				message: 'Veuillez remplir tous les champs obligatoires',
				success: false
			});
		}

		// S'assurer que fax n'est pas null (mettre une chaîne vide si non rempli)
		const insertData = {
			...data,
			fax: data.fax || ''
		};

		try {
			const result = await db
				.insert(etablissementTable)
				.values(insertData)
				.returning({ insertedId: etablissementTable.id });

			if (result.length > 0) {
				throw redirect(303, `/app/admin/etablissements/${result[0].insertedId}`);
			}
		} catch (e) {
			if (e instanceof Response) throw e;
			// Vérifier si c'est une redirection SvelteKit
			if (e && typeof e === 'object' && 'status' in e && (e as any).status === 303) {
				throw e;
			}
			console.error('Erreur création établissement:', e);
			return fail(500, {
				data,
				message:
					'Erreur lors de la création: ' + (e instanceof Error ? e.message : 'Erreur inconnue'),
				success: false
			});
		}

		throw redirect(303, '/app/admin/etablissements');
	}
};
