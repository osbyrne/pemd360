import { r2BucketName, s3Client } from "$lib/server/s3/client";
import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function load() {
  try {
    const objects = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: r2BucketName,
        MaxKeys: 25,
      }),
    );
    const imageKey = objects.Contents?.find((object) =>
      object.Key?.match(/\.(avif|gif|jpe?g|png|webp)$/i),
    )?.Key;

    if (!imageKey) {
      return {
        imageUrl: null,
        imageKey: null,
        error: "Aucune image trouvée dans le bucket R2",
      };
    }

    const command = new GetObjectCommand({
      Bucket: r2BucketName,
      Key: imageKey,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      imageUrl: url,
      imageKey,
      error: null,
    };
  } catch (error) {
    console.error("Erreur:", error);
    return {
      imageUrl: null,
      imageKey: null,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}
