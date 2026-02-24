<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import { Trash2, Download, Scale, Search } from 'lucide-svelte';
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
				item.nature?.toLowerCase().includes(q) ||
				item.codeDechet?.toString().toLowerCase().includes(q) ||
				item.ecoOrganismeRep?.toLowerCase().includes(q) ||
				item.stockage?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	const totalMass = $derived(
		filteredList.reduce((sum: number, item: any) => sum + (Number(item.masse) || 0), 0)
	);

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
	<title>Admin · PEMD - Déchets</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<PemdTabs />

	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Inventaire PEMD - Déchets</h1>
			<p class="text-sm text-gray-500 mt-1">Classification et traitement des déchets par projet.</p>
		</div>
		<a href="pemd-dechets/export{$pageStore.url.search}" class="btn">
			<Download />
			Exporter en Excel
		</a>
	</div>

	<!-- Filters & Stats -->
	<div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
		<ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
		<label class="mb-6 input relative">
			<Search />
			<input
				type="search"
				bind:value={query}
				placeholder="Rechercher par nature, code déchet, éco-organisme..."
			/>
		</label>
		/>

		<!-- Total Mass Card -->
		<div
			class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3 w-full md:w-auto hover:bg-emerald-100 transition-colors whitespace-nowrap lg:h-[46px]"
		>
			<div class="p-1.5 bg-emerald-100 rounded-lg">
				<Scale class="w-5 h-5 text-emerald-600" />
			</div>
			<div class="flex flex-col md:flex-row md:items-baseline md:gap-2">
				<span class="text-xs font-semibold uppercase tracking-wider text-emerald-600/80"
					>Masse Totale</span
				>
				<span class="text-lg font-bold"
					>{totalMass.toLocaleString('fr-FR', {
						minimumFractionDigits: 3,
						maximumFractionDigits: 3
					})} t</span
				>
			</div>
		</div>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead
					class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200"
				>
					<tr>
						<th class="px-6 py-4">Nature</th>
						<th class="px-6 py-4">Code déchet</th>
						<th class="px-6 py-4">Masse</th>
						<th class="px-6 py-4">Réutilisation sur site</th>
						<th class="px-6 py-4">Recyclable</th>
						<th class="px-6 py-4">Remblayage</th>
						<th class="px-6 py-4">Incinération valorisation énergétique</th>
						<th class="px-6 py-4">Non valorisation à enfouir</th>
						<th class="px-6 py-4">Incinération sans valorisation énergétique</th>
						<th class="px-6 py-4">Eco-organisme REP</th>
						<th class="px-6 py-4">Stockage</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if displayedList.length === 0}
						<tr>
							<td colspan="12" class="px-6 py-12 text-center text-gray-400">
								{#if query}
									Aucun résultat pour "{query}".
								{:else}
									Aucun déchet PEMD enregistré.
								{/if}
							</td>
						</tr>
					{:else}
						{#each displayedList as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900">{item.nature || '-'}</td>
								<td class="px-6 py-4">{item.codeDechet || '-'}</td>
								<td class="px-6 py-4">{item.masse || '-'}</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.reutilisation
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.reutilisation ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.recyclable
											? 'bg-blue-100 text-blue-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.recyclable ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.valorisationMatiere
											? 'bg-emerald-100 text-emerald-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.valorisationMatiere ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.valorisationEnergetique
											? 'bg-orange-100 text-orange-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.valorisationEnergetique ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.nonValorisation
											? 'bg-red-100 text-red-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.nonValorisation ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.incinerationSansValorisationEnergetique
											? 'bg-purple-100 text-purple-800'
											: 'bg-gray-100 text-gray-600'}"
									>
										{item.incinerationSansValorisationEnergetique ? 'Oui' : 'Non'}
									</span>
								</td>
								<td class="px-6 py-4">{item.ecoOrganismeRep || '-'}</td>
								<td class="px-6 py-4">{item.stockage || '-'}</td>
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
	itemLabel={currentItem?.nature || currentItem?.codeDechet || ''}
	itemId={currentItem?.id}
	onClose={closeModal}
/>
