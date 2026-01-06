<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';

	let { data }: { data: PageData } = $props();

	// State
	let etablissements = $derived(data.etablissements);
	let loading = $state(false);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Modals State
	let isDeleteModalOpen = $state(false);

	// Toast
	let toast: { message: string; type: 'success' | 'error' } | null = $state(null);

	// Active item
	let selectedEtab: (typeof etablissements)[0] | null = $state(null);

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Derived
	const filteredEtabs = $derived(
		etablissements.filter((e) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				e.nom?.toLowerCase().includes(q) ||
				e.ville?.toLowerCase().includes(q) ||
				e.siret?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredEtabs.length / perPage));
	const displayedEtabs = $derived(filteredEtabs.slice((page - 1) * perPage, page * perPage));

	// Actions
	function openDeleteModal(etab: (typeof etablissements)[0]) {
		selectedEtab = etab;
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		selectedEtab = null;
	}

	async function confirmDelete() {
		// TODO: Implémenter la suppression API
		showToast('Établissement supprimé avec succès');
		closeDeleteModal();
	}

	// CSV Export
	function downloadCSV() {
		if (!etablissements.length) return;
		const cols = ['id', 'nom', 'siret', 'email', 'rue', 'cp', 'ville'];
		const lines = [cols.join(',')];

		for (const e of filteredEtabs) {
			const row = [
				e.id,
				`"${(e.nom || '').replace(/"/g, '""')}"`,
				`"${(e.siret || '').replace(/"/g, '""')}"`,
				`"${(e.email || '').replace(/"/g, '""')}"`,
				`"${(e.rue || '').replace(/"/g, '""')}"`,
				e.cp || '',
				`"${(e.ville || '').replace(/"/g, '""')}"`
			];
			lines.push(row.join(','));
		}

		const csv = lines.join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'etablissements_export.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<svelte:head>
	<title>Admin · Établissements</title>
</svelte:head>

<main class="mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="sm:flex sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Gestion des établissements
				</h1>
				<p class="mt-2 text-sm text-slate-600">
					Gérez les établissements de votre organisation.
				</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<a
					href="/app/admin/etablissements/nouveau"
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M5 12h14" /><path d="M12 5v14" />
					</svg>
					Nouvel établissement
				</a>
				<button
					onclick={downloadCSV}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
					</svg>
					Exporter CSV
				</button>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<svg class="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
				</svg>
			</div>
			<input
				type="text"
				bind:value={query}
				placeholder="Rechercher par nom, ville ou SIRET..."
				class="block w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
			/>
		</div>
	</div>

	<!-- List -->
	<div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
		{#if loading}
			<div class="divide-y divide-slate-100">
				{#each Array(5) as _}
					<div class="flex items-center gap-4 p-4">
						<div class="h-12 w-12 animate-pulse rounded-full bg-slate-100"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-32 animate-pulse rounded bg-slate-100"></div>
							<div class="h-3 w-48 animate-pulse rounded bg-slate-100"></div>
						</div>
						<div class="h-6 w-16 animate-pulse rounded-full bg-slate-100"></div>
					</div>
				{/each}
			</div>
		{:else if displayedEtabs.length === 0}
			<div class="flex flex-col items-center justify-center px-4 py-16">
				<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-slate-300">
					<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
				</svg>
				<p class="font-medium text-slate-500">Aucun établissement trouvé</p>
				<p class="mt-1 text-sm text-slate-400">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each displayedEtabs as etab (etab.id)}
					<div class="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
						<!-- Avatar -->
						<div class="flex-shrink-0">
							<div class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white shadow">
								{etab.nom?.[0]?.toUpperCase() || '?'}
							</div>
						</div>

						<!-- Info -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate font-semibold text-slate-900">{etab.nom}</p>
							</div>
							<p class="truncate text-sm text-slate-500">{etab.email || "Pas d'email"}</p>
						</div>

						<!-- Location -->
						<div class="hidden w-32 sm:flex sm:flex-col sm:items-start">
							<p class="text-sm font-medium text-slate-900">{etab.ville || '-'}</p>
							<p class="text-xs text-slate-500">{etab.cp || '-'}</p>
						</div>

						<!-- SIRET -->
						<div class="mr-4 hidden w-36 md:flex md:flex-col md:items-end">
							<p class="text-xs text-slate-400">SIRET</p>
							<p class="font-mono text-sm font-medium text-slate-600">{etab.siret || '-'}</p>
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-1 border-l border-slate-200 pl-2">
							<a
								href="/app/admin/etablissements/{etab.id}"
								class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
								title="Voir les détails"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
								</svg>
							</a>

							<a
								href="/app/admin/etablissements/{etab.id}/modifier"
								class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
								title="Modifier"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" />
								</svg>
							</a>

							<button
								onclick={() => openDeleteModal(etab)}
								class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
								title="Supprimer"
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if !loading && filteredEtabs.length > 0}
			<div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
				<p class="text-sm text-slate-600">
					Affichage de <span class="font-semibold">{Math.min(filteredEtabs.length, (page - 1) * perPage + 1)}</span>
					à <span class="font-semibold">{Math.min(filteredEtabs.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredEtabs.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button
						onclick={() => (page = Math.max(1, page - 1))}
						disabled={page === 1}
						class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m15 18-6-6 6-6" />
						</svg>
						Précédent
					</button>
					<button
						onclick={() => (page = Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
						class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Suivant
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<path d="m9 18 6-6-6-6" />
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedEtab}
	<div class="relative z-50" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" transition:fade></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
					transition:scale
				>
					<div class="px-6 py-5">
						<div class="mb-6 flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
									<path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" />
								</svg>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-slate-900">Supprimer l'établissement</h3>
								<p class="text-sm text-slate-500">{selectedEtab.nom}</p>
							</div>
						</div>
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<p class="text-sm text-red-800">
								<strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
								à cet établissement seront définitivement supprimées.
							</p>
						</div>
					</div>
					<div class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
						<button
							type="button"
							class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
							onclick={closeDeleteModal}
						>
							Annuler
						</button>
						<button
							type="button"
							class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
							onclick={confirmDelete}
						>
							Supprimer définitivement
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- TOAST NOTIFICATION -->
{#if toast}
	<div class="fixed bottom-4 right-4 z-50" transition:scale={{ duration: 200 }}>
		<div class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg {toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'} text-white">
			{#if toast.type === 'success'}
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
				</svg>
			{/if}
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
