import { db } from '$lib/server/db/client';
import { tagsTermite, projet } from '$lib/server/db/schema';
import { validateExportAuth, buildProjectConditions } from '$lib/server/db/queries';
import { eq, and } from 'drizzle-orm';
import { generateRiskExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const authResult = await validateExportAuth(locals.user, url.searchParams.get('projectId'));

	if (!authResult.authorized) {
		return authResult.error;
	}

	const conditions = buildProjectConditions(
		tagsTermite.sidId,
		authResult.allowedProjectIds,
		authResult.projectId
	);

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
