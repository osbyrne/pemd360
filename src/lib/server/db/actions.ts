import { db } from './client';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { SQLiteTable, SQLiteColumn } from 'drizzle-orm/sqlite-core';

/**
 * Creates a generic delete action for a table.
 * @param table - The Drizzle table to delete from
 * @param idColumn - The ID column of the table
 * @param entityName - Name of the entity for error messages (e.g., 'category', 'nature')
 * @param idType - Type of ID field: 'number' or 'string' (default: 'number')
 */
export function createDeleteAction<T extends SQLiteTable>(
	table: T,
	idColumn: SQLiteColumn,
	entityName: string,
	idType: 'number' | 'string' = 'number'
) {
	return async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const rawId = formData.get('id');
		const id = idType === 'number' ? Number(rawId) : (rawId as string);

		// Validate ID is present and valid
		if (!id || id === '' || (idType === 'number' && isNaN(id as number))) {
			return fail(400, { message: 'ID requis' });
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
export function getFormValue(formData: FormData, key: string, type: 'string'): string | null;
export function getFormValue(formData: FormData, key: string, type: 'number'): number | null;
export function getFormValue(formData: FormData, key: string, type: 'boolean'): boolean;
export function getFormValue(
	formData: FormData,
	key: string,
	type: 'string' | 'number' | 'boolean'
): string | number | boolean | null {
	const value = formData.get(key);
	if (value === null || value === '') {
		return type === 'boolean' ? false : null;
	}

	switch (type) {
		case 'string':
			return value as string;
		case 'number':
			const num = Number(value);
			return isNaN(num) ? null : num;
		case 'boolean':
			return value === 'true' || value === '1' || value === 'on';
		default:
			return null;
	}
}

/**
 * Field type definitions for extractFormFields
 */
export type FieldType = 'string' | 'number' | 'boolean' | 'date';

export type FieldDefinition = {
	name: string;
	type: FieldType;
	defaultValue?: string | number | boolean | Date | null;
};

/**
 * Extracts multiple form fields at once based on a schema definition.
 * Reduces boilerplate when extracting many form fields.
 *
 * @param formData - The FormData object
 * @param fields - Array of field definitions
 * @returns Object with extracted values keyed by field name
 *
 * @example
 * const data = extractFormFields(formData, [
 *   { name: 'nom', type: 'string', defaultValue: '' },
 *   { name: 'age', type: 'number' },
 *   { name: 'active', type: 'boolean', defaultValue: false }
 * ]);
 * // Returns: { nom: 'John', age: 25, active: true }
 */
export function extractFormFields(
	formData: FormData,
	fields: FieldDefinition[]
): Record<string, string | number | boolean | Date | null> {
	const result: Record<string, string | number | boolean | Date | null> = {};

	for (const field of fields) {
		const value = formData.get(field.name);

		if (value === null || value === '') {
			result[field.name] = field.defaultValue ?? null;
			continue;
		}

		switch (field.type) {
			case 'string':
				result[field.name] = value as string;
				break;
			case 'number':
				const num = Number(value);
				result[field.name] = isNaN(num) ? (field.defaultValue ?? null) : num;
				break;
			case 'boolean':
				result[field.name] = value === 'true' || value === '1' || value === 'on';
				break;
			case 'date':
				result[field.name] = value ? new Date(value as string) : (field.defaultValue ?? null);
				break;
			default:
				result[field.name] = field.defaultValue ?? null;
		}
	}

	return result;
}

/**
 * Options for createCrudActions factory
 */
export type CrudActionsOptions<T extends SQLiteTable> = {
	table: T;
	idColumn: SQLiteColumn;
	nameColumn: SQLiteColumn;
	entityName: string;
	idType?: 'number' | 'string';
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
	const { table, idColumn, nameColumn, entityName, idType = 'number', formFieldName = 'name' } = options;

	return {
		create: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const name = getFormValue(formData, formFieldName, 'string');

			if (!name) {
				return fail(400, { message: 'Le nom est requis' });
			}

			try {
				await db.insert(table).values({ [nameColumn.name]: name } as Record<string, unknown>);
				return { success: true };
			} catch (e: unknown) {
				console.error(`Error creating ${entityName}:`, e);
				return fail(500, { message: `Erreur lors de la création de ${entityName}` });
			}
		},

		update: async ({ request }: { request: Request }) => {
			const formData = await request.formData();
			const rawId = formData.get('id');
			const id = idType === 'number' ? Number(rawId) : (rawId as string);
			const name = getFormValue(formData, formFieldName, 'string');

			if (!id || id === '' || (idType === 'number' && isNaN(id as number))) {
				return fail(400, { message: 'ID requis' });
			}

			if (!name) {
				return fail(400, { message: 'Le nom est requis' });
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

		delete: createDeleteAction(table, idColumn, entityName, idType)
	};
}
