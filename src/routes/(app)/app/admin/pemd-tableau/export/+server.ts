import { db } from '$lib/server/db/client';
import {
	pemd,
	projet,
	userProjet,
	objets,
	categorieV2,
	groupe,
	natureV2
} from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { generatePemExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const user = locals.user;

	if (!user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const projectId = url.searchParams.get('projectId');

	// Check permissions / Get allowed projects
	let allowedProjectIds: string[] = [];

	if (user.role === 'admin') {
		const allProjects = await db.select({ id: projet.id }).from(projet);
		allowedProjectIds = allProjects.map((p) => p.id);
	} else {
		const userProjects = await db
			.select({ id: projet.id })
			.from(projet)
			.innerJoin(userProjet, eq(projet.id, userProjet.projetId))
			.where(eq(userProjet.userId, user.id));
		allowedProjectIds = userProjects.map((p) => p.id);
	}

	if (allowedProjectIds.length === 0) {
		return new Response('No access to any project', { status: 403 });
	}

	const conditions = [];

	// Filter by project if specified and allowed
	if (projectId) {
		if (!allowedProjectIds.includes(projectId)) {
			return new Response('Unauthorized for this project', { status: 403 });
		}
		conditions.push(eq(pemd.sidId, projectId));
	} else {
		// Filter to only allowed projects if not admin (or even if admin, to be safe, though admin has all)
		conditions.push(inArray(pemd.sidId, allowedProjectIds));
	}

	let query = db
		.select({
			id: pemd.id,
			groupe: groupe.groupe,
			categorie: categorieV2.categoriev2,
			objet: objets.objet,
			estimationAge: pemd.estimationAge,
			quantite: pemd.quantite,
			description: pemd.description,
			etat: pemd.etat,
			nature: natureV2.nature,
			surface: pemd.surface,
			epaisseur: pemd.epaisseur,
			densite: natureV2.densite,
			masse: pemd.masse,
			constitution: pemd.constitution,
			image: pemd.image,
			etage: pemd.etage,
			typologieAppart: pemd.typologieAppart,
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

	const buffer = await generatePemExcel(list);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="inventaire_pemd_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
