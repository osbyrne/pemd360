import { db } from '$lib/server/db/client';
import { pemd, projet, userProjet, objets } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import ExcelJS from 'exceljs';
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
		// Filter to only allowed projects
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

	// Filtrer côté serveur les éléments avec potentiel de réemploi
	const filteredList = list.filter(
		(item) =>
			item.reemploi === 1 || (item.potentielReemploi && item.potentielReemploi.trim() !== '')
	);

	// Generate Excel
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Tableau Synthèse Réemploi');

	worksheet.columns = [
		{ header: 'Description', key: 'description', width: 40 },
		{ header: 'État', key: 'etat', width: 15 },
		{ header: 'Étage', key: 'etage', width: 15 },
		{ header: 'Potentiel réemploi', key: 'potentielReemploi', width: 20 },
		{ header: 'Coefficient réemploi', key: 'coefficientReemploi', width: 20 },
		{ header: 'Projet', key: 'projet', width: 25 }
	];

	// Style the header
	worksheet.getRow(1).font = { bold: true };
	worksheet.getRow(1).fill = {
		type: 'pattern',
		pattern: 'solid',
		fgColor: { argb: 'FF10B981' }
	};
	worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

	// Auto-filter
	worksheet.autoFilter = {
		from: {
			row: 1,
			column: 1
		},
		to: {
			row: 1,
			column: 6
		}
	};

	filteredList.forEach((item) => {
		// Calcul du coefficient de réemploi
		let coefficientReemploi = '0%';
		if (item.reemploi) {
			coefficientReemploi = '100%';
		} else if (item.potentielReemploi) {
			coefficientReemploi = item.potentielReemploi;
		}

		worksheet.addRow({
			description: item.description || item.objet || '-',
			etat: item.etat || '-',
			etage: item.etage || '-',
			potentielReemploi: item.potentielReemploi || '-',
			coefficientReemploi: coefficientReemploi,
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="tableau_synthese_reemploi_${new Date().toISOString().split('T')[0]}.xlsx"`
		}
	});
};
