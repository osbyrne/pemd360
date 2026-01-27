import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import {
	pemd,
	projet,
	userProjet,
	objets,
	categorieV2,
	groupe,
	natureV2
} from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/login');
	}

	const projectId = url.searchParams.get('projectId');
	let projects;

	if (user.role === 'admin') {
		projects = await db
			.select({
				id: projet.id,
				libelle: projet.libelle
			})
			.from(projet);
	} else {
		projects = await db
			.select({
				id: projet.id,
				libelle: projet.libelle
			})
			.from(projet)
			.innerJoin(userProjet, eq(projet.id, userProjet.projetId))
			.where(eq(userProjet.userId, user.id));
	}

	let query = db
		.select({
			id: pemd.id,
			nature: natureV2.nature,
			codeDechet: natureV2.codeDechet,
			masse: pemd.masse,
			reutilisation: natureV2.reutilisation,
			recyclable: natureV2.recyclable,
			valorisationMatiere: natureV2.valorisationMatiere,
			valorisationEnergetique: natureV2.valorisationEnergetique,
			nonValorisation: natureV2.nonValorisation,
			incinerationSansValorisationEnergetique: natureV2.incinerationSansValorisationEnergetique,
			ecoOrganismeRep: natureV2.ecoOrganismeRep,
			stockage: natureV2.stockage,
			projetId: pemd.sidId,
			projetNom: projet.libelle
		})
		.from(pemd)
		.leftJoin(objets, eq(pemd.objetId, objets.id))
		.leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
		.leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
		.leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
		.leftJoin(projet, eq(pemd.sidId, projet.id));

	const conditions = [];

	if (user.role !== 'admin') {
		const allowedids = projects.map((p) => p.id);
		if (allowedids.length > 0) {
			conditions.push(inArray(pemd.sidId, allowedids));
		} else {
			return {
				list: [],
				projects: [],
				selectedProjectId: projectId
			};
		}
	}

	if (projectId) {
		conditions.push(eq(pemd.sidId, projectId));
	}

	if (conditions.length > 0) {
		// @ts-ignore
		query.where(and(...conditions));
	}

	const list = await query.all();

	return {
		list,
		projects,
		selectedProjectId: projectId
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'ID requis' });
		}

		try {
			await db.delete(pemd).where(eq(pemd.id, id));
			return { success: true };
		} catch (e: any) {
			console.error('Error deleting pemd déchet:', e);
			return fail(500, { message: 'Erreur lors de la suppression' });
		}
	}
};
