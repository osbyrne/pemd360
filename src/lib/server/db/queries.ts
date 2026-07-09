import { db } from "./client";
import { projet, userProjet } from "./schema";
import { eq, inArray, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

type User = {
  id: string;
  role?: string | null;
};

/**
 * Get projects accessible by a user.
 * Admins get all projects, other users get only projects linked to them via userProjet.
 */
export async function getUserProjects(user: User) {
  if (user.role === "admin") {
    return await db
      .select({
        id: projet.id,
        libelle: projet.libelle,
      })
      .from(projet);
  }

  return await db
    .select({
      id: projet.id,
      libelle: projet.libelle,
    })
    .from(projet)
    .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
    .where(eq(userProjet.userId, user.id));
}

/**
 * Get list of allowed project IDs for a user.
 * Useful for filtering data in export routes.
 */
export async function getAllowedProjectIds(user: User): Promise<string[]> {
  if (user.role === "admin") {
    const allProjects = await db.select({ id: projet.id }).from(projet);
    return allProjects.map((p) => p.id);
  }

  const userProjects = await db
    .select({ id: projet.id })
    .from(projet)
    .innerJoin(userProjet, eq(projet.id, userProjet.projetId))
    .where(eq(userProjet.userId, user.id));

  return userProjects.map((p) => p.id);
}

/**
 * Result of export authorization check
 */
export type ExportAuthResult =
  | { authorized: true; allowedProjectIds: string[]; projectId: string | null }
  | { authorized: false; error: Response };

/**
 * Validates user authorization for export endpoints.
 * Checks if user is authenticated and has access to the requested project(s).
 *
 * @param user - The user from locals
 * @param projectId - Optional project ID filter from URL params
 * @returns Authorization result with either allowed project IDs or an error Response
 */
export async function validateExportAuth(
  user: User | null | undefined,
  projectId: string | null,
): Promise<ExportAuthResult> {
  if (!user) {
    return {
      authorized: false,
      error: new Response("Unauthorized", { status: 401 }),
    };
  }

  const allowedProjectIds = await getAllowedProjectIds(user);

  if (allowedProjectIds.length === 0) {
    return {
      authorized: false,
      error: new Response("No access to any project", { status: 403 }),
    };
  }

  if (projectId && !allowedProjectIds.includes(projectId)) {
    return {
      authorized: false,
      error: new Response("Unauthorized for this project", { status: 403 }),
    };
  }

  return {
    authorized: true,
    allowedProjectIds,
    projectId,
  };
}

/**
 * Builds project filter conditions for export queries.
 * Use this after validateExportAuth() passes.
 *
 * @param sidIdColumn - The sidId column from the table
 * @param allowedProjectIds - List of allowed project IDs
 * @param projectId - Optional specific project ID filter
 * @returns Array of SQL conditions to use in .where()
 */
export function buildProjectConditions(
  sidIdColumn: SQLiteColumn,
  allowedProjectIds: string[],
  projectId: string | null,
): SQL[] {
  const conditions: SQL[] = [];

  if (projectId) {
    conditions.push(eq(sidIdColumn, projectId));
  } else {
    conditions.push(inArray(sidIdColumn, allowedProjectIds));
  }

  return conditions;
}
