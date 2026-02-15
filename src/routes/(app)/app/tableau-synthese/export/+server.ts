import { db } from '$lib/server/db/client';
import { pemd, projet, objets } from '$lib/server/db/schema';
import { validateExportAuth, buildProjectConditions } from '$lib/server/db/queries';
import { generateTableauSyntheseExcel } from '$lib/server/excel';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const authResult = await validateExportAuth(locals.user, url.searchParams.get('projectId'));

	if (!authResult.authorized) {
		return authResult.error;
	}

	const conditions = buildProjectConditions(
		pemd.sidId,
		authResult.allowedProjectIds,
		authResult.projectId
	);

	const baseQuery = db
		.select({
			id: pemd.id,
			objet: objets.objet,
			description: pemd.description,
			etat: pemd.etat,
			etage: pemd.etage,
			potentielReemploi: pemd.potentielReemploi,
			reemploi: pemd.reemploi,
			projetId: pemd.sidId,
			projetNom: projet.libelle
		})
		.from(pemd)
		.leftJoin(objets, eq(pemd.objetId, objets.id))
		.leftJoin(projet, eq(pemd.sidId, projet.id));

	const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

	const list = await query;
	const buffer = await generateTableauSyntheseExcel(list);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="tableau_synthese_pemd_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
