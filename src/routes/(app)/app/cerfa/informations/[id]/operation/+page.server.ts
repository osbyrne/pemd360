import { db } from '$lib/server/db/client';
import { cerfaOperation } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const operation = await db
		.select()
		.from(cerfaOperation)
		.where(eq(cerfaOperation.projetId, id))
		.get();
	return { operation };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = params;
		const formData = await request.formData();

		const dateDebutStr = formData.get('dateDebut')?.toString();
		const dateFinStr = formData.get('dateFin')?.toString();
		const datePermisStr = formData.get('datePermis')?.toString();
		const typologies = formData.getAll('typologies').map(String);
		const operationsSoumis = formData.getAll('operationsSoumis').map(String);

		const values = {
			projetId: id,
			adresse: formData.get('adresse')?.toString() || null,
			cp: formData.get('cp')?.toString() || null,
			commune: formData.get('commune')?.toString() || null,
			dateDeDebut: dateDebutStr ? new Date(dateDebutStr).getTime() : null,
			dateDeFin: dateFinStr ? new Date(dateFinStr).getTime() : null,
			operation: formData.get('operation')?.toString() || null,
			nbBatDemolition: Number(formData.get('nbBatDemolition') || 0),
			surfaceADemolir: Number(formData.get('surfaceDemolir') || 0),
			nbBatRenovation: Number(formData.get('nbBatRenovation') || 0),
			surfaceARenover: Number(formData.get('surfaceRenover') || 0),
			typologieBat: JSON.stringify(typologies),
			datePermisDeConstruire: datePermisStr ? new Date(datePermisStr).getTime() : null,
			operationSoumis: JSON.stringify(operationsSoumis)
		};

		const existing = await db
			.select({ id: cerfaOperation.id })
			.from(cerfaOperation)
			.where(eq(cerfaOperation.projetId, id))
			.get();

		if (existing) {
			await db.update(cerfaOperation).set(values).where(eq(cerfaOperation.projetId, id));
		} else {
			await db.insert(cerfaOperation).values(values);
		}

		redirect(303, `/app/cerfa/informations?projetId=${id}`);
	}
};
