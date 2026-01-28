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
