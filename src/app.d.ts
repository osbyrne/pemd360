// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/client" />

import type { Session, User } from 'better-auth';
import type { InferSelectModel } from 'drizzle-orm';
import type { tagsAmiante } from '$lib/server/db/schema';
import type { PlombTag } from '$lib/server/db/schema';
import type { TermiteTag } from '$lib/server/db/schema';
import type { Pemd } from '$lib/server/db/schema';
import type { CategorieV2 } from '$lib/server/db/schema';
import type { groupe } from '$lib/server/db/schema';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: (User & { role?: string | null }) | null;
			session: Session | null;
		}
		interface Tag {
			id: string | number;
			sidId: string | number;
			objetId: number | null;
			description: string | null;
			quantite: number | null;
			etage: string | null;
			etat: string | null;
			anchorPosition: string;
			stemVector: string;
		}
		interface TagResponse {
			success: boolean;
			tag: Tag;
		}
		export type TagsAmiante = InferSelectModel<typeof tagsAmiante>;
		export type PlombTags = InferSelectModel<typeof PlombTag>;
		export type TermiteTags = InferSelectModel<typeof TermiteTag>;
		export type Pemds = InferSelectModel<typeof Pemd>;
		export type CategoriesV2 = InferSelectModel<typeof CategorieV2>;
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
