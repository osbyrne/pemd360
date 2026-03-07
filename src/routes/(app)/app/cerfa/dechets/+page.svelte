<script lang="ts">
	import CerfaTabs from '$lib/components/CerfaTabs.svelte';
	import { Search, X, Download } from 'lucide-svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Get projetId from URL params
	const projetId = $derived($page.url.searchParams.get('projetId') || '');

	// Search functionality
	let searchTerm = $state('');
	let filterByValorisation = $state<string>('all'); // all, valorisable, non-valorisable

	// Pagination state
	let currentPage = $state(1);
	let itemsPerPage = 10;

	// Calculate statistics
	const stats = $derived({
		total: data.dechets.length,
		totalMasse: data.dechets.reduce((sum, d) => sum + (d.masse || 0), 0),
		totalVolume: data.dechets.reduce((sum, d) => sum + (d.volume || 0), 0)
	});

	// Filter dechets based on search and filters
	const filteredDechets = $derived(
		data.dechets.filter((dechet) => {
			// Search filter
			if (searchTerm) {
				const search = searchTerm.toLowerCase();
				const matchesSearch =
					dechet.categorie?.toLowerCase().includes(search) ||
					dechet.objet?.toLowerCase().includes(search) ||
					dechet.nature?.toLowerCase().includes(search) ||
					dechet.codeDechet?.toString().includes(search);
				if (!matchesSearch) return false;
			}

			// Valorisation filter
			if (filterByValorisation === 'valorisable') {
				return (
					dechet.recyclable === 1 ||
					dechet.reutilisation === 1 ||
					dechet.valorisationMatiere === 1 ||
					dechet.valorisationEnergetique === 1
				);
			} else if (filterByValorisation === 'non-valorisable') {
				return dechet.nonValorisation === 1;
			}

			return true;
		})
	);

	// Pagination logic
	const totalPages = $derived(Math.ceil(filteredDechets.length / itemsPerPage));
	const paginatedDechets = $derived(
		filteredDechets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
	);

	// Reset pagination when filters change
	$effect(() => {
		// Just acknowledging the dependency
		searchTerm;
		filterByValorisation;
		currentPage = 1;
	});

	// Format number with proper decimals
	function formatNumber(value: number | null | undefined): string {
		if (value === null || value === undefined) return '-';
		return value.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
	}

	// Format large number with units
	function formatLargeNumber(value: number): string {
		if (value >= 1000000) {
			return (value / 1000000).toFixed(2) + ' M';
		} else if (value >= 1000) {
			return (value / 1000).toFixed(2) + ' K';
		}
		return value.toFixed(2);
	}

	// Helper for table checks
	function isChecked(value: number | null | undefined): boolean {
		return value === 1;
	}
</script>

<svelte:head>
	<title>CERFA · Caractérisation des Déchets</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<CerfaTabs />

	<!-- Header Section -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold">Caractérisation des déchets</h1>
			{#if data.projetInfo}
				<p class="text-sm mt-1">
					Projet: <span class="font-medium">{data.projetInfo.libelle}</span>
					(Réf: {data.projetInfo.reference})
				</p>
			{/if}
		</div>
		<a href="dechets/export?projetId={projetId}" class="btn">
			<Download />
			Exporter en Excel
		</a>
	</div>

	<!-- Statistics Summary (Simplified) -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
		<div class="card bg-base-100 w-96 shadow-sm">
			<div class="card-body">
				<p class="">Total déchets</p>
				<p class="text-xl font-bold">{stats.total}</p>
			</div>
		</div>
		<div class="card bg-base-100 w-96 shadow-sm">
			<div class="card-body">
				<p class="">Masse totale</p>
				<p class="text-xl font-bold">
					{formatLargeNumber(stats.totalMasse)}
					<span class="text-sm font-normal">kg</span>
				</p>
			</div>
		</div>
		<div class="card bg-base-100 w-96 shadow-sm">
			<div class="card-body">
				<p class="">Volume total</p>
				<p class="text-xl font-bold">
					{formatLargeNumber(stats.totalVolume)}
					<span class="text-sm font-normal">m³</span>
				</p>
			</div>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="flex flex-col sm:flex-row gap-4">
		<!-- Search -->
		<label class="mb-6 input relative">
			<Search />
			<input type="search" bind:value={searchTerm} placeholder="Rechercher..." />
		</label>

		<!-- Filter by valorisation -->
		<div class="w-full sm:w-64">
			<select bind:value={filterByValorisation} class="select">
				<option value="all">Tous les déchets</option>
				<option value="valorisable">Valorisables</option>
				<option value="non-valorisable">Non valorisables</option>
			</select>
		</div>

		{#if searchTerm || filterByValorisation !== 'all'}
			<button
				onclick={() => {
					searchTerm = '';
					filterByValorisation = 'all';
				}}
				class="px-3 py-2 text-sm hover: border border-gray-300 rounded-md hover: transition-colors"
			>
				<X class="w-4 h-4 inline mr-1" />
				Reset
			</button>
		{/if}
	</div>

	<!-- Tableau des déchets (Simple & Clean) -->
	<div class="border border-gray-200 shadow-sm rounded-lg overflow-hidden flex flex-col">
		<div class="overflow-x-auto">
			<table class="w-full text-sm text-left">
				<thead class=" border-b border-gray-200">
					<tr>
						<th class="px-4 py-3 font-semibold whitespace-nowrap min-w-75">Catégorie / Nature</th>
						<th class="px-4 py-3 font-semibold whitespace-nowrap">Code</th>
						<th class="px-4 py-3 font-semibold text-right whitespace-nowrap">Masse (Kg)</th>
						<th class="px-4 py-3 font-semibold text-right whitespace-nowrap">Vol (m³)</th>
						<th
							class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs border-l border-gray-200"
						>
							Diag.<br />filières?
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Réutili-<br />sation
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Recy-<br />clable
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Remblay-<br />age
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Incin.<br />avec valo.
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Incin.<br />sans valo.
						</th>
						<th class="px-2 py-3 font-semibold text-center whitespace-nowrap text-xs">
							Enfouiss-<br />ment
						</th>
						<th class="px-4 py-3 font-semibold text-left whitespace-nowrap border-l border-gray-200"
							>Conditions / Notes</th
						>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each paginatedDechets as dechet, i (i)}
						<tr class="hover: transition-colors">
							<td class="px-4 py-3 align-top">
								<div class="font-medium">{dechet.categorie || '-'}</div>
								{#if dechet.objet && dechet.objet !== dechet.categorie}
									<div class="text-xs mt-0.5">{dechet.objet}</div>
								{/if}
								{#if dechet.nature && dechet.nature !== dechet.objet}
									<div class="text-xs italic mt-0.5">{dechet.nature}</div>
								{/if}
							</td>
							<td class="px-4 py-3 align-top font-mono text-xs">
								{dechet.codeDechet || '-'}
							</td>
							<td class="px-4 py-3 align-top text-right font-medium">
								{formatNumber(dechet.masse)}
							</td>
							<td class="px-4 py-3 align-top text-right">
								{formatNumber(dechet.volume)}
							</td>

							<!-- Checklist columns -->
							<td class="px-2 py-3 align-top text-center border-l border-gray-100">
								{dechet.ecoOrganisme ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.reutilisation) ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.recyclable) ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.valorisationMatiere) ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.valorisationEnergetique) ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.incinerationSansValo) ? '☑' : '☐'}
							</td>
							<td class="px-2 py-3 align-top text-center">
								{isChecked(dechet.nonValorisation) ? '☑' : '☐'}
							</td>
							<!-- End checklist columns -->

							<td class="px-4 py-3 align-top text-xs border-l border-gray-100">
								<div
									class="max-w-37.5 truncate"
									title={dechet.stockage || dechet.description || ''}
								>
									{dechet.stockage || dechet.description || '-'}
								</div>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="12" class="px-6 py-12 text-center"> Aucun résultat. </td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination Controls -->
		{#if filteredDechets.length > 0 && totalPages > 1}
			<div class="flex items-center justify-between border-t border-gray-200 px-4 py-3">
				<p class="text-sm">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredDechets.length, (currentPage - 1) * itemsPerPage + 1)}</span
					>
					à
					<span class="font-semibold"
						>{Math.min(filteredDechets.length, currentPage * itemsPerPage)}</span
					>
					sur <span class="font-semibold">{filteredDechets.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button
						onclick={() => (currentPage = Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
						class="btn"
					>
						Précédent
					</button>
					<button
						onclick={() => (currentPage = Math.min(totalPages, currentPage + 1))}
						disabled={currentPage === totalPages}
						class="btn"
					>
						Suivant
					</button>
				</div>
			</div>
		{/if}
	</div>

	<div class="mt-4 text-xs flex gap-4">
		<span>Légende :</span>
		<span>☑ = Oui / Applicable</span>
		<span>☐ = Non / Non applicable</span>
	</div>
</div>
