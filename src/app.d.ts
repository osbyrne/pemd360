// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/client" />

import type { Session, User } from 'better-auth';

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
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
