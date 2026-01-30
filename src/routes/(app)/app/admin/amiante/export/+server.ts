import { db } from '$lib/server/db/client';
import { tagsAmiante, projet } from '$lib/server/db/schema';
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
		tagsAmiante.sidId,
		authResult.allowedProjectIds,
		authResult.projectId
	);

	let query = db
		.select({
			id: tagsAmiante.id,
			label: tagsAmiante.label,
			description: tagsAmiante.description,
			etage: tagsAmiante.etage,
			type: tagsAmiante.type,
			projetId: tagsAmiante.sidId,
			projetNom: projet.libelle
		})
		.from(tagsAmiante)
		.leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

	if (conditions.length > 0) {
		query.where(and(...conditions));
	}

	const list = await query.all();

	const buffer = await generateRiskExcel(list, 'Amiante');

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="inventaire_amiante_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
