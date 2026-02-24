<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Plus,
		Download,
		Search,
		ChartNoAxesCombined,
		MoreHorizontal,
		Eye,
		Pencil,
		Trash2,
		CircleCheck,
		CircleX
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// State
	let projets = $derived(data.projets);
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
	let selectedProjet: (typeof projets)[0] | null = $state(null);

	// Dropdown menu state
	let openDropdownId: string | null = $state(null);

	function toggleDropdown(projetId: string) {
		openDropdownId = openDropdownId === projetId ? null : projetId;
	}

	function closeDropdown() {
		openDropdownId = null;
	}

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Derived
	const filteredProjets = $derived(
		projets.filter((p) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				p.id?.toLowerCase().includes(q) ||
				p.libelle?.toLowerCase().includes(q) ||
				p.reference?.toLowerCase().includes(q) ||
				p.ville?.toLowerCase().includes(q) ||
				p.etablissementNom?.toLowerCase().includes(q) ||
				p.societeNom?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredProjets.length / perPage));
	const displayedProjets = $derived(filteredProjets.slice((page - 1) * perPage, page * perPage));

	// Actions
	function openDeleteModal(proj: (typeof projets)[0]) {
		selectedProjet = proj;
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		selectedProjet = null;
	}

	function formatDate(date: Date | number | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('fr-FR');
	}

	// CSV Export
	function downloadCSV() {
		if (!projets.length) return;
		const cols = [
			'id',
			'reference',
			'libelle',
			'ville',
			'etablissement',
			'societe',
			'date_demarrage'
		];
		const lines = [cols.join(',')];

		for (const p of filteredProjets) {
			const row = [
				`"${(p.id || '').replace(/"/g, '""')}"`,
				`"${(p.reference || '').replace(/"/g, '""')}"`,
				`"${(p.libelle || '').replace(/"/g, '""')}"`,
				`"${(p.ville || '').replace(/"/g, '""')}"`,
				`"${(p.etablissementNom || '').replace(/"/g, '""')}"`,
				`"${(p.societeNom || '').replace(/"/g, '""')}"`,
				p.dateDemarrage ? formatDate(p.dateDemarrage) : ''
			];
			lines.push(row.join(','));
		}

		const csv = lines.join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'projets_export.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<svelte:head>
	<title>Admin · Projets</title>
</svelte:head>

<main class="mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="sm:flex sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Gestion des projets
				</h1>
				<p class="mt-2 text-sm text-slate-600">Gérez tous les projets de la plateforme.</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<a href="/app/admin/projets/nouveau" class="btn">
					<Plus size={18} />
					Nouveau projet
				</a>
				<button onclick={downloadCSV} class="btn">
					<Download size={16} />
					Export CSV
				</button>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<label class="mb-6 input relative">
		<Search />
		<input
			type="search"
			bind:value={query}
			placeholder="Rechercher par ID Matterport, référence, libellé, ville, établissement..."
		/>
	</label>
	<br />
	<br />

	<!-- Table -->
	<div class="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
		{#if displayedProjets.length === 0}
			<div class="flex flex-col items-center justify-center py-16 px-4">
				<ChartNoAxesCombined size={48} strokeWidth={1.5} class="text-slate-300 mb-4" />
				<p class="text-slate-500 font-medium">Aucun projet trouvé</p>
				<p class="text-sm text-slate-400 mt-1">
					Créez un nouveau projet ou modifiez vos critères de recherche
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-slate-50 border-b border-slate-200">
						<tr>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>ID Matterport</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Référence</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Libellé</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Ville</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Établissement</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Société</th
							>
							<th
								class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Démarrage</th
							>
							<th
								class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
								>Actions</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each displayedProjets as proj (proj.id)}
							<tr class="hover:bg-slate-50 transition-colors">
								<td class="px-6 py-4">
									<span class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded"
										>{proj.id}</span
									>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm font-medium text-slate-900">{proj.reference}</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-slate-700">{proj.libelle}</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-slate-600">{proj.ville}</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-slate-600">{proj.etablissementNom || '-'}</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
									>
										{proj.societeNom || '-'}
									</span>
								</td>
								<td class="px-6 py-4">
									<span class="text-sm text-slate-600">{formatDate(proj.dateDemarrage)}</span>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-end">
										<div class="relative">
											<button
												onclick={() => toggleDropdown(proj.id)}
												class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
												title="Actions"
											>
												<MoreHorizontal size={18} />
											</button>
											{#if openDropdownId === proj.id}
												<div
													class="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10"
													transition:scale={{ duration: 100 }}
												>
													<div class="py-1">
														<a
															href="/app/admin/projets/{proj.id}"
															class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
															onclick={closeDropdown}
														>
															<Eye size={16} />
															Voir
														</a>
														<a
															href="/app/admin/projets/{proj.id}/modifier"
															class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
															onclick={closeDropdown}
														>
															<Pencil size={16} />
															Modifier
														</a>
														<button
															onclick={() => {
																openDeleteModal(proj);
																closeDropdown();
															}}
															class="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
														>
															<Trash2 size={16} />
															Supprimer
														</button>
													</div>
												</div>
											{/if}
										</div>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Pagination -->
		{#if filteredProjets.length > 0}
			<div
				class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3"
			>
				<p class="text-sm text-slate-600">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredProjets.length, (page - 1) * perPage + 1)}</span
					>
					à <span class="font-semibold">{Math.min(filteredProjets.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredProjets.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button onclick={() => (page = Math.max(1, page - 1))} disabled={page === 1} class="btn">
						Précédent
					</button>
					<button
						onclick={() => (page = Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
						class="btn"
					>
						Suivant
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedProjet}
	<div class="relative z-50" role="dialog" aria-modal="true">
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
			transition:fade
		></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
					transition:scale
				>
					<form
						method="POST"
						action="?/delete"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									closeDeleteModal();
									showToast('Projet supprimé avec succès');
									await invalidateAll();
								} else {
									showToast('Échec de la suppression', 'error');
								}
							};
						}}
					>
						<input type="hidden" name="projetId" value={selectedProjet.id} />
						<div class="px-6 py-5">
							<div class="flex items-center gap-3 mb-6">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
									<Trash2 size={20} class="text-red-600" />
								</div>
								<div>
									<h3 class="text-lg font-semibold text-slate-900">Supprimer le projet</h3>
									<p class="text-sm text-slate-500">{selectedProjet.libelle}</p>
								</div>
							</div>
							<div class="rounded-lg bg-red-50 border border-red-200 p-4">
								<p class="text-sm text-red-800">
									<strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
									à ce projet seront définitivement supprimées.
								</p>
							</div>
						</div>
						<div class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
							<button type="button" class="btn" onclick={closeDeleteModal}> Annuler </button>
							<button type="submit" class="btn btn-warning"> Supprimer définitivement </button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- TOAST NOTIFICATION -->
{#if toast}
	<div class="fixed bottom-4 right-4 z-50" transition:scale={{ duration: 200 }}>
		<div
			class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg {toast.type === 'success'
				? 'bg-emerald-600'
				: 'bg-red-600'} text-white"
		>
			{#if toast.type === 'success'}
				<CircleCheck size={20} />
			{:else}
				<CircleX size={20} />
			{/if}
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
