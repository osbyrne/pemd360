import { db } from '$lib/server/db/client';
import { pemd, projet, objets } from '$lib/server/db/schema';
import { getAllowedProjectIds } from '$lib/server/db/queries';
import { generateTableauSyntheseExcel } from '$lib/server/excel';
import { eq, and, inArray } from 'drizzle-orm';
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
		conditions.push(eq(pemd.sidId, projectId));
	} else {
		conditions.push(inArray(pemd.sidId, allowedProjectIds));
	}

	let query = db
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

	if (conditions.length > 0) {
		// @ts-ignore
		query = query.where(and(...conditions));
	}

	const list = await query;
	const buffer = await generateTableauSyntheseExcel(list);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="tableau_synthese_pemd_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
