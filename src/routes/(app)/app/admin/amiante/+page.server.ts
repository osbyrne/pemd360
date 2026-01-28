import { db } from '$lib/server/db/client';
import { tagsAmiante, projet } from '$lib/server/db/schema';
import { getUserProjects } from '$lib/server/db/queries';
import { eq, and, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth';

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
	delete: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Non autorisé' });
		}

		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: user.id,
				permissions: { tags: ['delete'] }
			}
		});

		if (!hasPermission.success) {
			return fail(403, { message: 'Permission refusée' });
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { message: 'ID requis' });
		}

		try {
			await db.delete(tagsAmiante).where(eq(tagsAmiante.id, id));
			return { success: true };
		} catch (e: any) {
			console.error('Error deleting tag amiante:', e);
			return fail(500, { message: 'Erreur lors de la suppression' });
		}
	}
};
