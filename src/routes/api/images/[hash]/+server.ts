import { isBoundarySuccess, responseFailure } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { Storage } from "$lib/server/services/storage";
import { Effect } from "effect";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await runServerEffect(
    Effect.gen(function* () {
      const storage = yield* Storage;
      return yield* storage.signedImageUrl(params.hash, ["jpg", "jpeg", "png", "webp"]);
    }),
  );

  if (!isBoundarySuccess(result)) return responseFailure(result, "Image unavailable");

  const signedUrl = result.value;

  if (!signedUrl) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: signedUrl,
      "Cache-Control": "private, max-age=300",
    },
  });
};
