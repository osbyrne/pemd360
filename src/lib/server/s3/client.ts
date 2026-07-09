import { S3Client } from "@aws-sdk/client-s3";
import {
  S3_API_URL,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} from "$env/static/private";

export const r2BucketName = R2_BUCKET_NAME;

export const s3Client = new S3Client({
  region: "auto",
  endpoint: S3_API_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
