import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Resources } from "./client";

export const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
export const IMAGE_KEY_CACHE_TTL_MS = 5 * 60 * 1000;
export const IMAGE_KEY_CACHE_MAX_ENTRIES = 512;

export type ImageUrlAdapter = {
  readonly headObject: (key: string) => PromiseLike<void>;
  readonly signObject: (key: string) => PromiseLike<string>;
};

export type ImageUrlResolverOptions = {
  readonly ttlMs?: number;
  readonly maxEntries?: number;
  readonly now?: () => number;
};

type ImageKeyCacheEntry = {
  readonly expiresAt: number;
  readonly value: Promise<string | null>;
};

/**
 * Build an image URL resolver around a narrow object-store adapter.
 * The factory is also used by tests so cache and provider failure behavior are deterministic.
 */
export function createImageUrlResolver(
  adapter: ImageUrlAdapter,
  options: ImageUrlResolverOptions = {},
): (hash: string | null | undefined, extensions: readonly string[]) => Promise<string | null> {
  const imageKeyCache = new Map<string, ImageKeyCacheEntry>();
  const ttlMs = options.ttlMs ?? IMAGE_KEY_CACHE_TTL_MS;
  const maxEntries = options.maxEntries ?? IMAGE_KEY_CACHE_MAX_ENTRIES;
  const now = options.now ?? Date.now;

  return async (hash, extensions) => {
    if (!hash || hash === EMPTY_IMAGE_HASH) return null;

    const cacheKey = `${hash}:${extensions.join(",")}`;
    const timestamp = now();
    const cached = imageKeyCache.get(cacheKey);
    if (cached && cached.expiresAt > timestamp) {
      try {
        return signOptionalKey(adapter, await cached.value);
      } catch (cause) {
        if (imageKeyCache.get(cacheKey) === cached) imageKeyCache.delete(cacheKey);
        throw cause;
      }
    }
    if (cached) imageKeyCache.delete(cacheKey);

    const value = resolveImageKey(adapter, hash, extensions);
    const entry: ImageKeyCacheEntry = { expiresAt: timestamp + ttlMs, value };
    imageKeyCache.set(cacheKey, entry);
    trimCache(imageKeyCache, maxEntries);

    try {
      return signOptionalKey(adapter, await value);
    } catch (cause) {
      if (imageKeyCache.get(cacheKey) === entry) imageKeyCache.delete(cacheKey);
      throw cause;
    }
  };
}

const defaultImageUrlResolver = createImageUrlResolver({
  headObject: async (key) => {
    const { bucketName, client } = getS3Resources();
    await client.send(new HeadObjectCommand({ Bucket: bucketName, Key: key }));
  },
  signObject: (key) => {
    const { bucketName, client } = getS3Resources();
    return getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key }), {
      expiresIn: 3600,
    });
  },
});

export function getSignedImageUrl(hash: string | null | undefined, extensions: readonly string[]) {
  return defaultImageUrlResolver(hash, extensions);
}

export async function listStorageObjects(maxKeys: number): Promise<string[]> {
  const { bucketName, client } = getS3Resources();
  const response = await client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: maxKeys,
    }),
  );

  return (response.Contents ?? [])
    .map((object) => object.Key)
    .filter((key): key is string => typeof key === "string");
}

export async function getSignedObjectUrl(key: string): Promise<string> {
  const { bucketName, client } = getS3Resources();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucketName, Key: key }), {
    expiresIn: 3600,
  });
}

async function resolveImageKey(
  adapter: ImageUrlAdapter,
  hash: string,
  extensions: readonly string[],
): Promise<string | null> {
  for (const extension of extensions) {
    const key = `${hash}.${extension}`;
    try {
      await adapter.headObject(key);
      return key;
    } catch (cause) {
      if (!isNotFound(cause)) throw cause;
    }
  }
  return null;
}

export function isStorageNotFound(cause: unknown): boolean {
  if (typeof cause !== "object" || cause === null) return false;
  const error = cause as {
    readonly name?: string;
    readonly Code?: string;
    readonly $metadata?: { readonly httpStatusCode?: number };
  };
  return (
    error.$metadata?.httpStatusCode === 404 ||
    error.name === "NotFound" ||
    error.name === "NoSuchKey" ||
    error.Code === "NotFound" ||
    error.Code === "NoSuchKey"
  );
}

function isNotFound(cause: unknown): boolean {
  return isStorageNotFound(cause);
}

function signOptionalKey(adapter: ImageUrlAdapter, key: string | null): Promise<string | null> {
  return key ? Promise.resolve(adapter.signObject(key)) : Promise.resolve(null);
}

function trimCache(cache: Map<string, ImageKeyCacheEntry>, maxEntries: number) {
  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (typeof oldestKey !== "string") return;
    cache.delete(oldestKey);
  }
}
