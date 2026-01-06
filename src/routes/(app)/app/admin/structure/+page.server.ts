import { db } from '$lib/server/db/client';
import { tagsStructure, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    const list = await db.select({
        id: tagsStructure.id,
        label: tagsStructure.label,
        description: tagsStructure.description,
        screenSurface: tagsStructure.screenSurface,
        shapeSurface: tagsStructure.shapeSurface,
        projetId: tagsStructure.sidId,
        projetNom: projet.libelle
    })
    .from(tagsStructure)
    .leftJoin(projet, eq(tagsStructure.sidId, projet.id))
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
            await db.delete(tagsStructure).where(eq(tagsStructure.id, id));
            return { success: true };
        } catch (e: any) {
            console.error('Error deleting tag structure:', e);
            return fail(500, { message: 'Erreur lors de la suppression' });
        }
    }
};
