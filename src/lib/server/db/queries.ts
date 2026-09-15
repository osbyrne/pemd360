import { eq, inArray, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

/** Pure query helper retained for non-workflow query composition. */
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
