import { S3Client } from "@aws-sdk/client-s3";
import { env } from "$env/dynamic/private";

export type S3Resources = {
  readonly bucketName: string;
  readonly client: S3Client;
};

function normalizeR2Endpoint(endpoint: string, bucketName: string) {
  const url = new URL(endpoint);
  const bucketPath = `/${bucketName}`;

  if (url.pathname === bucketPath || url.pathname === `${bucketPath}/`) {
    url.pathname = "/";
  }

  return url.toString().replace(/\/$/, "");
}

function requiredEnv(
  name: "S3_API_URL" | "R2_ACCESS_KEY_ID" | "R2_SECRET_ACCESS_KEY" | "R2_BUCKET_NAME",
) {
  const value = env[name]?.trim();
  if (!value) throw new Error(`${name} must be configured before using R2`);
  return value;
}

export function createS3Resources(config: {
  readonly endpoint: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucketName: string;
}): S3Resources {
  return {
    bucketName: config.bucketName,
    client: new S3Client({
      region: "auto",
      endpoint: normalizeR2Endpoint(config.endpoint, config.bucketName),
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    }),
  };
}

let cachedResources: S3Resources | undefined;

/** Lazily create the shared R2 client after a storage workflow is requested. */
export function getS3Resources(): S3Resources {
  cachedResources ??= createS3Resources({
    endpoint: requiredEnv("S3_API_URL"),
    accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
    bucketName: requiredEnv("R2_BUCKET_NAME"),
  });

  return cachedResources;
}
