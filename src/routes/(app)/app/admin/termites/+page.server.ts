import { db } from '$lib/server/db/client';
import { tagsTermite, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const list = await db.select({
        id: tagsTermite.id,
        label: tagsTermite.label,
        description: tagsTermite.description,
        presenceTermite: tagsTermite.presenceTermite,
        projetId: tagsTermite.sidId,
        projetNom: projet.libelle
    })
    .from(tagsTermite)
    .leftJoin(projet, eq(tagsTermite.sidId, projet.id))
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
            await db.delete(tagsTermite).where(eq(tagsTermite.id, id));
            return { success: true };
        } catch (e: any) {
            console.error('Error deleting tag termite:', e);
            return fail(500, { message: 'Erreur lors de la suppression' });
        }
    }
};
