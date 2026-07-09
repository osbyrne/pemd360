import { db } from "$lib/server/db/client";
import { tagsAmiante, tagsPlomb, tagsTermite, projet } from "$lib/server/db/schema";
import { getUserProjects } from "$lib/server/db/queries";
import { r2BucketName, s3Client } from "$lib/server/s3/client";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq, and, inArray } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { auth } from "$lib/auth";

const EMPTY_IMAGE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const imageUrlCache = new Map<string, Promise<string | null>>();

async function getSignedImageUrl(hash: string | null, extensions: string[]) {
  if (!hash || hash === EMPTY_IMAGE_HASH) {
    return null;
  }

  const cacheKey = `${hash}:${extensions.join(",")}`;
  const cached = imageUrlCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const signedUrl = resolveSignedImageUrl(hash, extensions);
  imageUrlCache.set(cacheKey, signedUrl);
  return signedUrl;
}

async function resolveSignedImageUrl(hash: string, extensions: string[]) {
  for (const extension of extensions) {
    const key = `${hash}.${extension}`;

    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: r2BucketName,
          Key: key,
        }),
      );

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
    } catch {
      // Try the next known image extension.
    }
  }

  return null;
}

export const load: PageServerLoad = async ({ url, locals }) => {
  const user = locals.user;

  if (!user) {
    throw redirect(302, "/login");
  }

  const projectId = url.searchParams.get("projectId");
  const projects = await getUserProjects(user);

  let amianteQuery = db
    .select({
      id: tagsAmiante.id,
      label: tagsAmiante.label,
      description: tagsAmiante.description,
      etage: tagsAmiante.etage,
      type: tagsAmiante.type,
      image: tagsAmiante.image,
      customImage: tagsAmiante.customImage,
      presenceAmiante: tagsAmiante.presenceAmiante,
      projetId: tagsAmiante.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsAmiante)
    .leftJoin(projet, eq(tagsAmiante.sidId, projet.id));

  let plombQuery = db
    .select({
      id: tagsPlomb.id,
      label: tagsPlomb.label,
      description: tagsPlomb.description,
      etage: tagsPlomb.etage,
      image: tagsPlomb.image,
      customImage: tagsPlomb.customImage,
      projetId: tagsPlomb.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsPlomb)
    .leftJoin(projet, eq(tagsPlomb.sidId, projet.id));

  let termiteQuery = db
    .select({
      id: tagsTermite.id,
      label: tagsTermite.label,
      description: tagsTermite.description,
      etage: tagsTermite.etage,
      image: tagsTermite.image,
      customImage: tagsTermite.customImage,
      projetId: tagsTermite.sidId,
      projetNom: projet.libelle,
    })
    .from(tagsTermite)
    .leftJoin(projet, eq(tagsTermite.sidId, projet.id));

  const amianteConditions = [];
  const plombConditions = [];
  const termiteConditions = [];

  if (user.role !== "admin") {
    const allowedids = projects.map((p) => p.id);
    if (allowedids.length > 0) {
      amianteConditions.push(inArray(tagsAmiante.sidId, allowedids));
      plombConditions.push(inArray(tagsPlomb.sidId, allowedids));
      termiteConditions.push(inArray(tagsTermite.sidId, allowedids));
    } else {
      return {
        list: [],
        projects: [],
        selectedProjectId: projectId,
      };
    }
  }

  if (projectId) {
    amianteConditions.push(eq(tagsAmiante.sidId, projectId));
    plombConditions.push(eq(tagsPlomb.sidId, projectId));
    termiteConditions.push(eq(tagsTermite.sidId, projectId));
  }

  if (amianteConditions.length > 0) {
    amianteQuery.where(and(...amianteConditions));
  }

  if (plombConditions.length > 0) {
    plombQuery.where(and(...plombConditions));
  }

  if (termiteConditions.length > 0) {
    termiteQuery.where(and(...termiteConditions));
  }

  const [amianteList, plombList, termiteList] = await Promise.all([
    amianteQuery.all(),
    plombQuery.all(),
    termiteQuery.all(),
  ]);

  const list = await Promise.all(
    [
      ...amianteList.map((item) => ({
        ...item,
        riskType: "amiante" as const,
        riskLabel: "Amiante",
        uid: `amiante:${item.id}`,
      })),
      ...plombList.map((item) => ({
        ...item,
        type: "Plomb",
        riskType: "plomb" as const,
        riskLabel: "Plomb",
        uid: `plomb:${item.id}`,
      })),
      ...termiteList.map((item) => ({
        ...item,
        type: "Termites",
        riskType: "termites" as const,
        riskLabel: "Termites",
        uid: `termites:${item.id}`,
      })),
    ].map(async (item) => {
      const thumbnailUrl =
        (await getSignedImageUrl(item.customImage, ["png", "jpg", "jpeg", "webp"])) ??
        (await getSignedImageUrl(item.image, ["jpg", "jpeg", "png", "webp"]));

      return {
        ...item,
        thumbnailUrl,
      };
    }),
  );

  return {
    list,
    projects,
    selectedProjectId: projectId,
  };
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const user = locals.user;
    if (!user) {
      return fail(401, { message: "Non autorisé" });
    }

    const hasPermission = await auth.api.userHasPermission({
      body: {
        userId: user.id,
        permissions: { tags: ["delete"] },
      },
    });

    if (!hasPermission.success) {
      return fail(403, { message: "Permission refusée" });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const riskType = (formData.get("riskType") as string) || "amiante";

    if (!id) {
      return fail(400, { message: "ID requis" });
    }

    try {
      if (riskType === "plomb") {
        await db.delete(tagsPlomb).where(eq(tagsPlomb.id, id));
      } else if (riskType === "termites") {
        await db.delete(tagsTermite).where(eq(tagsTermite.id, id));
      } else {
        await db.delete(tagsAmiante).where(eq(tagsAmiante.id, id));
      }
      return { success: true };
    } catch (e: unknown) {
      console.error("Error deleting risk tag:", e);
      return fail(500, { message: "Erreur lors de la suppression" });
    }
  },
};
