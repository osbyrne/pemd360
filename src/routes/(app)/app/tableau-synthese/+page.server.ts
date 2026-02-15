import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { pemd, projet, objets } from '$lib/server/db/schema';
import { getUserProjects } from '$lib/server/db/queries';
import { eq, and, inArray } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(302, '/login');
	}

	const projectId = url.searchParams.get('projectId');
	const projects = await getUserProjects(user);

	const baseQuery = db
		.select({
			id: pemd.id,
			objet: objets.objet,
			description: pemd.description,
			etat: pemd.etat,
			etage: pemd.etage,
			potentielReemploi: pemd.potentielReemploi,
			reemploi: pemd.reemploi,
			image: pemd.image,
			projetId: pemd.sidId,
			projetNom: projet.libelle
		})
		.from(pemd)
		.leftJoin(objets, eq(pemd.objetId, objets.id))
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

	const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

	const list = await query;

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
			console.error('Error deleting pemd:', e);
			return fail(500, { message: 'Erreur lors de la suppression' });
		}
	}
};
