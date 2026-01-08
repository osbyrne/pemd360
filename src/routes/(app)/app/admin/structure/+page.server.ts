import { db } from '$lib/server/db/client';
import { tagsStructure, projet, userProjet } from '$lib/server/db/schema';
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
        id: tagsStructure.id,
        label: tagsStructure.label,
        description: tagsStructure.description,
        screenSurface: tagsStructure.screenSurface,
        shapeSurface: tagsStructure.shapeSurface,
        projetId: tagsStructure.sidId,
        projetNom: projet.libelle
    })
    .from(tagsStructure)
    .leftJoin(projet, eq(tagsStructure.sidId, projet.id));

    const conditions = [];

    if (user.role !== 'admin') {
        const allowedids = projects.map(p => p.id);
        if (allowedids.length > 0) {
            conditions.push(inArray(tagsStructure.sidId, allowedids));
        } else {
             return {
                list: [],
                projects: [],
                selectedProjectId: projectId
            };
        }
    }

    if (projectId) {
        conditions.push(eq(tagsStructure.sidId, projectId));
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
            await db.delete(tagsStructure).where(eq(tagsStructure.id, id));
            return { success: true };
        } catch (e: any) {
            console.error('Error deleting tag structure:', e);
            return fail(500, { message: 'Erreur lors de la suppression' });
        }
    }
};
