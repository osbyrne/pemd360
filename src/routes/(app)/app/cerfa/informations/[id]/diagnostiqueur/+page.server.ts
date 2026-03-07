import { db } from '$lib/server/db/client';
import { cerfaDiagnostiqueur } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const diagnostiqueur = await db
		.select()
		.from(cerfaDiagnostiqueur)
		.where(eq(cerfaDiagnostiqueur.projetId, id))
		.get();
	return { diagnostiqueur };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = params;
		const formData = await request.formData();
		const typePersonne = formData.get('typePersonne')?.toString();

		const dateDebutStr = formData.get('dateDebutAssurance')?.toString();
		const dateFinStr = formData.get('dateFinAssurance')?.toString();

		const values = {
			projetId: id,
			adresse: formData.get('adresse')?.toString() || null,
			cp: formData.get('cp')?.toString() || null,
			commune: formData.get('commune')?.toString() || null,
			nomPerPhy: typePersonne === 'physique' ? formData.get('nom')?.toString() || null : null,
			prenomPerPhy:
				typePersonne === 'physique' ? formData.get('prenom')?.toString() || null : null,
			nomPerMorale:
				typePersonne === 'morale' ? formData.get('raisonSociale')?.toString() || null : null,
			siretSiren:
				typePersonne === 'morale' ? formData.get('siretSiren')?.toString() || null : null,
			engagementAssurance: formData.get('engagementAssurance') === 'on' ? 1 : 0,
			nomAssurance: formData.get('nomAssurance')?.toString() || null,
			numeroPolice: formData.get('numeroPolice')?.toString() || null,
			dateDebutAssurance: dateDebutStr ? new Date(dateDebutStr).getTime() : null,
			dateFinAssurance: dateFinStr ? new Date(dateFinStr).getTime() : null,
			competences: formData.get('competences') === 'on' ? 1 : 0
		};

		const existing = await db
			.select({ id: cerfaDiagnostiqueur.id })
			.from(cerfaDiagnostiqueur)
			.where(eq(cerfaDiagnostiqueur.projetId, id))
			.get();

		if (existing) {
			await db
				.update(cerfaDiagnostiqueur)
				.set(values)
				.where(eq(cerfaDiagnostiqueur.projetId, id));
		} else {
			await db.insert(cerfaDiagnostiqueur).values(values);
		}

		redirect(303, `/app/cerfa/informations?projetId=${id}`);
	}
};
