import { db } from '$lib/server/db/client';
import { pemd, natureV2, objets, categorieV2, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const projetId = url.searchParams.get('projetId');

	if (!projetId) {
		return {
			dechets: [],
			projetInfo: null
		};
	}

	// Récupération des informations du projet
	const projetInfo = await db
		.select({
			id: projet.id,
			libelle: projet.libelle,
			reference: projet.reference
		})
		.from(projet)
		.where(eq(projet.id, projetId))
		.get();

	// Récupération des déchets/PEMD pour ce projet avec toutes les infos de traitement
	const dechets = await db
		.select({
			id: pemd.id,
			sidId: pemd.sidId,
			reemploi: pemd.reemploi,
			potentielReemploi: pemd.potentielReemploi,
			categorie: categorieV2.categoriev2,
			objet: objets.objet,
			codeDechet: natureV2.codeDechet,
			masse: pemd.masse,
			volume: pemd.volume,
			description: pemd.description,
			nature: natureV2.nature,
			// Options de filières et traitement
			reutilisation: natureV2.reutilisation,
			recyclable: natureV2.recyclable,
			valorisationMatiere: natureV2.valorisationMatiere,
			valorisationEnergetique: natureV2.valorisationEnergetique,
			incinerationSansValo: natureV2.incinerationSansValorisationEnergetique,
			nonValorisation: natureV2.nonValorisation,
			stockage: natureV2.stockage,
			ecoOrganisme: natureV2.ecoOrganismeRep
		})
		.from(pemd)
		.leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
		.leftJoin(objets, eq(pemd.objetId, objets.id))
		.leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
		.where(eq(pemd.sidId, projetId))
		.all();

	// Filtrer uniquement les déchets (pas les éléments de réemploi)
	const dechetsSeulement = dechets.filter((d) => d.reemploi === 0 || d.reemploi === null);

	// Grouper par catégorie, nature et code déchet pour créer un résumé agrégé
	const groupedDechets = new Map();

	dechetsSeulement.forEach((item) => {
		const key = `${item.categorie || 'Inconnu'}_${item.nature || 'Inconnu'}_${item.codeDechet || 'NC'}`;

		if (!groupedDechets.has(key)) {
			groupedDechets.set(key, {
				...item,
				masse: item.masse || 0,
				volume: item.volume || 0,
				count: 1
			});
		} else {
			const existing = groupedDechets.get(key);
			existing.masse = (existing.masse || 0) + (item.masse || 0);
			existing.volume = (existing.volume || 0) + (item.volume || 0);
			existing.count += 1;
		}
	});

	const uniqueDechets = Array.from(groupedDechets.values());

	return {
		dechets: uniqueDechets,
		projetInfo
	};
};
