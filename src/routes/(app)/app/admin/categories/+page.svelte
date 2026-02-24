<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { Pencil, Trash2, Search, Plus, X, Save } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';

	let { data } = $props();

	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isEditMode = $state(false);

	let currentCategory = $state<any>(null);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Derived
	const filteredList = $derived(
		(data.categories || []).filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				item.categorie?.toLowerCase().includes(q) || item.groupeName?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	// Form defaults
	let initialForm = {
		id: '',
		categorie: '',
		groupeId: ''
	};

	let form = $state({ ...initialForm });

	function openCreateModal() {
		isEditMode = false;
		form = { ...initialForm };
		isModalOpen = true;
	}

	function openEditModal(category: any) {
		isEditMode = true;
		form = {
			id: category.id,
			categorie: category.categorie,
			groupeId: category.groupeId
		};
		isModalOpen = true;
	}

	function openDeleteModal(category: any) {
		currentCategory = category;
		isDeleteModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		currentCategory = null;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		currentCategory = null;
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
	<title>Admin · Catégories</title>
</svelte:head>

<!-- Header -->
<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
	<div>
		<h1 class="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
		<p class="text-sm text-gray-500 mt-1">
			Gérez la liste des catégories et leurs groupes associés.
		</p>
	</div>
	<button onclick={openCreateModal} class="btn">
		<Plus class="w-4 h-4" />
		Ajouter
	</button>
</div>

<!-- Search Bar -->
<label class="mb-6 input relative">
	<Search />
	<input type="search" bind:value={query} placeholder="Rechercher par catégorie ou groupe..." />
</label>
<br />
<br />

<!-- Table -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
	<div class="overflow-x-auto">
		<table class="w-full text-left text-sm text-gray-600">
			<thead
				class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
			>
				<tr>
					<th class="px-6 py-4 w-20">ID</th>
					<th class="px-6 py-4">Catégorie</th>
					<th class="px-6 py-4">Groupe</th>
					<th class="px-6 py-4 text-center w-32">Actions</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each displayedList as category}
					<tr class="hover:bg-gray-50 transition-colors">
						<td class="px-6 py-4 font-mono text-gray-500">#{category.id}</td>
						<td class="px-6 py-4 font-medium text-gray-900">{category.categorie}</td>
						<td class="px-6 py-4 text-gray-600">
							{#if category.groupeName}
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
								>
									{category.groupeName}
								</span>
							{:else}
								<span class="text-gray-400">-</span>
							{/if}
						</td>
						<td class="px-6 py-4">
							<div class="flex items-center justify-center gap-2">
								<button
									onclick={() => openEditModal(category)}
									class="btn btn-ghost"
									title="Modifier"
								>
									<Pencil class="w-4 h-4" />
								</button>
								<button
									onclick={() => openDeleteModal(category)}
									class="btn btn-ghost btn-warning"
									title="Supprimer"
								>
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="px-6 py-12 text-center text-gray-400">
							{#if query}
								Aucun résultat pour "{query}".
							{:else}
								Aucune catégorie enregistrée.
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<Pagination
		{page}
		{totalPages}
		totalItems={filteredList.length}
		{perPage}
		onPageChange={(p) => (page = p)}
	/>
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
			role="button"
			tabindex="-1"
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
		></div>
		<div
			class="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
			transition:scale={{ start: 0.95 }}
		>
			<!-- Modal Header -->
			<div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
				<h2 class="text-lg font-semibold text-gray-900">
					{isEditMode ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
					id="categoryForm"
					class="space-y-4"
				>
					{#if isEditMode}
						<input type="hidden" name="id" value={form.id} />
					{/if}

					<div>
						<label for="categorie" class="block text-sm font-medium text-gray-700 mb-1">
							Nom de la catégorie <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="categorie"
							name="categorie"
							bind:value={form.categorie}
							required
							class="input"
							placeholder="Ex: Béton"
						/>
					</div>

					<div>
						<label for="groupeId" class="block text-sm font-medium text-gray-700 mb-1">
							Groupe <span class="text-red-500">*</span>
						</label>
						<select
							id="groupeId"
							name="groupeId"
							bind:value={form.groupeId}
							required
							class="select"
						>
							<option value="">Sélectionner un groupe</option>
							{#each data.groupes as groupe}
								<option value={groupe.id}>{groupe.groupe}</option>
							{/each}
						</select>
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
				<button type="button" onclick={closeModal} class="btn"> Annuler </button>
				<button type="submit" form="categoryForm" class="btn">
					<Save class="w-4 h-4" />
					{isEditMode ? 'Enregistrer' : 'Créer'}
				</button>
			</div>
		</div>
	</div>
{/if}

<DeleteConfirmModal
	isOpen={isDeleteModalOpen}
	itemLabel={currentCategory?.categorie || ''}
	itemId={currentCategory?.id}
	onClose={closeDeleteModal}
/>
