import { s3Client } from '$lib/server/s3/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function load() {
	try {
		const command = new GetObjectCommand({
			Bucket: 'pemd360',
			Key: 'images/003ff5d04b5965f1327d80bdca61b393e8f64dc93f68776889d0d01200f0f1df.jpg'
		});

		const url = await getSignedUrl(s3Client, command, {
			expiresIn: 3600
		});

		return {
			imageUrl: url,
			error: null
		};
	} catch (error) {
		console.error('Erreur:', error);
		return {
			imageUrl: null,
			error: error instanceof Error ? error.message : 'Erreur inconnue'
		};
	}
}
