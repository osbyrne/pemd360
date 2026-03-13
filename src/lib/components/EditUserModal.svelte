<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { Pencil } from 'lucide-svelte';

	type User = {
		id: string;
		email: string;
		name: string;
		role?: string;
	};

	export let user: User;

	const dispatch = createEventDispatcher<{
		updated: { userId: string; name: string; email: string; role: string };
		toast: { message: string; type: 'success' | 'error' };
	}>();

	let modal: HTMLDialogElement;
	let editForm = {
		name: '',
		email: '',
		role: 'user'
	};

	function openModal() {
		editForm.name = user.name || '';
		editForm.email = user.email || '';
		editForm.role = user.role || 'user';
		modal?.showModal();
	}

	function closeModal() {
		modal?.close();
	}

	async function saveUserInfo() {
		try {
			const res = await authClient.admin.setRole({
				userId: user.id,
				role: editForm.role as any
			});
			if (res.error) {
				dispatch('toast', {
					message: 'Echec de la mise a jour : ' + res.error.message,
					type: 'error'
				});
				return;
			}
			dispatch('updated', {
				userId: user.id,
				name: editForm.name,
				email: editForm.email,
				role: editForm.role
			});
			closeModal();
			dispatch('toast', { message: 'Utilisateur mis a jour avec succes', type: 'success' });
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Echec de la mise a jour';
			dispatch('toast', { message, type: 'error' });
		}
	}
</script>

<button on:click={openModal} class="btn btn-ghost" title="Modifier les informations">
	<Pencil size={18} />
</button>

<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<div class="flex items-center gap-3 mb-6">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
				<Pencil />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Modifier l'utilisateur</h3>
				<p class="text-sm">{user.email}</p>
			</div>
		</div>
		<div class="space-y-4">
			<div>
				<label for="edit-name-{user.id}" class="block text-sm font-medium mb-1.5">Nom</label>
				<input id="edit-name-{user.id}" bind:value={editForm.name} type="text" class="input" />
			</div>
			<div>
				<label for="edit-email-{user.id}" class="block text-sm font-medium mb-1.5">Email</label>
				<input id="edit-email-{user.id}" bind:value={editForm.email} type="email" class="input" />
			</div>
			<div>
				<label for="edit-role-{user.id}" class="block text-sm font-medium mb-1.5">Role</label>
				<select id="edit-role-{user.id}" bind:value={editForm.role} class="select">
					<option value="user">Utilisateur</option>
					<option value="collaborator">Collaborateur</option>
					<option value="admin">Administrateur</option>
				</select>
			</div>
		</div>
		<div class="modal-action">
			<button type="button" class="btn" on:click={closeModal}>Annuler</button>
			<button type="button" class="btn" on:click={saveUserInfo}>Enregistrer</button>
		</div>
	</div>
</dialog>
