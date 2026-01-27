<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { Pencil, Trash2, Plus, X, Save } from 'lucide-svelte';

	let { data } = $props();

	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isEditMode = $state(false);

	let currentGroupe = $state<any>(null);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Derived
	const filteredList = $derived(
		(data.groupes || []).filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return item.groupe?.toLowerCase().includes(q);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	// Form defaults
	let initialForm = {
		id: '',
		groupe: ''
	};

	let form = $state({ ...initialForm });

	function openCreateModal() {
		isEditMode = false;
		form = { ...initialForm };
		isModalOpen = true;
	}

	function openEditModal(groupe: any) {
		isEditMode = true;
		form = { ...groupe };
		isModalOpen = true;
	}

	function openDeleteModal(groupe: any) {
		currentGroupe = groupe;
		isDeleteModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		isDeleteModalOpen = false;
		currentGroupe = null;
	}

	function handleFormResult() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				closeModal();
				await update();
			}
		};
	}
</script>

<svelte:head>
	<title>Admin · Macro-catégories</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Gestion des Macro-catégories</h1>
			<p class="text-sm text-gray-500 mt-1">Gérez la liste des macro-catégories (Groupes).</p>
		</div>
		<button
			onclick={openCreateModal}
			class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
		>
			<Plus class="w-4 h-4" />
			Ajouter
		</button>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<input
				type="text"
				bind:value={query}
				placeholder="Rechercher par macro-catégorie..."
				class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
			/>
		</div>
	</div>

	<!-- Table -->
	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead
					class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
				>
					<tr>
						<th class="px-6 py-4 w-20">ID</th>
						<th class="px-6 py-4">Groupe</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each displayedList as groupe}
						<tr class="hover:bg-gray-50 transition-colors">
							<td class="px-6 py-4 font-mono text-gray-500">#{groupe.id}</td>
							<td class="px-6 py-4 font-medium text-gray-900">{groupe.groupe}</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-center gap-2">
									<button
										onclick={() => openEditModal(groupe)}
										class="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
										title="Modifier"
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										onclick={() => openDeleteModal(groupe)}
										class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										title="Supprimer"
									>
										<Trash2 class="w-4 h-4" />
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="3" class="px-6 py-12 text-center text-gray-400">
								{#if query}
									Aucun résultat pour "{query}".
								{:else}
									Aucune macro-catégorie enregistrée.
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if filteredList.length > 0}
			<div class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
				<p class="text-sm text-gray-600">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredList.length, (page - 1) * perPage + 1)}</span
					>
					à <span class="font-semibold">{Math.min(filteredList.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredList.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button
						onclick={() => (page = Math.max(1, page - 1))}
						disabled={page === 1}
						class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Précédent
					</button>
					<button
						onclick={() => (page = Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
						class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Suivant
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<!-- Create/Edit Modal -->
{#if isModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
			transition:fade
			onclick={closeModal}
		></div>
		<div
			class="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
			transition:scale={{ start: 0.95 }}
		>
			<!-- Modal Header -->
			<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
				<h2 class="text-lg font-semibold text-gray-900">
					{isEditMode ? 'Modifier la macro-catégorie' : 'Nouvelle macro-catégorie'}
				</h2>
				<button onclick={closeModal} class="text-gray-400 hover:text-gray-500 transition-colors">
					<X class="w-5 h-5" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="overflow-y-auto p-6">
				<form
					action={isEditMode ? '?/update' : '?/create'}
					method="POST"
					use:enhance={handleFormResult}
					id="groupeForm"
					class="space-y-4"
				>
					{#if isEditMode}
						<input type="hidden" name="id" value={form.id} />
					{/if}

					<div>
						<label for="groupe" class="block text-sm font-medium text-gray-700 mb-1">
							Nom du groupe <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="groupe"
							name="groupe"
							bind:value={form.groupe}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
							placeholder="Ex: Déchets inertes"
						/>
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
				<button
					type="button"
					onclick={closeModal}
					class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
				>
					Annuler
				</button>
				<button
					type="submit"
					form="groupeForm"
					class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
				>
					<Save class="w-4 h-4" />
					{isEditMode ? 'Enregistrer' : 'Créer'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if isDeleteModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
			transition:fade
			onclick={closeModal}
		></div>
		<div
			class="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-6"
			transition:scale={{ start: 0.95 }}
		>
			<div class="flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
					<Trash2 class="w-6 h-6 text-red-600" />
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
				<p class="text-sm text-gray-500 mb-6">
					Êtes-vous sûr de vouloir supprimer la macro-catégorie <span
						class="font-medium text-gray-900">"{currentGroupe?.groupe}"</span
					> ? Cette action est irréversible.
				</p>

				<form
					action="?/delete"
					method="POST"
					use:enhance={handleFormResult}
					class="w-full flex gap-3"
				>
					<input type="hidden" name="id" value={currentGroupe?.id} />
					<button
						type="button"
						onclick={closeModal}
						class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
					>
						Annuler
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
					>
						Supprimer
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
