import { Context, Effect, Layer } from "effect";
import { StorageError } from "$lib/effect/errors";
import {
  getSignedImageUrl,
  getSignedObjectUrl,
  listStorageObjects,
} from "$lib/server/s3/image-urls";

export type StorageImageExtensions = readonly string[];

export interface StorageService {
  readonly signedImageUrl: (
    hash: string | null | undefined,
    extensions: StorageImageExtensions,
  ) => Effect.Effect<string | null, StorageError>;
  readonly signedUrlForKey: (key: string) => Effect.Effect<string, StorageError>;
  readonly listObjects: (maxKeys: number) => Effect.Effect<readonly string[], StorageError>;
}

export class Storage extends Context.Tag("pemd360/Storage")<Storage, StorageService>() {}

export function makeStorageService(
  adapters: {
    readonly getSignedImageUrl?: typeof getSignedImageUrl;
    readonly getSignedObjectUrl?: typeof getSignedObjectUrl;
    readonly listStorageObjects?: typeof listStorageObjects;
  } = {},
): StorageService {
  const signImage = adapters.getSignedImageUrl ?? getSignedImageUrl;
  const signObject = adapters.getSignedObjectUrl ?? getSignedObjectUrl;
  const listObjects = adapters.listStorageObjects ?? listStorageObjects;

  return {
    signedImageUrl: (hash, extensions) =>
      Effect.tryPromise({
        try: () => signImage(hash, [...extensions]),
        catch: (cause) =>
          new StorageError({
            message: "Le stockage des images est indisponible",
            operation: "storage.signed-image-url",
            cause,
          }),
      }),
    signedUrlForKey: (key) =>
      Effect.tryPromise({
        try: () => signObject(key),
        catch: (cause) =>
          new StorageError({
            message: "Le stockage des images est indisponible",
            operation: "storage.signed-object-url",
            cause,
          }),
      }),
    listObjects: (maxKeys) =>
      Effect.tryPromise({
        try: () => listObjects(maxKeys),
        catch: (cause) =>
          new StorageError({
            message: "Le stockage des images est indisponible",
            operation: "storage.list-objects",
            cause,
          }),
      }),
  };
}

export const StorageLive = Layer.succeed(Storage, makeStorageService());
