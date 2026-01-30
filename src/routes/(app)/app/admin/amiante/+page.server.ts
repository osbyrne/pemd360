import { db } from '$lib/server/db/client';
import { tagsAmiante, projet } from '$lib/server/db/schema';
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
			id: tagsAmiante.id,
			label: tagsAmiante.label,
			description: tagsAmiante.description,
			etage: tagsAmiante.etage,
			type: tagsAmiante.type,
			customImage: tagsAmiante.customImage,
			presenceAmiante: tagsAmiante.presenceAmiante,
			projetId: tagsAmiante.sidId,
			projetNom: projet.libelle
		})
		.from(tagsAmiante)
		.leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

	const conditions = [];

	if (user.role !== 'admin') {
		const allowedids = projects.map((p) => p.id);
		if (allowedids.length > 0) {
			conditions.push(inArray(tagsAmiante.sidId, allowedids));
		} else {
			// User has no projects, so they see nothing
			return {
				list: [],
				projects: [],
				selectedProjectId: projectId
			};
		}
	}

	if (projectId) {
		conditions.push(eq(tagsAmiante.sidId, projectId));
	}

	if (conditions.length > 0) {
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
	delete: createDeleteAction(tagsAmiante, tagsAmiante.id, 'tag amiante', 'string', {
		resource: 'tags',
		action: 'delete'
	})
};
