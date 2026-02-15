import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { projet, etablissement, societe } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { requireAdmin } from '$lib/server/admin';

// Génère un ID unique de type nanoid
function generateId(size = 21): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const bytes = crypto.randomBytes(size);
	let id = '';
	for (let i = 0; i < size; i++) {
		id += chars[bytes[i] % chars.length];
	}
	return id;
}

export const load: PageServerLoad = async ({ parent }) => {
	await requireAdmin(parent);

	// Récupérer les établissements avec leurs sociétés
	const etablissements = await db
		.select({
			id: etablissement.id,
			nom: etablissement.nom,
			societeId: etablissement.idSocieteId,
			societeNom: societe.nom
		})
		.from(etablissement)
		.leftJoin(societe, eq(etablissement.idSocieteId, societe.id));

	return {
		etablissements
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const idMatterport = (formData.get('id') as string) || '';

		const data = {
			id: idMatterport,
			libelle: (formData.get('libelle') as string) || '',
			reference: (formData.get('reference') as string) || '',
			idEtabId: parseInt(formData.get('idEtabId') as string) || 0,
			codeInsee: (formData.get('codeInsee') as string) || '',
			rue: (formData.get('rue') as string) || '',
			cp: parseInt(formData.get('cp') as string) || 0,
			ville: (formData.get('ville') as string) || '',
			dateDemarrage: formData.get('dateDemarrage')
				? new Date(formData.get('dateDemarrage') as string)
				: new Date(),
			section: (formData.get('section') as string) || '',
			parcelle: (formData.get('parcelle') as string) || '',
			typeOperation: (formData.get('typeOperation') as string) || null,
			maitreDOuvrage: (formData.get('maitreDOuvrage') as string) || null,
			dateDeFin: formData.get('dateDeFin') ? new Date(formData.get('dateDeFin') as string) : null
		};

		// Validation des champs obligatoires
		if (!data.id) {
			return fail(400, { data, message: "L'ID Matterport est obligatoire", success: false });
		}
		if (
			!data.libelle ||
			!data.reference ||
			!data.idEtabId ||
			!data.rue ||
			!data.ville ||
			!data.section ||
			!data.parcelle
		) {
			return fail(400, {
				data,
				message: 'Veuillez remplir tous les champs obligatoires',
				success: false
			});
		}

		try {
			const result = await db.insert(projet).values(data).returning({ insertedId: projet.id });

			if (result.length > 0) {
				throw redirect(303, `/app/admin/projets/${result[0].insertedId}`);
			}
		} catch (e) {
			if (e && typeof e === 'object' && 'status' in e && (e as any).status === 303) {
				throw e;
			}
			console.error('Erreur création projet:', e);
			return fail(500, {
				data,
				message:
					'Erreur lors de la création: ' + (e instanceof Error ? e.message : 'Erreur inconnue'),
				success: false
			});
		}

		throw redirect(303, '/app/admin/projets');
	}
};
