import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { objets, categorieV2, groupe } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
    const { isAdmin } = await parent();

    if (!isAdmin) {
        throw redirect(303, '/app/unauthorized');
    }

    const items = await db.select({
        id: objets.id,
        objet: objets.objet,
        categorie: categorieV2.categoriev2,
        groupe: groupe.groupe,
        deposeDechet: objets.deposeDechet,
        unite: objets.unite
    })
    .from(objets)
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id));

    return {
        items
    };
};
