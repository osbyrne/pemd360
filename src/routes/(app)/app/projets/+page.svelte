<script lang="ts">
	import {
		Info,
		Search,
		MapPin,
		Calendar,
		Building2,
		Grid3x3,
		List,
		ChevronRight,
		Box,
		FileText,
		ChevronDown
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

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

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function getRelativeTime(date: Date): string {
		const now = new Date();
		const d = new Date(date);
		const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Aujourd'hui";
		if (diffDays === 1) return 'Hier';
		if (diffDays < 7) return `Il y a ${diffDays} jours`;
		if (diffDays < 30)
			return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
		if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
		return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
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

	function toggleCerfaMenu(projetId: string) {
		openCerfaMenu = openCerfaMenu === projetId ? null : projetId;
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
					<div class="relative flex-1">
						<Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Rechercher un projet par nom, référence ou ville..."
							class="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
						/>
					</div>

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

						<!-- View Toggle -->
						<div class="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
							<button
								onclick={() => (viewMode = 'grid')}
								class="p-2 rounded-lg transition-colors {viewMode === 'grid'
									? 'bg-white text-emerald-600'
									: 'text-slate-500 hover:text-slate-700'}"
							>
								<Grid3x3 class="h-5 w-5" />
							</button>
							<button
								onclick={() => (viewMode = 'list')}
								class="p-2 rounded-lg transition-colors {viewMode === 'list'
									? 'bg-white text-emerald-600'
									: 'text-slate-500 hover:text-slate-700'}"
							>
								<List class="h-5 w-5" />
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
					<div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
						<Building2 class="h-10 w-10 text-slate-400" />
					</div>
					<h3 class="text-xl font-semibold text-slate-900 mb-2">
						{searchQuery ? 'Aucun résultat' : 'Aucun projet disponible'}
					</h3>
					<p class="text-slate-500 max-w-md">
						{searchQuery
							? `Aucun projet ne correspond à "${searchQuery}". Essayez une autre recherche.`
							: "Vous n'avez pas encore de projets assignés. Contactez votre administrateur."}
					</p>
					{#if searchQuery}
						<button
							onclick={() => (searchQuery = '')}
							class="mt-4 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
						>
							Effacer la recherche
						</button>
					{/if}
				</div>
			{:else if viewMode === 'grid'}
				<!-- Grid View -->
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each filteredProjets as projet, i (projet.id)}
						<div
							class="group bg-white rounded-2xl border border-slate-200 overflow-hidden"
							in:fly={{ y: 30, duration: 400, delay: 300 + i * 50 }}
							animate:flip={{ duration: 300 }}
						>
							<!-- Card Header -->
							<div class="p-6 pb-4">
								<div class="flex items-start gap-4">
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold text-slate-900 text-lg truncate">
											{projet.libelle}
										</h3>
										<p class="text-slate-500 text-sm font-mono mt-0.5">{projet.reference}</p>
									</div>
								</div>
							</div>

							<!-- Card Body -->
							<div class="px-6 pb-4 space-y-2">
								{#if projet.societeNom}
									<div class="flex items-center gap-2 text-sm text-emerald-700 font-medium">
										<Building2 class="h-4 w-4 text-emerald-600 shrink-0" />
										<span class="truncate">{projet.societeNom}</span>
									</div>
								{/if}
								<div class="flex items-center gap-2 text-sm text-slate-600">
									<MapPin class="h-4 w-4 text-slate-400 shrink-0" />
									<span class="truncate">{projet.ville} ({projet.cp})</span>
								</div>
								<div class="flex items-center gap-2 text-sm text-slate-600">
									<Calendar class="h-4 w-4 text-slate-400 shrink-0" />
									<span>{formatDate(projet.dateDemarrage)}</span>
								</div>
							</div>

							<!-- Card Footer -->
							<div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
								<a
									href="/app/details/{projet.id}"
									class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
								>
									<Info class="h-4 w-4" />
									Détails
								</a>
								<a
									href="/app/projets/{projet.id}"
									class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
								>
									<Box class="h-4 w-4" />
									Modèle 3D
								</a>
								<div class="relative flex-1">
									<button
										onclick={() => toggleCerfaMenu(projet.id)}
										class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 border border-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
									>
										<FileText class="h-4 w-4" />
										Cerfa
										<ChevronDown class="h-4 w-4" />
									</button>
									{#if openCerfaMenu === projet.id}
										<div
											class="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-10"
											transition:slide={{ duration: 200 }}
										>
											<a
												href="/app/cerfa/informations?projetId={projet.id}"
												class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
											>
												Informations
											</a>
											<a
												href="/app/cerfa/pem?projetId={projet.id}"
												class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-slate-100"
											>
												Caractérisation PEM
											</a>
											<a
												href="/app/cerfa/dechets?projetId={projet.id}"
												class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-slate-100"
											>
												Caractérisation Déchets
											</a>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
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
									<a
										href="/app/details/{projet.id}"
										class="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
										title="Voir les détails"
									>
										<Info class="h-5 w-5" />
									</a>
									<a
										href="/app/projets/{projet.id}"
										class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
									>
										<Box class="h-4 w-4" />
										<span class="hidden sm:inline">Modèle 3D</span>
										<ChevronRight class="h-4 w-4" />
									</a>
									<div class="relative">
										<button
											onclick={() => toggleCerfaMenu(projet.id)}
									    	class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
										>
											<FileText class="h-4 w-4" />
											<span class="hidden sm:inline">Cerfa</span>
											<ChevronDown class="h-4 w-4" />
										</button>
										{#if openCerfaMenu === projet.id}
											<div
												class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-10"
												transition:slide={{ duration: 200 }}
											>
												<a
													href="/app/cerfa/informations?projetId={projet.id}"
													class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
												>
													Informations
												</a>
												<a
													href="/app/cerfa/pem?projetId={projet.id}"
													class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-slate-100"
												>
													Caractérisation PEM
												</a>
												<a
													href="/app/cerfa/dechets?projetId={projet.id}"
													class="block px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-t border-slate-100"
												>
													Caractérisation Déchets
												</a>
											</div>
										{/if}
									</div>
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
