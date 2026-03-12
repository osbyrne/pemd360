<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import {
		Plus,
		Download,
		Search,
		Building2,
		Eye,
		Pencil,
		Trash2,
		LoaderCircle
	} from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// State
	let etablissements = $derived(data.etablissements);
	let loading = $state(false);
	let deleteLoading = $state(false);

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

	// Réagir aux changements du form (résultats des actions)
	$effect(() => {
		if (form?.message) {
			showToast(form.message, form.success ? 'success' : 'error');
		}
	});

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
		deleteLoading = false;
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
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Gestion des établissements</h1>
				<p class="mt-2 text-sm">Gérez les établissements de votre organisation.</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<a href="/app/admin/etablissements/nouveau" class="btn">
					<Plus size={18} />
					Nouvel établissement
				</a>
				<button onclick={downloadCSV} class="btn">
					<Download size={16} />
					Exporter CSV
				</button>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<label class="mb-6 input relative">
		<Search />
		<input type="search" bind:value={query} placeholder="Rechercher par nom, ville ou SIRET..." />
	</label>
	<br />
	<br />

	<!-- List -->
	<div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
		{#if loading}
			<div class="divide-y divide-slate-100">
				{#each Array(5) as _}
					<div class="flex items-center gap-4 p-4">
						<div class="h-12 w-12 animate-pulse rounded-full"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-32 animate-pulse rounded"></div>
							<div class="h-3 w-48 animate-pulse rounded"></div>
						</div>
						<div class="h-6 w-16 animate-pulse rounded-full"></div>
					</div>
				{/each}
			</div>
		{:else if displayedEtabs.length === 0}
			<div class="flex flex-col items-center justify-center px-4 py-16">
				<Building2 size={48} strokeWidth={1.5} class="mb-4 " />
				<p class="font-medium">Aucun établissement trouvé</p>
				<p class="mt-1 text-sm">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each displayedEtabs as etab (etab.id)}
					<div class="flex items-center gap-4 p-4 transition-colors hover:">
						<!-- Info -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate font-semibold">{etab.nom}</p>
							</div>
							<p class="truncate text-sm">{etab.email || "Pas d'email"}</p>
						</div>

						<!-- Location -->
						<div class="hidden w-32 sm:flex sm:flex-col sm:items-start">
							<p class="text-sm font-medium">{etab.ville || '-'}</p>
							<p class="text-xs">{etab.cp || '-'}</p>
						</div>

						<!-- SIRET -->
						<div class="mr-4 hidden w-36 md:flex md:flex-col md:items-end">
							<p class="text-xs">SIRET</p>
							<p class="font-mono text-sm font-medium">{etab.siret || '-'}</p>
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-1 border-l border-slate-200 pl-2">
							<a
								href="/app/admin/etablissements/{etab.id}"
								class="rounded-lg p-2 transition-colors hover: hover:text-emerald-600"
								title="Voir les détails"
							>
								<Eye size={18} />
							</a>

							<a
								href="/app/admin/etablissements/{etab.id}/modifier"
								class="rounded-lg p-2 transition-colors hover: hover:text-blue-600"
								title="Modifier"
							>
								<Pencil size={18} />
							</a>

							<button
								onclick={() => openDeleteModal(etab)}
								class="rounded-lg p-2 transition-colors hover:bg-red-50 hover:text-red-600"
								title="Supprimer"
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if !loading}
			<Pagination
				{page}
				{totalPages}
				totalItems={filteredEtabs.length}
				{perPage}
				onPageChange={(p) => (page = p)}
			/>
		{/if}
	</div>
</main>

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedEtab}
	<div class="relative z-50" role="dialog" aria-modal="true">
		<div class="fixed inset-0 /60 backdrop-blur-sm transition-opacity" transition:fade></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative w-full max-w-md transform overflow-hidden rounded-2xl shadow-2xl transition-all"
					transition:scale
				>
					<div class="px-6 py-5">
						<div class="mb-6 flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
								<Trash2 size={20} class="text-red-600" />
							</div>
							<div>
								<h3 class="text-lg font-semibold">Supprimer l'établissement</h3>
								<p class="text-sm">{selectedEtab.nom}</p>
							</div>
						</div>
						<div class="rounded-lg border border-red-200 bg-red-50 p-4">
							<p class="text-sm text-red-800">
								<strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
								à cet établissement seront définitivement supprimées.
							</p>
						</div>
					</div>
					<div class="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
						<button type="button" class="btn" onclick={closeDeleteModal} disabled={deleteLoading}>
							Annuler
						</button>
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								deleteLoading = true;
								return async ({ result, update }) => {
									if (result.type === 'success') {
										closeDeleteModal();
										showToast('Établissement supprimé avec succès', 'success');
									} else if (result.type === 'failure') {
										const errorMessage =
											(result.data as { message?: string })?.message ||
											'Erreur lors de la suppression';
										showToast(errorMessage, 'error');
										deleteLoading = false;
									}
									await update();
								};
							}}
						>
							<input type="hidden" name="id" value={selectedEtab.id} />
							<button type="submit" class="btn btn-warning" disabled={deleteLoading}>
								{#if deleteLoading}
									<span class="flex items-center gap-2">
										<LoaderCircle class="h-4 w-4 animate-spin" />
										Suppression...
									</span>
								{:else}
									Supprimer définitivement
								{/if}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if toast}
	<div class="toast">
		<div class="alert alert-info">
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
