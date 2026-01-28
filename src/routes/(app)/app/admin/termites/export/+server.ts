import { db } from '$lib/server/db/client';
import { tagsTermite, projet } from '$lib/server/db/schema';
import { getAllowedProjectIds } from '$lib/server/db/queries';
import { eq, and, inArray } from 'drizzle-orm';
import { generateRiskExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const projectId = url.searchParams.get('projectId');
	const allowedProjectIds = await getAllowedProjectIds(user);

	if (allowedProjectIds.length === 0) {
		return new Response('No access to any project', { status: 403 });
	}

	const conditions = [];

	if (projectId) {
		if (!allowedProjectIds.includes(projectId)) {
			return new Response('Unauthorized for this project', { status: 403 });
		}
		conditions.push(eq(tagsTermite.sidId, projectId));
	} else {
		conditions.push(inArray(tagsTermite.sidId, allowedProjectIds));
	}

	let query = db
		.select({
			id: tagsTermite.id,
			label: tagsTermite.label,
			description: tagsTermite.description,
			etage: tagsTermite.etage,
			projetId: tagsTermite.sidId,
			projetNom: projet.libelle
		})
		.from(tagsTermite)
		.leftJoin(projet, eq(tagsTermite.sidId, projet.id));

	if (conditions.length > 0) {
		// @ts-ignore
		query.where(and(...conditions));
	}

	const list = await query.all();

	const buffer = await generateRiskExcel(list, 'Termites');

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="inventaire_termites_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
