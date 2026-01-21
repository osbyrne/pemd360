import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { objets, categorieV2, groupe } from '$lib/server/db/schema';
import { eq, isNotNull, not } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
    const { isAdmin } = await parent();

    if (!isAdmin) {
        throw redirect(303, '/app/unauthorized');
    }

    // On récupère tout pour le moment, le filtrage strict nécessiterait de connaître les valeurs exactes
    const items = await db.select({
        id: objets.id,
        objet: objets.objet,
        categorie: categorieV2.categoriev2,
        groupe: groupe.groupe,
        deposeReemlpoi: objets.deposeReemlpoi,
        unite: objets.unite
    })
    .from(objets)
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id));
    // .where(isNotNull(objets.deposeReemlpoi)); // Optionnel : filtrer si on est sûr que null = pas réemploi

    return {
        items
    };
};
