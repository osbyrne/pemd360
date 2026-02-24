<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import { Trash2, Download, Search } from 'lucide-svelte';
	import PemdTabs from '$lib/components/PemdTabs.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import ProjectFilter from '$lib/components/ProjectFilter.svelte';

	let { data } = $props();

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	let isDeleteModalOpen = $state(false);
	let currentItem = $state<any>(null);

	// Derived
	const filteredList = $derived(
		(data?.list || []).filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				item.groupe?.toLowerCase().includes(q) ||
				item.categorie?.toLowerCase().includes(q) ||
				item.objet?.toLowerCase().includes(q) ||
				item.description?.toLowerCase().includes(q) ||
				item.nature?.toLowerCase().includes(q) ||
				item.etat?.toLowerCase().includes(q) ||
				item.constitution?.toLowerCase().includes(q) ||
				item.etage?.toLowerCase().includes(q) ||
				item.typologieAppart?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	function openDeleteModal(item: any) {
		currentItem = item;
		isDeleteModalOpen = true;
	}

	function closeModal() {
		isDeleteModalOpen = false;
		currentItem = null;
	}
</script>

<svelte:head>
	<title>Admin · PEMD - Tableau Général</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<PemdTabs />

	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Inventaire PEMD - Tableau Général</h1>
			<p class="text-sm text-gray-500 mt-1">
				Vue d'ensemble de l'inventaire Produits, Équipements, Matériaux et Déchets par projet.
			</p>
		</div>
		<a href="pemd-tableau/export{$pageStore.url.search}" class="btn">
			<Download />
			Exporter en Excel
		</a>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-col sm:flex-row gap-4">
		<ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
		<label class="mb-6 input relative">
			<Search />
			<input
				type="search"
				bind:value={query}
				placeholder="Rechercher par macro-catégorie, catégorie, objet ou projet..."
			/>
		</label>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead
					class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
				>
					<tr>
						<th class="px-6 py-4">Groupe</th>
						<th class="px-6 py-4">Catégorie</th>
						<th class="px-6 py-4">PEMD</th>
						<th class="px-6 py-4">Estimation d'âge</th>
						<th class="px-6 py-4">Quantité</th>
						<th class="px-6 py-4">Description</th>
						<th class="px-6 py-4">État</th>
						<th class="px-6 py-4">Nature</th>
						<th class="px-6 py-4">Surface (m²)</th>
						<th class="px-6 py-4">Épaisseur (m)</th>
						<th class="px-6 py-4">Densité</th>
						<th class="px-6 py-4">Masse (kg)</th>
						<th class="px-6 py-4">Constitution</th>
						<th class="px-6 py-4">Miniature</th>
						<th class="px-6 py-4">Étage</th>
						<th class="px-6 py-4">Typologie</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if displayedList.length === 0}
						<tr>
							<td colspan="17" class="px-6 py-12 text-center text-gray-400">
								{#if query}
									Aucun résultat pour "{query}".
								{:else}
									Aucun élément PEMD enregistré.
								{/if}
							</td>
						</tr>
					{:else}
						{#each displayedList as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900">{item.groupe || '-'}</td>
								<td class="px-6 py-4">{item.categorie || '-'}</td>
								<td class="px-6 py-4">{item.objet || '-'}</td>
								<td class="px-6 py-4">{item.estimationAge || '-'}</td>
								<td class="px-6 py-4">{item.quantite || '-'}</td>
								<td class="px-6 py-4">{item.description || '-'}</td>
								<td class="px-6 py-4">{item.etat || '-'}</td>
								<td class="px-6 py-4">{item.nature || '-'}</td>
								<td class="px-6 py-4">{item.surface || '-'}</td>
								<td class="px-6 py-4">{item.epaisseur || '-'}</td>
								<td class="px-6 py-4">{item.densite || '-'}</td>
								<td class="px-6 py-4">{item.masse || '-'}</td>
								<td class="px-6 py-4">{item.constitution || '-'}</td>
								<td class="px-6 py-4">
									{#if item.image}
										<img
											src={item.image}
											alt="Miniature"
											class="h-12 w-12 object-cover rounded shadow-sm bg-white"
										/>
									{:else}
										<span class="text-xs text-gray-400">N/A</span>
									{/if}
								</td>
								<td class="px-6 py-4">{item.etage || '-'}</td>
								<td class="px-6 py-4">{item.typologieAppart || '-'}</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-center gap-2">
										<button
											onclick={() => openDeleteModal(item)}
											class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Supprimer"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
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

<DeleteConfirmModal
	isOpen={isDeleteModalOpen}
	itemLabel={currentItem?.objet || currentItem?.description || ''}
	itemId={currentItem?.id}
	onClose={closeModal}
/>
