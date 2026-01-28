import { db } from '$lib/server/db/client';
import { tagsTermite, projet } from '$lib/server/db/schema';
import { getUserProjects } from '$lib/server/db/queries';
import { createDeleteAction } from '$lib/server/db/actions';
import { eq, and, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/login');
	}

	const projectId = url.searchParams.get('projectId');
	const projects = await getUserProjects(user);

	let query = db
		.select({
			id: tagsTermite.id,
			label: tagsTermite.label,
			description: tagsTermite.description,
			etage: tagsTermite.etage,
			customImage: tagsTermite.customImage,
			presenceTermite: tagsTermite.presenceTermite,
			projetId: tagsTermite.sidId,
			projetNom: projet.libelle
		})
		.from(tagsTermite)
		.leftJoin(projet, eq(tagsTermite.sidId, projet.id));

	const conditions = [];

	if (user.role !== 'admin') {
		const allowedids = projects.map((p) => p.id);
		if (allowedids.length > 0) {
			conditions.push(inArray(tagsTermite.sidId, allowedids));
		} else {
			return {
				list: [],
				projects: [],
				selectedProjectId: projectId
			};
		}
	}

	if (projectId) {
		conditions.push(eq(tagsTermite.sidId, projectId));
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
	delete: createDeleteAction(tagsTermite, tagsTermite.id, 'tag termite', 'string')
};
