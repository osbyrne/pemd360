import { db } from '$lib/server/db/client';
import { cerfaDiagnostic } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const diagnostic = await db
		.select()
		.from(cerfaDiagnostic)
		.where(eq(cerfaDiagnostic.projetId, id))
		.get();
	return { diagnostic };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { id } = params;
		const formData = await request.formData();

		const derniereVisiteStr = formData.get('derniereVisite')?.toString();
		const documentsConsultes = formData.getAll('documentsConsultes').map(String);

		const values = {
			projetId: id,
			derniereVisite: derniereVisiteStr ? new Date(derniereVisiteStr).getTime() : null,
			batVisite: formData.get('batVisite')?.toString() || null,
			batNonVisite: formData.get('batNonVisite')?.toString() || null,
			raisonsNePasVisite: formData.get('raisonsNePasVisite')?.toString() || null,
			desordres: formData.get('desordres') === 'true' ? 1 : 0,
			precaution: formData.get('precaution') === 'true' ? 1 : 0,
			documentsConsultes: JSON.stringify(documentsConsultes)
		};

		const existing = await db
			.select({ id: cerfaDiagnostic.id })
			.from(cerfaDiagnostic)
			.where(eq(cerfaDiagnostic.projetId, id))
			.get();

		if (existing) {
			await db.update(cerfaDiagnostic).set(values).where(eq(cerfaDiagnostic.projetId, id));
		} else {
			await db.insert(cerfaDiagnostic).values(values);
		}

		redirect(303, `/app/cerfa/informations?projetId=${id}`);
	}
};
