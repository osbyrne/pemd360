import { db } from '$lib/server/db/client';
import { pemd, projet, objets } from '$lib/server/db/schema';
import { validateExportAuth, buildProjectConditions } from '$lib/server/db/queries';
import { generateTableauSyntheseReemploiExcel } from '$lib/server/excel';
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

	// Filter items with reemploi potential
	const filteredList = list.filter(
		(item) =>
			item.reemploi === 1 || (item.potentielReemploi && item.potentielReemploi.trim() !== '')
	);

	const buffer = await generateTableauSyntheseReemploiExcel(filteredList);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="tableau_synthese_reemploi_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
