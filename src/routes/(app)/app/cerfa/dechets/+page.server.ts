import { db } from '$lib/server/db/client';
import { objets, categorieV2, groupe } from '$lib/server/db/schema';
import { eq, isNotNull } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    // Caractérisation Déchets : Objets marqués avec deposeDechet
    const items = await db.select({
        id: objets.id,
        objet: objets.objet,
        categorie: categorieV2.categoriev2,
        groupe: groupe.groupe,
        unite: objets.unite,
        masseUnitaire: objets.masseUnitaire,
        destination: objets.deposeDechet // Info spécifique déchet (Recyclage, Enfouissement...)
    })
    .from(objets)
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .where(isNotNull(objets.deposeDechet)) 
    .all();

    return {
        items
    };
};
