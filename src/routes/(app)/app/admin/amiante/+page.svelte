<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import { Trash2, Download } from 'lucide-svelte';
	import RiskTabs from '$lib/components/RiskTabs.svelte';
	import DeleteConfirmModal from '$lib/components/DeleteConfirmModal.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
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
		data.list.filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				item.label?.toLowerCase().includes(q) ||
				item.description?.toLowerCase().includes(q) ||
				item.projetNom?.toLowerCase().includes(q)
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
	<title>Admin · Amiante</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<RiskTabs />
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Inventaire Amiante</h1>
			<p class="text-sm text-gray-500 mt-1">Liste des tags amiante détectés.</p>
		</div>
		<a
			href="amiante/export{$pageStore.url.search}"
			class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
		>
			<Download class="w-4 h-4" />
			Exporter en Excel
		</a>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-col sm:flex-row gap-4">
		<ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
		<SearchInput bind:value={query} placeholder="Rechercher par label, description ou projet..." />
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead
					class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
				>
					<tr>
						<th class="px-6 py-4">Nom du prélèvement</th>
						<th class="px-6 py-4">Description</th>
						<th class="px-6 py-4">Localisation</th>
						<th class="px-6 py-4">Type</th>
						<th class="px-6 py-4">Miniature</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if displayedList.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-gray-400">
								{#if query}
									Aucun résultat pour "{query}".
								{:else}
									Aucun tag amiante enregistré.
								{/if}
							</td>
						</tr>
					{:else}
						{#each displayedList as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900">
									{item.label}
								</td>
								<td class="px-6 py-4">
									{item.description || '-'}
								</td>
								<td class="px-6 py-4">
									{item.etage || '-'}
								</td>
								<td class="px-6 py-4">
									{item.type || '-'}
								</td>
								<td class="px-6 py-4">
									{#if item.customImage}
										<img
											src={item.customImage}
											alt={item.label}
											class="h-12 w-12 object-cover rounded shadow-sm bg-white"
										/>
									{:else}
										<span class="text-xs text-gray-400">N/A</span>
									{/if}
								</td>
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
	itemLabel={currentItem?.label || ''}
	itemId={currentItem?.id}
	onClose={closeModal}
/>
