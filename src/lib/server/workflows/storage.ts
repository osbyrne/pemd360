import { Effect } from "effect";
import { Storage } from "$lib/server/services/storage";
import { StorageError } from "$lib/effect/errors";

export type PlaygroundImageResult = {
  readonly imageUrl: string | null;
  readonly imageKey: string | null;
  readonly error: string | null;
};

export function loadPlaygroundImage(): Effect.Effect<PlaygroundImageResult, StorageError, Storage> {
  return Effect.gen(function* () {
    const storage = yield* Storage;
    const objects = yield* storage.listObjects(25);
    const imageKey = objects.find((key) => /\.(avif|gif|jpe?g|png|webp)$/i.test(key)) ?? null;

    if (!imageKey) {
      return {
        imageUrl: null,
        imageKey: null,
        error: "Aucune image trouvée dans le bucket R2",
      };
    }

    const imageUrl = yield* storage.signedUrlForKey(imageKey);
    return { imageUrl, imageKey, error: null };
  });
}
