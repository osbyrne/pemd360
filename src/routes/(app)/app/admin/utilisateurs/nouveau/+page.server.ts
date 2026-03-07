import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { projet } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const projets = await db
		.select({ id: projet.id, libelle: projet.libelle, reference: projet.reference })
		.from(projet);

	return { projets };
};
