import { db } from '$lib/server/db/client';
import { objets, categorieV2, groupe } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    // On charge tous les objets avec leur groupe
    const items = await db.select({
        id: objets.id,
        objet: objets.objet,
        categorie: categorieV2.categoriev2,
        groupe: groupe.groupe,
        deposeReemlpoi: objets.deposeReemlpoi,
        deposeDechet: objets.deposeDechet
    })
    .from(objets)
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id));

    // Calcul des statistiques
    const stats = {
        totalObjets: items.length,
        totalReemploi: items.filter(i => i.deposeReemlpoi).length,
        totalDechets: items.filter(i => i.deposeDechet).length,
        byGroupe: {} as Record<string, { count: number, reemploi: number, dechets: number }>
    };

    // Agrégation par Groupe (Macro-catégorie)
    for (const item of items) {
        const groupeNom = item.groupe || 'Indéfini';
        
        if (!stats.byGroupe[groupeNom]) {
            stats.byGroupe[groupeNom] = { count: 0, reemploi: 0, dechets: 0 };
        }
        
        stats.byGroupe[groupeNom].count++;
        if (item.deposeReemlpoi) stats.byGroupe[groupeNom].reemploi++;
        if (item.deposeDechet) stats.byGroupe[groupeNom].dechets++;
    }

    return {
        stats
    };
};
