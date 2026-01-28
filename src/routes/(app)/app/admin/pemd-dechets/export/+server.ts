import { db } from '$lib/server/db/client';
import { pemd, projet, objets, categorieV2, groupe, natureV2 } from '$lib/server/db/schema';
import { getAllowedProjectIds } from '$lib/server/db/queries';
import { eq, and, inArray } from 'drizzle-orm';
import { generateDechetsExcel } from '$lib/server/excel';
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
			categorie: categorieV2.categoriev2,
			objet: objets.objet,
			nature: natureV2.nature,
			codeDechet: natureV2.codeDechet,
			masse: pemd.masse,
			volume: pemd.volume, // Adding volume since it's in excel function
			reutilisation: natureV2.reutilisation,
			recyclable: natureV2.recyclable,
			valorisationMatiere: natureV2.valorisationMatiere,
			valorisationEnergetique: natureV2.valorisationEnergetique,
			nonValorisation: natureV2.nonValorisation,
			incinerationSansValo: natureV2.incinerationSansValorisationEnergetique,
			ecoOrganisme: natureV2.ecoOrganismeRep,
			stockage: natureV2.stockage,
			projetId: pemd.sidId,
			projetNom: projet.libelle
		})
		.from(pemd)
		.leftJoin(objets, eq(pemd.objetId, objets.id))
		.leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
		.leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
		.leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
		.leftJoin(projet, eq(pemd.sidId, projet.id));

	if (conditions.length > 0) {
		// @ts-ignore
		query.where(and(...conditions));
	}

	const list = await query.all();

	const buffer = await generateDechetsExcel(list);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="inventaire_pemd_dechets_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
