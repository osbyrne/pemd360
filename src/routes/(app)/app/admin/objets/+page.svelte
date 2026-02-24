<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { Pencil, Trash2, Plus, X, Save, Search } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';

	let { data } = $props();

	let isModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);
	let isEditMode = $state(false);

	let currentObjet = $state<any>(null);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Derived
	const filteredList = $derived(
		(data.objets || []).filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return item.objet?.toLowerCase().includes(q) || item.categorieName?.toLowerCase().includes(q);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	// Form defaults
	let initialForm = {
		id: '',
		objet: '',
		categorieId: ''
	};

	let form = $state({ ...initialForm });

	function openCreateModal() {
		isEditMode = false;
		form = { ...initialForm };
		isModalOpen = true;
	}

	function openEditModal(objet: any) {
		isEditMode = true;
		form = {
			id: objet.id,
			objet: objet.objet,
			categorieId: objet.categorieId
		};
		isModalOpen = true;
	}

	function openDeleteModal(objet: any) {
		currentObjet = objet;
		isDeleteModalOpen = true;
	}

	function closeModal() {
		isModalOpen = false;
		currentObjet = null;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		currentObjet = null;
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
	<title>Admin · Objets</title>
</svelte:head>

< class="p-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Gestion des Objets</h1>
			<p class="text-sm text-gray-500 mt-1">
				Gérez la liste des objets et leurs catégories associées.
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
		<input type="search" bind:value={query} placeholder="Rechercher par objet ou catégorie..." />
	</label>
	<br/>
	<br/>

	<!-- Table -->
	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead
					class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
				>
					<tr>
						<th class="px-6 py-4 w-20">ID</th>
						<th class="px-6 py-4">Objet</th>
						<th class="px-6 py-4">Catégorie</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each displayedList as objet}
						<tr class="hover:bg-gray-50 transition-colors">
							<td class="px-6 py-4 font-mono text-gray-500">#{objet.id}</td>
							<td class="px-6 py-4 font-medium text-gray-900">{objet.objet}</td>
							<td class="px-6 py-4 text-gray-600">
								{#if objet.categorieName}
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
									>
										{objet.categorieName}
									</span>
								{:else}
									<span class="text-gray-400">-</span>
								{/if}
							</td>
							<td class="px-6 py-4">
								<div class="flex items-center justify-center gap-2">
									<button
										onclick={() => openEditModal(objet)}
										class="btn btn-ghost"
										title="Modifier"
									>
										<Pencil class="w-4 h-4" />
									</button>
									<button
										onclick={() => openDeleteModal(objet)}
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
									Aucun objet enregistré.
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
					{isEditMode ? "Modifier l'objet" : 'Nouvel objet'}
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
					id="objetForm"
					class="space-y-4"
				>
					{#if isEditMode}
						<input type="hidden" name="id" value={form.id} />
					{/if}

					<div>
						<label for="objet" class="block text-sm font-medium text-gray-700 mb-1">
							Nom de l'objet <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="objet"
							name="objet"
							bind:value={form.objet}
							required
							class="input"
							placeholder="Ex: Porte intérieure"
						/>
					</div>

					<div>
						<label for="categorieId" class="block text-sm font-medium text-gray-700 mb-1">
							Catégorie <span class="text-red-500">*</span>
						</label>
						<select
							id="categorieId"
							name="categorieId"
							bind:value={form.categorieId}
							required
							class="select"
						>
							<option value="">Sélectionner une catégorie</option>
							{#each data.categories as category}
								<option value={category.id}>{category.categoriev2}</option>
							{/each}
						</select>
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
				<button type="button" onclick={closeModal} class="btn"> Annuler </button>
				<button type="submit" form="objetForm" class="btn">
					<Save class="w-4 h-4" />
					{isEditMode ? 'Enregistrer' : 'Créer'}
				</button>
			</div>
		</div>
	</div>
{/if}

<DeleteConfirmModal
	isOpen={isDeleteModalOpen}
	itemLabel={currentObjet?.objet || ''}
	itemId={currentObjet?.id}
	onClose={closeDeleteModal}
/>
