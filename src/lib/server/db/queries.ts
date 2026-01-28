import { db } from './client';
import { projet, userProjet } from './schema';
import { eq } from 'drizzle-orm';

type User = {
	id: string;
	role?: string | null;
};

/**
 * Get projects accessible by a user.
 * Admins get all projects, other users get only projects linked to them via userProjet.
 */
export async function getUserProjects(user: User) {
	if (user.role === 'admin') {
		return await db
			.select({
				id: projet.id,
				libelle: projet.libelle
			})
			.from(projet);
	}

	return await db
		.select({
			id: projet.id,
			libelle: projet.libelle
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
	if (user.role === 'admin') {
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
