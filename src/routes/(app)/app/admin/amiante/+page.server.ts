import { db } from '$lib/server/db/client';
import { tagsAmiante, projet, userProjet } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
    const user = locals.user;

    if (!user) {
        throw redirect(302, '/login');
    }

    const projectId = url.searchParams.get('projectId');
    let projects;

    if (user.role === 'admin') {
        projects = await db.select({
            id: projet.id,
            libelle: projet.libelle
        }).from(projet);
    } else {
        projects = await db.select({
            id: projet.id,
            libelle: projet.libelle
        })
        .from(projet)
        .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
        .where(eq(userProjet.userId, user.id));
    }

    let query = db.select({
        id: tagsAmiante.id,
        label: tagsAmiante.label,
        description: tagsAmiante.description,
        etage: tagsAmiante.etage,
        type: tagsAmiante.type,
        customImage: tagsAmiante.customImage,
        presenceAmiante: tagsAmiante.presenceAmiante,
        projetId: tagsAmiante.sidId,
        projetNom: projet.libelle
    })
    .from(tagsAmiante)
    .leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

    const conditions = [];

    if (user.role !== 'admin') {
        const allowedids = projects.map(p => p.id);
        if (allowedids.length > 0) {
            conditions.push(inArray(tagsAmiante.sidId, allowedids));
        } else {
            // User has no projects, so they see nothing
            return {
                list: [],
                projects: [],
                selectedProjectId: projectId
            };
        }
    }

    if (projectId) {
        conditions.push(eq(tagsAmiante.sidId, projectId));
    }

    if (conditions.length > 0) {
        // @ts-ignore
        query.where(and(...conditions));
    }

    const list = await query.all();

    return {
        list,
        projects,
        selectedProjectId: projectId
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
