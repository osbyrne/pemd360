<script lang="ts">
	import { Info, Search, MapPin, Calendar, Building2, ChevronRight, Box } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();

	let mounted = $state(false);
	let searchQuery = $state('');
	let viewMode = $state<'grid' | 'list'>('list');
	let sortBy = $state<'date' | 'name' | 'ville'>('date');
	let sortOrder = $state<'asc' | 'desc'>('desc');
	let openCerfaMenu = $state<string | null>(null);

	onMount(() => {
		mounted = true;
	});

	function formatDate(date: Date | number): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	let filteredProjets = $derived(
		data.projets
			.filter((p) => {
				if (!searchQuery) return true;
				const q = searchQuery.toLowerCase();
				return (
					p.libelle.toLowerCase().includes(q) ||
					p.reference.toLowerCase().includes(q) ||
					p.ville.toLowerCase().includes(q)
				);
			})
			.sort((a, b) => {
				let comparison = 0;
				if (sortBy === 'date') {
					comparison = new Date(a.dateDemarrage).getTime() - new Date(b.dateDemarrage).getTime();
				} else if (sortBy === 'name') {
					comparison = a.libelle.localeCompare(b.libelle);
				} else if (sortBy === 'ville') {
					comparison = a.ville.localeCompare(b.ville);
				}
				return sortOrder === 'asc' ? comparison : -comparison;
			})
	);

	function toggleSort(field: 'date' | 'name' | 'ville') {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'desc';
		}
	}
</script>

<svelte:head>
	<title>Projets</title>
</svelte:head>

<div class="min-h-screen">
	{#if mounted}
		<!-- Search & Filters Bar -->
		<div class="max-w-7xl mx-auto px-4 mt-6 sm:px-6 lg:px-8 relative z-10">
			<div class="bg-white rounded-2xl border border-slate-200 p-4">
				<div class="flex flex-col sm:flex-row gap-4">
					<!-- Search -->
					<label class="input relative flex-1">
						<Search />
						<input
							type="search"
							bind:value={searchQuery}
							placeholder="Rechercher un projet par nom, référence ou ville..."
						/>
					</label>
					<br />

					<!-- View Toggle & Sort -->
					<div class="flex items-center gap-2">
						<!-- Sort Buttons -->
						<div class="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100">
							<button
								onclick={() => toggleSort('date')}
								class="px-3 py-2 rounded-lg text-xs font-medium transition-colors {sortBy === 'date'
									? 'bg-white text-emerald-600'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								Date
							</button>
							<button
								onclick={() => toggleSort('name')}
								class="px-3 py-2 rounded-lg text-xs font-medium transition-colors {sortBy === 'name'
									? 'bg-white text-emerald-600'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								Nom
							</button>
							<button
								onclick={() => toggleSort('ville')}
								class="px-3 py-2 rounded-lg text-xs font-medium transition-colors {sortBy ===
								'ville'
									? 'bg-white text-emerald-600'
									: 'text-slate-600 hover:text-slate-900'}"
							>
								Ville
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Projects Content -->
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{#if filteredProjets.length === 0}
				<!-- Empty State -->
				<div
					class="flex flex-col items-center justify-center py-20 text-center"
					in:fade={{ duration: 300 }}
				>
					<h3 class="text-xl font-semibold text-slate-900 mb-2">
						{searchQuery ? 'Aucun résultat' : 'Aucun projet disponible'}
					</h3>
					<p class="text-slate-500 max-w-md">
						{searchQuery
							? `Aucun projet ne correspond à "${searchQuery}". Essayez une autre recherche.`
							: "Vous n'avez pas encore de projets assignés. Contactez votre administrateur."}
					</p>
				</div>
			{:else if viewMode === 'list'}
				<!-- List View -->
				<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
					<div class="divide-y divide-slate-100">
						{#each filteredProjets as projet, i (projet.id)}
							<div
								class="group flex items-center gap-6 p-5 hover:bg-slate-50/50 transition-colors"
								in:fly={{ x: -20, duration: 300, delay: 300 + i * 30 }}
								animate:flip={{ duration: 300 }}
							>
								<!-- Info -->
								<div class="flex-1 min-w-0">
									<h3 class="font-semibold text-slate-900 truncate mb-1">
										{projet.libelle}
									</h3>
									<div class="flex flex-wrap items-center gap-4 text-sm text-slate-500">
										<span class="font-mono">{projet.reference}</span>
										{#if projet.societeNom}
											<span class="flex items-center gap-1 text-emerald-700 font-medium">
												<Building2 class="h-3.5 w-3.5" />
												{projet.societeNom}
											</span>
										{/if}
										<span class="flex items-center gap-1">
											<MapPin class="h-3.5 w-3.5" />
											{projet.ville}
										</span>
										<span class="hidden md:flex items-center gap-1">
											<Calendar class="h-3.5 w-3.5" />
											{formatDate(projet.dateDemarrage)}
										</span>
									</div>
								</div>

								<!-- Actions -->
								<div class="flex items-center gap-2">
									<a href="/app/details/{projet.id}" class="btn btn-ghost" title="Voir les détails">
										<Info class="h-5 w-5" />
									</a>
									<a href="/app/projets/{projet.id}" class="btn btn-ghost">
										<Box class="h-4 w-4" />
										<span class="hidden sm:inline">Modèle 3D</span>
										<ChevronRight class="h-4 w-4" />
									</a>
									<details class="dropdown">
										<summary class="btn btn-ghost">Cerfa</summary>
										<ul
											class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
										>
											<li>
												<a href="/app/cerfa/informations?projetId={projet.id}">Informations</a>
											</li>
											<li>
												<a href="/app/cerfa/pem?projetId={projet.id}">Caractérisation PEM</a>
											</li>
											<li>
												<a href="/app/cerfa/dechets?projetId={projet.id}">Caractérisation Déchets</a
												>
											</li>
										</ul>
									</details>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Results count -->
			{#if filteredProjets.length > 0 && searchQuery}
				<p class="mt-6 text-center text-sm text-slate-500" in:fade>
					{filteredProjets.length} résultat{filteredProjets.length > 1 ? 's' : ''} pour "{searchQuery}"
				</p>
			{/if}
		</div>
	{/if}
</div>
