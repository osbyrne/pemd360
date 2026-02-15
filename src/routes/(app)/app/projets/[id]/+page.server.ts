import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/client';
import {
	projet,
	etablissement,
	user,
	tagMail,
	tagsAmiante,
	tagsPlomb,
	tagsTermite,
	pemd,
	groupe,
	categorieV2,
	objets
} from '$lib/server/db/schema';
import { auth } from '$lib/auth';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const currentUser = locals.user;

	if (!currentUser) {
		throw error(401, 'Non autorisé');
	}

	const result = await db.select().from(projet).where(eq(projet.id, id));
	const project = result[0];

	if (!project) {
		throw error(404, 'Projet non trouvé');
	}

	// Vérifier que l'utilisateur a accès à ce projet (admin ou même société)
	if (currentUser.role !== 'admin') {
		const userWithSociete = await db.select().from(user).where(eq(user.id, currentUser.id));
		const societeId = userWithSociete[0]?.societeId;

		if (societeId) {
			// Récupérer les établissements de la société
			const etablissements = await db
				.select({ id: etablissement.id })
				.from(etablissement)
				.where(eq(etablissement.societeId, societeId));

			const etablissementIds = etablissements.map((e) => e.id);

			if (!etablissementIds.includes(project.etablissementId)) {
				throw error(403, 'Accès non autorisé à ce projet');
			}
		}
	}

	// Load tags for this project
	const tags = await db.select().from(tagMail).where(eq(tagMail.projetId, id));
	const amianteTags = await db.select().from(tagsAmiante).where(eq(tagsAmiante.sidId, id));
	const plombTags = await db.select().from(tagsPlomb).where(eq(tagsPlomb.sidId, id));
	const termiteTags = await db.select().from(tagsTermite).where(eq(tagsTermite.sidId, id));
	const pemdTags = await db.select().from(pemd).where(eq(pemd.sidId, id));

	// Build facets for PEMD (groupe -> categorie -> objet) to drive UI filters/autocomplete
	const pemdFacets = await db
		.select({
			groupeId: groupe.id,
			groupeName: groupe.groupe,
			categorieId: categorieV2.id,
			categorieName: categorieV2.categoriev2,
			objetId: objets.id,
			objetName: objets.objet
		})
		.from(pemd)
		.leftJoin(objets, eq(pemd.objetId, objets.id))
		.leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
		.leftJoin(groupe, eq(categorieV2.groupeId, groupe.id))
		.where(eq(pemd.sidId, id))
		.orderBy(groupe.groupe, categorieV2.categoriev2, objets.objet);

	// Also load all groups and all categorie_v2 (master lists) to power the autocomplete.
	const allGroups = await db
		.select({ id: groupe.id, name: groupe.groupe })
		.from(groupe)
		.orderBy(groupe.groupe);

	const categoriesV2 = await db
		.select({ id: categorieV2.id, name: categorieV2.categoriev2, groupeId: categorieV2.groupeId })
		.from(categorieV2)
		.orderBy(categorieV2.categoriev2);

	const allPemdObjects = await db
		.select({ id: objets.id, name: objets.objet, categorieId: objets.categorieId })
		.from(objets)
		.orderBy(objets.objet);

	return {
		projet: project,
		tags: tags,
		amianteTags: amianteTags,
		plombTags: plombTags,
		termiteTags: termiteTags,
		pemdTags: pemdTags,
		pemdFacets: pemdFacets,
		groups: allGroups,
		categoriesV2: categoriesV2,
		allPemdObjects: allPemdObjects,
		matterportSdkKey: env.MATTERPORT_SDK_KEY
	};
};

export const actions: Actions = {
	createPemdTag: async ({ request, params, locals }) => {
		const currentUser = locals.user;
		if (!currentUser) {
			return fail(401, { error: 'Non autorisé' });
		}

		// Check permissions
		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: currentUser.id,
				permissions: {
					tags: ['create']
				}
			}
		});

		if (!hasPermission.success) {
			return fail(403, { error: 'Permission refusée' });
		}

		const formData = await request.formData();
		const projetId = params.id;

		// Extract form fields
		const objetId = formData.get('objetId');
		const natureId = formData.get('natureId');
		const description = formData.get('description');
		const quantite = formData.get('quantite');
		const etage = formData.get('etage');
		const etat = formData.get('etat');
		const anchorPosition = formData.get('anchorPosition');
		const stemVector = formData.get('stemVector');
		const longueur = formData.get('longueur');
		const largeur = formData.get('largeur');
		const epaisseur = formData.get('epaisseur');
		const potentielReemploi = formData.get('potentielReemploi');

		if (!anchorPosition || !stemVector) {
			return fail(400, { error: 'Position manquante' });
		}

		try {
			const newId = nanoid();

			await db.insert(pemd).values({
				id: newId,
				sidId: projetId,
				objetId: objetId ? Number(objetId) : null,
				natureId: natureId ? Number(natureId) : null,
				description: description?.toString() || null,
				quantite: quantite ? Number(quantite) : null,
				etage: etage?.toString() || null,
				etat: etat?.toString() || null,
				anchorPosition: anchorPosition.toString(),
				stemVector: stemVector.toString(),
				longueur: longueur ? Number(longueur) : null,
				largeur: largeur ? Number(largeur) : null,
				epaisseur: epaisseur ? Number(epaisseur) : null,
				potentielReemploi: potentielReemploi?.toString() || null,
				color: '#9933FF' // Purple color for PEMD tags
			});

			// Return the newly created tag data for immediate display
			return {
				success: true,
				tag: {
					id: newId,
					sidId: projetId,
					objetId: objetId ? Number(objetId) : null,
					description: description?.toString() || null,
					quantite: quantite ? Number(quantite) : null,
					etage: etage?.toString() || null,
					etat: etat?.toString() || null,
					anchorPosition: anchorPosition.toString(),
					stemVector: stemVector.toString()
				}
			};
		} catch (e) {
			console.error('Failed to create PEMD tag:', e);
			return fail(500, { error: 'Échec de la création du tag' });
		}
	},

	deletePemdTag: async ({ request, locals }) => {
		const currentUser = locals.user;
		if (!currentUser) {
			return fail(401, { error: 'Non autorisé' });
		}

		// Check permissions
		const hasPermission = await auth.api.userHasPermission({
			body: {
				userId: currentUser.id,
				permissions: {
					tags: ['delete']
				}
			}
		});

		if (!hasPermission.success) {
			return fail(403, { error: 'Permission refusée' });
		}

		const formData = await request.formData();
		const tagId = formData.get('tagId');

		if (!tagId) {
			return fail(400, { error: 'ID du tag manquant' });
		}

		try {
			await db.delete(pemd).where(eq(pemd.id, tagId.toString()));
			return { success: true, deletedId: tagId.toString() };
		} catch (e) {
			console.error('Failed to delete PEMD tag:', e);
			return fail(500, { error: 'Échec de la suppression du tag' });
		}
	}
};
