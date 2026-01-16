import { S3Client } from '@aws-sdk/client-s3';
import { Resource } from 'sst';

export const s3Client = new S3Client({
	region: 'auto',
	endpoint: Resource.S3_API_URL.value,
	credentials: {
		accessKeyId: Resource.R2_ACCESS_KEY_ID.value,
		secretAccessKey: Resource.R2_SECRET_ACCESS_KEY.value
	}
});
