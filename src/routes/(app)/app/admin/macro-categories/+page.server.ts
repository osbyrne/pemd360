import { db } from '$lib/server/db/client';
import { groupe } from '$lib/server/db/schema';
import { createCrudActions } from '$lib/server/db/actions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const groupes = await db.select().from(groupe).all();
	return {
		groupes
	};
};

export const actions = createCrudActions({
	table: groupe,
	idColumn: groupe.id,
	nameColumn: groupe.groupe,
	entityName: 'groupe',
	formFieldName: 'groupe'
});
