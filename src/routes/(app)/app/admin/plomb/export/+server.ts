import { db } from '$lib/server/db/client';
import { tagsPlomb, projet } from '$lib/server/db/schema';
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
		tagsPlomb.sidId,
		authResult.allowedProjectIds,
		authResult.projectId
	);

	let query = db
		.select({
			id: tagsPlomb.id,
			label: tagsPlomb.label,
			description: tagsPlomb.description,
			etage: tagsPlomb.etage,
			projetId: tagsPlomb.sidId,
			projetNom: projet.libelle
		})
		.from(tagsPlomb)
		.leftJoin(projet, eq(tagsPlomb.sidId, projet.id));

	if (conditions.length > 0) {
		query.where(and(...conditions));
	}

	const list = await query.all();

	const buffer = await generateRiskExcel(list, 'Plomb');

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="inventaire_plomb_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
