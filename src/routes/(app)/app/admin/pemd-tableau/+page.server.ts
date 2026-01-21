import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { pemd, objets, categorieV2, groupe, projet, userProjet } from '$lib/server/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

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
        id: pemd.id,
        description: pemd.description,
        quantite: pemd.quantite,
        etage: pemd.etage,
        volume: pemd.volume,
        masse: pemd.masse,
        surface: pemd.surface,
        reemploi: pemd.reemploi,
        objet: objets.objet,
        unite: objets.unite,
        masseUnitaire: objets.masseUnitaire,
        categorie: categorieV2.categoriev2,
        groupe: groupe.groupe,
        projetId: pemd.sidId,
        projetNom: projet.libelle
    })
    .from(pemd)
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
    .leftJoin(projet, eq(pemd.sidId, projet.id));

    const conditions = [];

    if (user.role !== 'admin') {
        const allowedids = projects.map(p => p.id);
        if (allowedids.length > 0) {
            conditions.push(inArray(pemd.sidId, allowedids));
        } else {
            return {
                list: [],
                projects: [],
                selectedProjectId: projectId
            };
        }
    }

    if (projectId) {
        conditions.push(eq(pemd.sidId, projectId));
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
