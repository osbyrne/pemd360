import { db } from "./client";
import { eq } from "drizzle-orm";
import { fail } from "@sveltejs/kit";
import type { SQLiteTable, SQLiteColumn } from "drizzle-orm/sqlite-core";
import { auth } from "$lib/auth";

/**
 * Permission configuration for actions requiring authorization.
 */
export type PermissionConfig = {
  /** The resource to check permission for (e.g., 'tags', 'projet') */
  resource: string;
  /** The action to check permission for (e.g., 'delete', 'create') */
  action: string;
};

/**
 * Creates a generic delete action for a table.
 * @param table - The Drizzle table to delete from
 * @param idColumn - The ID column of the table
 * @param entityName - Name of the entity for error messages (e.g., 'category', 'nature')
 * @param idType - Type of ID field: 'number' or 'string' (default: 'number')
 * @param permission - Optional permission check configuration
 */
export function createDeleteAction<T extends SQLiteTable>(
  table: T,
  idColumn: SQLiteColumn,
  entityName: string,
  idType: "number" | "string" = "number",
  permission?: PermissionConfig,
) {
  return async ({ request, locals }: { request: Request; locals: App.Locals }) => {
    const user = locals.user;

    // Check authentication
    if (!user) {
      return fail(401, { message: "Non autorisé" });
    }

    // Check permission if specified
    if (permission) {
      const hasPermission = await auth.api.userHasPermission({
        body: {
          userId: user.id,
          permissions: { [permission.resource]: [permission.action] },
        },
      });

      if (!hasPermission.success) {
        return fail(403, { message: "Permission refusée" });
      }
    }

    const formData = await request.formData();
    const rawId = formData.get("id");
    const id = idType === "number" ? Number(rawId) : (rawId as string);

    // Validate ID is present and valid
    if (!id || id === "" || (idType === "number" && isNaN(id as number))) {
      return fail(400, { message: "ID requis" });
    }

    try {
      await db.delete(table).where(eq(idColumn, id));
      return { success: true };
    } catch (e: unknown) {
      console.error(`Error deleting ${entityName}:`, e);
      return fail(500, { message: `Erreur lors de la suppression` });
    }
  };
}

/**
 * Helper to extract form data as typed values.
 */
export function getFormValue(formData: FormData, key: string, type: "string"): string | null;
export function getFormValue(formData: FormData, key: string, type: "number"): number | null;
export function getFormValue(formData: FormData, key: string, type: "boolean"): boolean;
export function getFormValue(
  formData: FormData,
  key: string,
  type: "string" | "number" | "boolean",
): string | number | boolean | null {
  const value = formData.get(key);
  if (value === null || value === "") {
    return type === "boolean" ? false : null;
  }

  switch (type) {
    case "string":
      return value as string;
    case "number":
      const num = Number(value);
      return isNaN(num) ? null : num;
    case "boolean":
      return value === "true" || value === "1" || value === "on";
    default:
      return null;
  }
}

/**
 * Options for createCrudActions factory
 */
export type CrudActionsOptions<T extends SQLiteTable> = {
  table: T;
  idColumn: SQLiteColumn;
  nameColumn: SQLiteColumn;
  entityName: string;
  idType?: "number" | "string";
  /** Form field name for the name field (default: 'name') */
  formFieldName?: string;
};

/**
 * Creates standard CRUD actions (create, update, delete) for simple entity tables.
 * Useful for tables with just id + name fields like categories, nature, objets, macro_categories.
 *
 * @param options - Configuration options
 * @returns Object with create, update, and delete action handlers
 *
 * @example
 * export const actions = createCrudActions({
 *   table: groupe,
 *   idColumn: groupe.id,
 *   nameColumn: groupe.groupe,
 *   entityName: 'groupe',
 *   formFieldName: 'groupe'  // matches form input name
 * });
 */
export function createCrudActions<T extends SQLiteTable>(options: CrudActionsOptions<T>) {
  const {
    table,
    idColumn,
    nameColumn,
    entityName,
    idType = "number",
    formFieldName = "name",
  } = options;

  return {
    create: async ({ request }: { request: Request }) => {
      const formData = await request.formData();
      const name = getFormValue(formData, formFieldName, "string");

      if (!name) {
        return fail(400, { message: "Le nom est requis" });
      }

      try {
        await db.insert(table).values({ [nameColumn.name]: name } as any);
        return { success: true };
      } catch (e: unknown) {
        console.error(`Error creating ${entityName}:`, e);
        return fail(500, { message: `Erreur lors de la création de ${entityName}` });
      }
    },

    update: async ({ request }: { request: Request }) => {
      const formData = await request.formData();
      const rawId = formData.get("id");
      const id = idType === "number" ? Number(rawId) : (rawId as string);
      const name = getFormValue(formData, formFieldName, "string");

      if (!id || id === "" || (idType === "number" && isNaN(id as number))) {
        return fail(400, { message: "ID requis" });
      }

      if (!name) {
        return fail(400, { message: "Le nom est requis" });
      }

      try {
        await db
          .update(table)
          .set({ [nameColumn.name]: name } as Record<string, unknown>)
          .where(eq(idColumn, id));
        return { success: true };
      } catch (e: unknown) {
        console.error(`Error updating ${entityName}:`, e);
        return fail(500, { message: `Erreur lors de la mise à jour de ${entityName}` });
      }
    },

    delete: createDeleteAction(table, idColumn, entityName, idType),
  };
}
