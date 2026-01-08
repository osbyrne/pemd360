import { db } from '$lib/server/db/client';
import { tagsPlomb, projet, userProjet } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { generateRiskExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    const user = locals.user;

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const projectId = url.searchParams.get('projectId');
    
    let allowedProjectIds: string[] = [];

    if (user.role === 'admin') {
        const allProjects = await db.select({ id: projet.id }).from(projet);
        allowedProjectIds = allProjects.map(p => p.id);
    } else {
        const userProjects = await db.select({ id: projet.id })
            .from(projet)
            .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
            .where(eq(userProjet.userId, user.id));
        allowedProjectIds = userProjects.map(p => p.id);
    }

    if (allowedProjectIds.length === 0) {
        return new Response('No access to any project', { status: 403 });
    }

    const conditions = [];

    if (projectId) {
        if (!allowedProjectIds.includes(projectId)) {
             return new Response('Unauthorized for this project', { status: 403 });
        }
        conditions.push(eq(tagsPlomb.sidId, projectId));
    } else {
         conditions.push(inArray(tagsPlomb.sidId, allowedProjectIds));
    }

    let query = db.select({
        id: tagsPlomb.id,
        label: tagsPlomb.label,
        description: tagsPlomb.description,
        etage: tagsPlomb.etage, // Previously added
        projetId: tagsPlomb.sidId,
        projetNom: projet.libelle
    })
    .from(tagsPlomb)
    .leftJoin(projet, eq(tagsPlomb.sidId, projet.id));

    if (conditions.length > 0) {
        // @ts-ignore
        query.where(and(...conditions));
    }

    const list = await query.all();

    const buffer = await generateRiskExcel(list, 'Plomb');

    return new Response(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="inventaire_plomb_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
    });
};
