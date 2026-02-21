<script lang="ts">
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import {
		Plus,
		Download,
		Search,
		Building2,
		Pencil,
		Trash2,
		ChevronLeft,
		ChevronRight,
		CircleCheck,
		CircleX
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// State
	let societes = $derived(data.societes);
	let loading = $state(false);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Modals State
	let isCreateModalOpen = $state(false);
	let isEditModalOpen = $state(false);
	let isDeleteModalOpen = $state(false);

	// Toast
	let toast: { message: string; type: 'success' | 'error' } | null = $state(null);

	// Active item
	let selectedCompany: (typeof societes)[0] | null = $state(null);

	// Forms
	let createForm = $state({
		nom: '',
		raisonSocial: '',
		rue: '',
		cp: '',
		ville: '',
		tel: '',
		fax: '',
		email: '',
		siren: '',
		type: 0
	});

	let editForm = $state({
		nom: '',
		raisonSocial: '',
		rue: '',
		cp: '',
		ville: '',
		tel: '',
		fax: '',
		email: '',
		siren: '',
		type: 0
	});

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Derived
	const filteredCompanies = $derived(
		societes.filter((c) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				c.nom?.toLowerCase().includes(q) ||
				c.ville?.toLowerCase().includes(q) ||
				c.raisonSocial?.toLowerCase().includes(q) ||
				c.email?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredCompanies.length / perPage));
	const displayedCompanies = $derived(
		filteredCompanies.slice((page - 1) * perPage, page * perPage)
	);

	// Actions
	function openCreateModal() {
		createForm = {
			nom: '',
			raisonSocial: '',
			rue: '',
			cp: '',
			ville: '',
			tel: '',
			fax: '',
			email: '',
			siren: '',
			type: 0
		};
		isCreateModalOpen = true;
	}

	function closeCreateModal() {
		isCreateModalOpen = false;
	}

	function openEditModal(company: (typeof societes)[0]) {
		selectedCompany = company;
		editForm = {
			nom: company.nom || '',
			raisonSocial: company.raisonSocial || '',
			rue: company.rue || '',
			cp: company.cp || '',
			ville: company.ville || '',
			tel: company.tel || '',
			fax: company.fax || '',
			email: company.email || '',
			siren: company.siren || '',
			type: company.type || 0
		};
		isEditModalOpen = true;
	}

	function closeEditModal() {
		isEditModalOpen = false;
		selectedCompany = null;
	}

	function openDeleteModal(company: (typeof societes)[0]) {
		selectedCompany = company;
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
		selectedCompany = null;
	}

	// CSV Export
	function downloadCSV() {
		if (!societes.length) return;
		const cols = ['id', 'nom', 'raisonSocial', 'rue', 'cp', 'ville', 'tel', 'email', 'siren'];
		const lines = [cols.join(',')];

		for (const c of filteredCompanies) {
			const row = [
				c.id,
				`"${(c.nom || '').replace(/"/g, '""')}"`,
				`"${(c.raisonSocial || '').replace(/"/g, '""')}"`,
				`"${(c.rue || '').replace(/"/g, '""')}"`,
				c.cp || '',
				`"${(c.ville || '').replace(/"/g, '""')}"`,
				`"${(c.tel || '').replace(/"/g, '""')}"`,
				`"${(c.email || '').replace(/"/g, '""')}"`,
				`"${(c.siren || '').replace(/"/g, '""')}"`
			];
			lines.push(row.join(','));
		}

		const csv = lines.join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'societes_export.csv';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<svelte:head>
	<title>Admin · Sociétés</title>
</svelte:head>

<main class="mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="sm:flex sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
					Gestion des sociétés
				</h1>
				<p class="mt-2 text-sm text-slate-600">
					Gérez la liste des sociétés et leurs établissements rattachés.
				</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<button
					onclick={openCreateModal}
					class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
				>
					<Plus size={18} />
					Nouvelle société
				</button>
				<button
					onclick={downloadCSV}
					class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
				>
					<Download size={16} />
					Exporter CSV
				</button>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<div class="relative">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
				<Search class="h-5 w-5 text-slate-400" />
			</div>
			<input
				type="text"
				bind:value={query}
				placeholder="Rechercher par nom, ville ou raison sociale..."
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
		{:else if displayedCompanies.length === 0}
			<div class="flex flex-col items-center justify-center px-4 py-16">
				<Building2 size={48} strokeWidth={1.5} class="mb-4 text-slate-300" />
				<p class="font-medium text-slate-500">Aucune société trouvée</p>
				<p class="mt-1 text-sm text-slate-400">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each displayedCompanies as company (company.id)}
					<div class="flex items-center gap-4 p-4 transition-colors hover:bg-slate-50">
						<!-- Avatar -->
						<div class="shrink-0">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white shadow"
							>
								{company.nom?.[0]?.toUpperCase() || '?'}
							</div>
						</div>

						<!-- Info -->
						<div class="min-w-0 flex-1">
							<p class="font-semibold text-slate-900">{company.nom}</p>
							<p class="text-sm text-slate-500">{company.raisonSocial || '-'}</p>
						</div>

						<!-- Location -->
						<div class="hidden shrink-0 sm:flex sm:flex-col sm:items-start">
							<p class="text-sm font-medium text-slate-900">{company.ville || '-'}</p>
							<p class="text-xs text-slate-500">{company.cp || '-'}</p>
						</div>

						<!-- Email / Tel -->
						<div class="mr-4 hidden shrink-0 md:flex md:flex-col md:items-end">
							<p class="text-sm text-slate-900">{company.email || '-'}</p>
							<p class="text-xs text-slate-500">{company.tel || '-'}</p>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-2">
							<button
								onclick={() => openEditModal(company)}
								class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
								title="Modifier"
							>
								<Pencil size={18} />
							</button>

							<button
								onclick={() => openDeleteModal(company)}
								class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
		{#if !loading && filteredCompanies.length > 0}
			<div
				class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3"
			>
				<p class="text-sm text-slate-600">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredCompanies.length, (page - 1) * perPage + 1)}</span
					>
					à <span class="font-semibold">{Math.min(filteredCompanies.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredCompanies.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button
						onclick={() => (page = Math.max(1, page - 1))}
						disabled={page === 1}
						class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<ChevronLeft size={16} />
						Précédent
					</button>
					<button
						onclick={() => (page = Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
						class="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Suivant
						<ChevronRight size={16} />
					</button>
				</div>
			</div>
		{/if}
	</div>
</main>

<!-- MODAL : Créer -->
{#if isCreateModalOpen}
	<div class="relative z-50" role="dialog" aria-modal="true">
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
			transition:fade
		></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
					transition:scale
				>
					<form
						method="POST"
						action="?/create"
						use:enhance={() => {
							loading = true;
							return async ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									showToast('Société créée avec succès');
									closeCreateModal();
									await invalidateAll();
								} else {
									showToast('Erreur lors de la création', 'error');
								}
							};
						}}
					>
						<div class="px-6 py-5">
							<div class="mb-6 flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
									<Plus size={20} class="text-emerald-600" />
								</div>
								<div>
									<h3 class="text-lg font-semibold text-slate-900">Nouvelle société</h3>
									<p class="text-sm text-slate-500">Remplissez les informations ci-dessous</p>
								</div>
							</div>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-nom" class="text-sm font-medium text-slate-700">Nom</label>
										<input
											type="text"
											id="create-nom"
											name="nom"
											bind:value={createForm.nom}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
											placeholder="Ex: Dépollution Conseil"
											required
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-tel" class="text-sm font-medium text-slate-700"
											>Téléphone</label
										>
										<input
											type="tel"
											id="create-tel"
											name="tel"
											bind:value={createForm.tel}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="space-y-1.5">
									<label for="create-raison" class="text-sm font-medium text-slate-700"
										>Raison sociale</label
									>
									<input
										type="text"
										id="create-raison"
										name="raisonSocial"
										bind:value={createForm.raisonSocial}
										class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
									/>
								</div>

								<div class="space-y-1.5">
									<label for="create-rue" class="text-sm font-medium text-slate-700">Adresse</label>
									<input
										type="text"
										id="create-rue"
										name="rue"
										bind:value={createForm.rue}
										class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										placeholder="Numéro et rue"
									/>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-cp" class="text-sm font-medium text-slate-700"
											>Code postal</label
										>
										<input
											type="text"
											id="create-cp"
											name="cp"
											bind:value={createForm.cp}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-ville" class="text-sm font-medium text-slate-700"
											>Ville</label
										>
										<input
											type="text"
											id="create-ville"
											name="ville"
											bind:value={createForm.ville}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-email" class="text-sm font-medium text-slate-700"
											>Email</label
										>
										<input
											type="email"
											id="create-email"
											name="email"
											bind:value={createForm.email}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-fax" class="text-sm font-medium text-slate-700">Fax</label>
										<input
											type="tel"
											id="create-fax"
											name="fax"
											bind:value={createForm.fax}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-siren" class="text-sm font-medium text-slate-700"
											>SIREN</label
										>
										<input
											type="text"
											id="create-siren"
											name="siren"
											bind:value={createForm.siren}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-type" class="text-sm font-medium text-slate-700">Type</label>
										<input
											type="number"
											id="create-type"
											name="type"
											bind:value={createForm.type}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
							<button
								type="button"
								class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
								onclick={closeCreateModal}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={loading}
								class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
							>
								{loading ? 'Création...' : 'Créer la société'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL : Éditer -->
{#if isEditModalOpen && selectedCompany}
	<div class="relative z-50" role="dialog" aria-modal="true">
		<div
			class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
			transition:fade
		></div>
		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-center justify-center p-4">
				<div
					class="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all"
					transition:scale
				>
					<form
						method="POST"
						action="?/update"
						use:enhance={() => {
							loading = true;
							return async ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									showToast('Société mise à jour avec succès');
									closeEditModal();
									await invalidateAll();
								} else {
									showToast('Erreur lors de la mise à jour', 'error');
								}
							};
						}}
					>
						<input type="hidden" name="id" value={selectedCompany.id} />
						<div class="px-6 py-5">
							<div class="mb-6 flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
									<Pencil size={20} class="text-blue-600" />
								</div>
								<div>
									<h3 class="text-lg font-semibold text-slate-900">Modifier la société</h3>
									<p class="text-sm text-slate-500">{selectedCompany.nom}</p>
								</div>
							</div>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="edit-nom" class="text-sm font-medium text-slate-700">Nom</label>
										<input
											type="text"
											id="edit-nom"
											name="nom"
											bind:value={editForm.nom}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
											required
										/>
									</div>
									<div class="space-y-1.5">
										<label for="edit-tel" class="text-sm font-medium text-slate-700"
											>Téléphone</label
										>
										<input
											type="tel"
											id="edit-tel"
											name="tel"
											bind:value={editForm.tel}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="space-y-1.5">
									<label for="edit-raison" class="text-sm font-medium text-slate-700"
										>Raison sociale</label
									>
									<input
										type="text"
										id="edit-raison"
										name="raisonSocial"
										bind:value={editForm.raisonSocial}
										class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
									/>
								</div>

								<div class="space-y-1.5">
									<label for="edit-rue" class="text-sm font-medium text-slate-700">Adresse</label>
									<input
										type="text"
										id="edit-rue"
										name="rue"
										bind:value={editForm.rue}
										class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
									/>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="edit-cp" class="text-sm font-medium text-slate-700"
											>Code postal</label
										>
										<input
											type="text"
											id="edit-cp"
											name="cp"
											bind:value={editForm.cp}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="edit-ville" class="text-sm font-medium text-slate-700">Ville</label>
										<input
											type="text"
											id="edit-ville"
											name="ville"
											bind:value={editForm.ville}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="edit-email" class="text-sm font-medium text-slate-700">Email</label>
										<input
											type="email"
											id="edit-email"
											name="email"
											bind:value={editForm.email}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="edit-fax" class="text-sm font-medium text-slate-700">Fax</label>
										<input
											type="tel"
											id="edit-fax"
											name="fax"
											bind:value={editForm.fax}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>

								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="edit-siren" class="text-sm font-medium text-slate-700">SIREN</label>
										<input
											type="text"
											id="edit-siren"
											name="siren"
											bind:value={editForm.siren}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="edit-type" class="text-sm font-medium text-slate-700">Type</label>
										<input
											type="number"
											id="edit-type"
											name="type"
											bind:value={editForm.type}
											class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
										/>
									</div>
								</div>
							</div>
						</div>
						<div class="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
							<button
								type="button"
								class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
								onclick={closeEditModal}
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={loading}
								class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
							>
								{loading ? 'Enregistrement...' : 'Enregistrer'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedCompany}
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
							loading = true;
							return async ({ result }) => {
								loading = false;
								if (result.type === 'success') {
									showToast('Société supprimée avec succès');
									closeDeleteModal();
									await invalidateAll();
								} else {
									showToast('Erreur lors de la suppression', 'error');
								}
							};
						}}
					>
						<input type="hidden" name="id" value={selectedCompany.id} />
						<div class="px-6 py-5">
							<div class="mb-6 flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
									<Trash2 size={20} class="text-red-600" />
								</div>
								<div>
									<h3 class="text-lg font-semibold text-slate-900">Supprimer la société</h3>
									<p class="text-sm text-slate-500">{selectedCompany.nom}</p>
								</div>
							</div>
							<div class="rounded-lg border border-red-200 bg-red-50 p-4">
								<p class="text-sm text-red-800">
									<strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
									à cette société seront définitivement supprimées.
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
								type="submit"
								disabled={loading}
								class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
							>
								{loading ? 'Suppression...' : 'Supprimer définitivement'}
							</button>
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
