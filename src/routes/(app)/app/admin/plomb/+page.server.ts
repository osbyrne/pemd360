import { db } from '$lib/server/db/client';
import { tagsPlomb, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const list = await db.select({
        id: tagsPlomb.id,
        label: tagsPlomb.label,
        description: tagsPlomb.description,
        presencePlomb: tagsPlomb.presencePlomb,
        concentration: tagsPlomb.concentration,
        projetId: tagsPlomb.sidId,
        projetNom: projet.libelle
    })
    .from(tagsPlomb)
    .leftJoin(projet, eq(tagsPlomb.sidId, projet.id))
    .all();

    return {
        list
    };
};

export const actions: Actions = {
    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return fail(400, { message: 'ID requis' });
        }

        try {
            await db.delete(tagsPlomb).where(eq(tagsPlomb.id, id));
            return { success: true };
        } catch (e: any) {
            console.error('Error deleting tag plomb:', e);
            return fail(500, { message: 'Erreur lors de la suppression' });
        }
    }
};
