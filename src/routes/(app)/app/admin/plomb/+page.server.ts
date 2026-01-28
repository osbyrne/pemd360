import { db } from '$lib/server/db/client';
import { tagsPlomb, projet } from '$lib/server/db/schema';
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
			id: tagsPlomb.id,
			label: tagsPlomb.label,
			description: tagsPlomb.description,
			etage: tagsPlomb.etage,
			customImage: tagsPlomb.customImage,
			presencePlomb: tagsPlomb.presencePlomb,
			concentration: tagsPlomb.concentration,
			projetId: tagsPlomb.sidId,
			projetNom: projet.libelle
		})
		.from(tagsPlomb)
		.leftJoin(projet, eq(tagsPlomb.sidId, projet.id));

	const conditions = [];

	if (user.role !== 'admin') {
		const allowedids = projects.map((p) => p.id);
		if (allowedids.length > 0) {
			conditions.push(inArray(tagsPlomb.sidId, allowedids));
		} else {
			return {
				list: [],
				projects: [],
				selectedProjectId: projectId
			};
		}
	}

	if (projectId) {
		conditions.push(eq(tagsPlomb.sidId, projectId));
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
	delete: createDeleteAction(tagsPlomb, tagsPlomb.id, 'tag plomb', 'string', {
		resource: 'tags',
		action: 'delete'
	})
};
