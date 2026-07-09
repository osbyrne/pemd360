import { getSignedImageUrl } from "$lib/server/s3/image-urls";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const signedUrl = await getSignedImageUrl(params.hash, ["jpg", "jpeg", "png", "webp"]);

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
