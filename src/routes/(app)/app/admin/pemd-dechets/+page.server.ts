import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { pemd, projet, objets, categorieV2, groupe, natureV2 } from '$lib/server/db/schema';
import { getUserProjects } from '$lib/server/db/queries';
import { createDeleteAction } from '$lib/server/db/actions';
import { eq, and, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/login');
	}

	const projectId = url.searchParams.get('projectId');
	const projects = await getUserProjects(user);

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
	delete: createDeleteAction(pemd, pemd.id, 'pemd déchet', 'string', {
		resource: 'tags',
		action: 'delete'
	})
};
