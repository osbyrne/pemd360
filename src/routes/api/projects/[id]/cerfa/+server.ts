import { generateCerfaPdf } from '$lib/server/cerfa';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch, url }) => {
	try {
		// Fetch the template PDF from static assets
		// Using fetch with relative path works in SvelteKit for static files
		const response = await fetch('/CERFA_Exemple.pdf');
		if (!response.ok) {
			throw new Error(`Failed to load PDF template: ${response.statusText}`);
		}
		const templateBuffer = await response.arrayBuffer();

		const pdfBytes = await generateCerfaPdf(params.id, templateBuffer);

		return new Response(pdfBytes, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="cerfa_${params.id}.pdf"`
			}
		});
	} catch (error) {
		console.error('Error generating CERFA:', error);
		return new Response('Error generating PDF', { status: 500 });
	}
};
