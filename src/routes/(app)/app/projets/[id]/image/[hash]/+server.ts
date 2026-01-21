import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '$lib/server/s3/client';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { hash } = params;

	if (!hash) {
		throw error(400, 'Image hash required');
	}

	const bucketName = env.R2_BUCKET_NAME || 'pemd360';

	// Try both .jpg and .png extensions
	const extensions = ['jpg', 'png'];

	for (const ext of extensions) {
		try {
			const command = new GetObjectCommand({
				Bucket: bucketName,
				Key: `${hash}.${ext}`
			});

			const response = await s3Client.send(command);

			if (response.Body) {
				const contentType = ext === 'jpg' ? 'image/jpeg' : 'image/png';
				const body = await response.Body.transformToByteArray();

				return new Response(Buffer.from(body), {
					headers: {
						'Content-Type': contentType,
						'Cache-Control': 'public, max-age=31536000, immutable'
					}
				});
			}
		} catch (e) {
			// Continue to next extension if this one fails
			continue;
		}
	}

	throw error(404, 'Image not found');
};
