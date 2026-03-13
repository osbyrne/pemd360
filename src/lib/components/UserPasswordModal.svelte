<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { KeyRound, Pencil } from 'lucide-svelte';

	type User = {
		id: string;
		name: string;
	};

	export let user: User;

	const dispatch = createEventDispatcher<{
		toast: { message: string; type: 'success' | 'error' };
	}>();

	let modal: HTMLDialogElement;
	let newPassword = '';

	function openModal() {
		newPassword = '';
		modal?.showModal();
	}

	function closeModal() {
		modal?.close();
	}

	async function setPassword() {
		try {
			const res = await authClient.admin.setUserPassword({
				userId: user.id,
				newPassword
			});
			if (res.error) {
				dispatch('toast', {
					message: 'Echec de la mise a jour du mot de passe : ' + res.error.message,
					type: 'error'
				});
				return;
			}
			closeModal();
			dispatch('toast', { message: 'Mot de passe mis a jour avec succes', type: 'success' });
		} catch {
			dispatch('toast', { message: 'Echec de la mise a jour du mot de passe', type: 'error' });
		}
	}
</script>

<button on:click={openModal} class="btn btn-ghost" title="Changer le mot de passe">
	<KeyRound size={18} />
</button>

<dialog bind:this={modal} class="modal">
	<div class="modal-box">
		<div class="flex items-center gap-3 mb-6">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
				<Pencil />
			</div>
			<div>
				<h3 class="text-lg font-semibold">Changer le mot de passe</h3>
				<p class="text-sm">{user.name}</p>
			</div>
		</div>
		<div>
			<label for="new-password-{user.id}" class="block text-sm font-medium mb-1.5"
				>Nouveau mot de passe</label
			>
			<input
				id="new-password-{user.id}"
				bind:value={newPassword}
				type="password"
				autocomplete="new-password"
				placeholder="Entrez le nouveau mot de passe"
				class="input"
			/>
			<p class="mt-2 text-xs">Le mot de passe doit contenir au moins 8 caracteres.</p>
		</div>
		<div class="modal-action">
			<button type="button" class="btn" on:click={closeModal}>Annuler</button>
			<button type="button" class="btn" on:click={setPassword}>Mettre a jour</button>
		</div>
	</div>
</dialog>
