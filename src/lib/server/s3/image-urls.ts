import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2BucketName, s3Client } from "./client";

const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const imageKeyCache = new Map<string, Promise<string | null>>();

export async function getSignedImageUrl(hash: string | null | undefined, extensions: string[]) {
  if (!hash || hash === EMPTY_IMAGE_HASH) {
    return null;
  }

  const cacheKey = `${hash}:${extensions.join(",")}`;
  const cached = imageKeyCache.get(cacheKey);
  const imageKey = cached ?? resolveImageKey(hash, extensions);

  if (!cached) {
    imageKeyCache.set(cacheKey, imageKey);
  }

  const key = await imageKey;

  if (!key) {
    return null;
  }

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: r2BucketName,
      Key: key,
    }),
    {
      expiresIn: 3600,
    },
  );
}

async function resolveImageKey(hash: string, extensions: string[]) {
  for (const extension of extensions) {
    const key = `${hash}.${extension}`;

    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: r2BucketName,
          Key: key,
        }),
      );

      return key;
    } catch {
      // Try the next known image extension.
    }
  }

  return null;
}
