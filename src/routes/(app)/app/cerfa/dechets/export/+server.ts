import { db } from '$lib/server/db/client';
import { pemd, natureV2, objets, categorieV2 } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateDechetsExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const projetId = url.searchParams.get('projetId');
    
    if (!projetId) {
        return new Response('Project ID required', { status: 400 });
    }

    // Récupération des déchets/PEMD pour ce projet avec toutes les infos de traitement
    const dechets = await db.select({
        id: pemd.id,
        sidId: pemd.sidId,
        reemploi: pemd.reemploi,
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
    const dechetsSeulement = dechets.filter(d => d.reemploi === 0 || d.reemploi === null);
    
    // Grouper par catégorie, nature et code déchet pour créer un résumé agrégé
    const groupedDechets = new Map();
    
    dechetsSeulement.forEach(item => {
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

    const buffer = await generateDechetsExcel(uniqueDechets);

    return new Response(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="caracterisation_dechets.xlsx"`
        }
    });
};
