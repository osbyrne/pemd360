<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Folder, Search } from 'lucide-svelte';

	type User = {
		id: string;
		name: string;
	};

	type Projet = {
		id: string;
		libelle: string;
		reference: string;
	};

	export let user: User;
	export let projets: Projet[] = [];
	export let initialProjetIds: string[] = [];

	const dispatch = createEventDispatcher<{
		saved: { userId: string; projetIds: string[] };
		toast: { message: string; type: 'success' | 'error' };
	}>();

	let modal: HTMLDialogElement;
	let modalProjectSearch = '';
	let projetIds: string[] = [];

	$: filteredModalProjets = projets.filter((p) => {
		if (!modalProjectSearch) return true;
		const search = modalProjectSearch.toLowerCase();
		return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
	});

	function openModal() {
		projetIds = [...initialProjetIds];
		modalProjectSearch = '';
		modal?.showModal();
	}

	function closeModal() {
		modal?.close();
	}
</script>

<button on:click={openModal} class="btn btn-ghost" title="Gérer les projets">
	<Folder size={18} />
</button>

<dialog bind:this={modal} class="modal">
	<div class="modal-box max-w-lg">
		<form
			method="POST"
			action="?/setProjets"
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						await invalidateAll();
						dispatch('saved', { userId: user.id, projetIds });
						closeModal();
						dispatch('toast', { message: 'Projets mis a jour avec succes', type: 'success' });
					} else {
						dispatch('toast', { message: 'Echec de la mise a jour', type: 'error' });
					}
				};
			}}
		>
			<input type="hidden" name="userId" value={user.id} />
			<div class="flex items-center gap-3 mb-6">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
					<Folder />
				</div>
				<div>
					<h3 class="text-lg font-semibold">Gerer les projets</h3>
					<p class="text-sm">{user.name}</p>
				</div>
			</div>
			<div>
				<div class="block text-sm font-medium mb-1.5">Projets assignes</div>
				<label class="input">
					<Search />
					<input
						type="search"
						bind:value={modalProjectSearch}
						placeholder="Rechercher un projet..."
					/>
				</label>

				<div class="max-h-64 overflow-y-auto rounded-lg">
					{#if projets.length === 0}
						<p class="p-4 text-sm text-center">Aucun projet disponible</p>
					{:else if filteredModalProjets.length === 0}
						<p class="p-4 text-sm text-center">Aucun projet trouve</p>
					{:else}
						{#each filteredModalProjets as p, i (i)}
							<label class="flex items-center gap-3 p-3 hover: cursor-pointer">
								<input
									type="checkbox"
									name="projetIds"
									value={p.id}
									checked={projetIds.includes(p.id)}
									on:change={(e) => {
										if (e.currentTarget.checked) {
											projetIds = [...projetIds, p.id];
										} else {
											projetIds = projetIds.filter((id) => id !== p.id);
										}
									}}
									class="checkbox"
								/>
								<div class="flex-1 min-w-0">
									<p class="text-sm font-medium truncate">{p.libelle}</p>
									<p class="text-xs truncate">Ref: {p.reference}</p>
								</div>
							</label>
						{/each}
					{/if}
				</div>
				<p class="mt-2 text-xs">
					{projetIds.length} projet{projetIds.length > 1 ? 's' : ''} selectionne{projetIds.length >
					1
						? 's'
						: ''}
				</p>
			</div>
			<div class="modal-action">
				<button type="button" class="btn" on:click={closeModal}>Annuler</button>
				<button type="submit" class="btn">Enregistrer</button>
			</div>
		</form>
	</div>
</dialog>
