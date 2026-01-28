import { db } from '$lib/server/db/client';
import { pemd, projet, objets, categorieV2, groupe, natureV2 } from '$lib/server/db/schema';
import { validateExportAuth, buildProjectConditions } from '$lib/server/db/queries';
import { eq, and } from 'drizzle-orm';
import { generateDechetsExcel } from '$lib/server/excel';
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

	let query = db
		.select({
			id: pemd.id,
			categorie: categorieV2.categoriev2,
			objet: objets.objet,
			nature: natureV2.nature,
			codeDechet: natureV2.codeDechet,
			masse: pemd.masse,
			volume: pemd.volume,
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
