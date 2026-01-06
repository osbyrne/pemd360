import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db/client';
import { societe, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  // Charger toutes les sociétés pour le dropdown
  const societes = await db.select().from(societe);
  
  // Charger les utilisateurs avec leur société
  const usersWithSociete = await db.select({
    id: user.id,
    societeId: user.societeId,
  }).from(user);

  return {
    societes,
    usersWithSociete
  };
};

export const actions: Actions = {
  setSociete: async ({ request }) => {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const societeId = formData.get('societeId') as string;

    if (!userId) {
      return fail(400, { error: 'userId requis' });
    }

    try {
      await db.update(user)
        .set({ societeId: societeId ? parseInt(societeId) : null })
        .where(eq(user.id, userId));

      return { success: true };
    } catch (e) {
      console.error('Erreur mise à jour société:', e);
      return fail(500, { error: 'Erreur lors de la mise à jour' });
    }
  }
};
