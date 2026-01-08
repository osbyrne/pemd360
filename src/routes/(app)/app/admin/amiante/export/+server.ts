import { db } from '$lib/server/db/client';
import { tagsAmiante, projet, userProjet } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { generateRiskExcel } from '$lib/server/excel';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
    const user = locals.user;

    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    const projectId = url.searchParams.get('projectId');
    
    // Check permissions / Get allowed projects
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

    // Filter by project if specified and allowed
    if (projectId) {
        if (!allowedProjectIds.includes(projectId)) {
             return new Response('Unauthorized for this project', { status: 403 });
        }
        conditions.push(eq(tagsAmiante.sidId, projectId));
    } else {
        // Filter to only allowed projects if not admin (or even if admin, to be safe, though admin has all)
         conditions.push(inArray(tagsAmiante.sidId, allowedProjectIds));
    }

    let query = db.select({
        id: tagsAmiante.id,
        label: tagsAmiante.label,
        description: tagsAmiante.description,
        etage: tagsAmiante.etage,
        type: tagsAmiante.type,
        projetId: tagsAmiante.sidId,
        projetNom: projet.libelle
    })
    .from(tagsAmiante)
    .leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

    if (conditions.length > 0) {
        // @ts-ignore
        query.where(and(...conditions));
    }

    const list = await query.all();

    const buffer = await generateRiskExcel(list, 'Amiante');

    return new Response(buffer, {
        headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="inventaire_amiante_${new Date().toISOString().split('T')[0]}.xlsx"`
        }
    });
};
