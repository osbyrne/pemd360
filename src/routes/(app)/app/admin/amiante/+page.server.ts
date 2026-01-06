import { db } from '$lib/server/db/client';
import { tagsAmiante, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const list = await db.select({
        id: tagsAmiante.id,
        label: tagsAmiante.label,
        description: tagsAmiante.description,
        presenceAmiante: tagsAmiante.presenceAmiante,
        projetId: tagsAmiante.sidId,
        projetNom: projet.libelle
    })
    .from(tagsAmiante)
    .leftJoin(projet, eq(tagsAmiante.sidId, projet.id))
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
            await db.delete(tagsAmiante).where(eq(tagsAmiante.id, id));
            return { success: true };
        } catch (e: any) {
            console.error('Error deleting tag amiante:', e);
            return fail(500, { message: 'Erreur lors de la suppression' });
        }
    }
};
