<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Plus, Download, Search, Building2, Pencil, Trash2 } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data }: { data: PageData } = $props();

	// State
	let societes = $derived(data.societes);
	let loading = $state(false);

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	// Modals
	let createModal: HTMLDialogElement;
	let editModal: HTMLDialogElement;
	let deleteModal: HTMLDialogElement;

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
		createModal?.showModal();
	}

	function closeCreateModal() {
		createModal?.close();
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
		editModal?.showModal();
	}

	function closeEditModal() {
		editModal?.close();
		selectedCompany = null;
	}

	function openDeleteModal(company: (typeof societes)[0]) {
		selectedCompany = company;
		deleteModal?.showModal();
	}

	function closeDeleteModal() {
		deleteModal?.close();
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
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Gestion des sociétés</h1>
				<p class="mt-2 text-sm">Gérez la liste des sociétés et leurs établissements rattachés.</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<button onclick={openCreateModal} class="btn">
					<Plus size={18} />
					Nouvelle société
				</button>
				<dialog bind:this={createModal} class="modal">
					<div class="modal-box max-w-lg">
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
							<div class="mb-6 flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
									<Plus size={20} class="text-emerald-600" />
								</div>
								<div>
									<h3 class="text-lg font-semibold">Nouvelle société</h3>
									<p class="text-sm">Remplissez les informations ci-dessous</p>
								</div>
							</div>
							<div class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-nom" class="text-sm font-medium">Nom</label>
										<input
											type="text"
											id="create-nom"
											name="nom"
											bind:value={createForm.nom}
											class="input"
											placeholder="Ex: Dépollution Conseil"
											required
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-tel" class="text-sm font-medium">Téléphone</label>
										<input
											type="tel"
											id="create-tel"
											name="tel"
											bind:value={createForm.tel}
											class="input"
										/>
									</div>
								</div>
								<div class="space-y-1.5">
									<label for="create-raison" class="text-sm font-medium">Raison sociale</label>
									<input
										type="text"
										id="create-raison"
										name="raisonSocial"
										bind:value={createForm.raisonSocial}
										class="input"
									/>
								</div>
								<div class="space-y-1.5">
									<label for="create-rue" class="text-sm font-medium">Adresse</label>
									<input
										type="text"
										id="create-rue"
										name="rue"
										bind:value={createForm.rue}
										class="input"
										placeholder="Numéro et rue"
									/>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-cp" class="text-sm font-medium">Code postal</label>
										<input
											type="text"
											id="create-cp"
											name="cp"
											bind:value={createForm.cp}
											class="input"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-ville" class="text-sm font-medium">Ville</label>
										<input
											type="text"
											id="create-ville"
											name="ville"
											bind:value={createForm.ville}
											class="input"
										/>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-email" class="text-sm font-medium">Email</label>
										<input
											type="email"
											id="create-email"
											name="email"
											bind:value={createForm.email}
											class="input"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-fax" class="text-sm font-medium">Fax</label>
										<input
											type="tel"
											id="create-fax"
											name="fax"
											bind:value={createForm.fax}
											class="input"
										/>
									</div>
								</div>
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1.5">
										<label for="create-siren" class="text-sm font-medium">SIREN</label>
										<input
											type="text"
											id="create-siren"
											name="siren"
											bind:value={createForm.siren}
											class="input"
										/>
									</div>
									<div class="space-y-1.5">
										<label for="create-type" class="text-sm font-medium">Type</label>
										<input
											type="number"
											id="create-type"
											name="type"
											bind:value={createForm.type}
											class="input"
										/>
									</div>
								</div>
							</div>
							<div class="modal-action">
								<button type="button" class="btn" onclick={closeCreateModal}>Annuler</button>
								<button type="submit" disabled={loading} class="btn">
									{loading ? 'Création...' : 'Créer la société'}
								</button>
							</div>
						</form>
					</div>
				</dialog>
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
		<input type="search" bind:value={query} placeholder="nom, ville ou raison sociale..." />
	</label>
	<br />
	<br />

	<!-- List -->
	<div class="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
		{#if loading}
			<div class="divide-y divide-slate-100">
				{#each Array(5) as i (i)}
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
		{:else if displayedCompanies.length === 0}
			<div class="flex flex-col items-center justify-center px-4 py-16">
				<Building2 size={48} strokeWidth={1.5} class="mb-4 " />
				<p class="font-medium">Aucune société trouvée</p>
				<p class="mt-1 text-sm">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each displayedCompanies as company (company.id)}
					<div class="flex items-center gap-4 p-4 transition-colors hover:">
						<!-- Info -->
						<div class="min-w-0 flex-1">
							<p class="font-semibold">{company.nom}</p>
							<p class="text-sm">{company.raisonSocial || '-'}</p>
						</div>

						<!-- Location -->
						<div class="hidden shrink-0 sm:flex sm:flex-col sm:items-start">
							<p class="text-sm font-medium">{company.ville || '-'}</p>
							<p class="text-xs">{company.cp || '-'}</p>
						</div>

						<!-- Email / Tel -->
						<div class="mr-4 hidden shrink-0 md:flex md:flex-col md:items-end">
							<p class="text-sm">{company.email || '-'}</p>
							<p class="text-xs">{company.tel || '-'}</p>
						</div>

						<!-- Actions -->
						<div class="flex shrink-0 items-center gap-1 border-l border-slate-200 pl-2">
							<button onclick={() => openEditModal(company)} class="btn btn-ghost" title="Modifier">
								<Pencil size={18} />
							</button>
							<dialog bind:this={editModal} class="modal">
								<div class="modal-box max-w-lg">
									{#if selectedCompany}
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
											<input class="input" type="hidden" name="id" value={selectedCompany.id} />
											<div class="mb-6 flex items-center gap-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"
												>
													<Pencil size={20} class="text-blue-600" />
												</div>
												<div>
													<h3 class="text-lg font-semibold">Modifier la société</h3>
													<p class="text-sm">{selectedCompany.nom}</p>
												</div>
											</div>
											<div class="space-y-4">
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1.5">
														<label for="edit-nom" class="text-sm font-medium">Nom</label>
														<input
															type="text"
															id="edit-nom"
															name="nom"
															bind:value={editForm.nom}
															class="input"
															required
														/>
													</div>
													<div class="space-y-1.5">
														<label for="edit-tel" class="text-sm font-medium">Téléphone</label>
														<input
															type="tel"
															id="edit-tel"
															name="tel"
															bind:value={editForm.tel}
															class="input"
														/>
													</div>
												</div>
												<div class="space-y-1.5">
													<label for="edit-raison" class="text-sm font-medium">Raison sociale</label
													>
													<input
														type="text"
														id="edit-raison"
														name="raisonSocial"
														bind:value={editForm.raisonSocial}
														class="input"
													/>
												</div>
												<div class="space-y-1.5">
													<label for="edit-rue" class="text-sm font-medium">Adresse</label>
													<input
														type="text"
														id="edit-rue"
														name="rue"
														bind:value={editForm.rue}
														class="input"
													/>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1.5">
														<label for="edit-cp" class="text-sm font-medium">Code postal</label>
														<input
															type="text"
															id="edit-cp"
															name="cp"
															bind:value={editForm.cp}
															class="input"
														/>
													</div>
													<div class="space-y-1.5">
														<label for="edit-ville" class="text-sm font-medium">Ville</label>
														<input
															type="text"
															id="edit-ville"
															name="ville"
															bind:value={editForm.ville}
															class="input"
														/>
													</div>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1.5">
														<label for="edit-email" class="text-sm font-medium">Email</label>
														<input
															type="email"
															id="edit-email"
															name="email"
															bind:value={editForm.email}
															class="input"
														/>
													</div>
													<div class="space-y-1.5">
														<label for="edit-fax" class="text-sm font-medium">Fax</label>
														<input
															type="tel"
															id="edit-fax"
															name="fax"
															bind:value={editForm.fax}
															class="input"
														/>
													</div>
												</div>
												<div class="grid grid-cols-2 gap-4">
													<div class="space-y-1.5">
														<label for="edit-siren" class="text-sm font-medium">SIREN</label>
														<input
															type="text"
															id="edit-siren"
															name="siren"
															bind:value={editForm.siren}
															class="input"
														/>
													</div>
													<div class="space-y-1.5">
														<label for="edit-type" class="text-sm font-medium">Type</label>
														<input
															type="number"
															id="edit-type"
															name="type"
															bind:value={editForm.type}
															class="input"
														/>
													</div>
												</div>
											</div>
											<div class="modal-action">
												<button type="button" class="btn" onclick={closeEditModal}>Annuler</button>
												<button type="submit" disabled={loading} class="btn">
													{loading ? 'Enregistrement...' : 'Enregistrer'}
												</button>
											</div>
										</form>
									{/if}
								</div>
							</dialog>

							<button
								onclick={() => openDeleteModal(company)}
								class="btn btn-ghost btn-warning"
								title="Supprimer"
							>
								<Trash2 size={18} />
							</button>
							<dialog bind:this={deleteModal} class="modal">
								<div class="modal-box">
									{#if selectedCompany}
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
											<input class="input" type="hidden" name="id" value={selectedCompany.id} />
											<div class="mb-6 flex items-center gap-3">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100"
												>
													<Trash2 size={20} class="text-red-600" />
												</div>
												<div>
													<h3 class="text-lg font-semibold">Supprimer la société</h3>
													<p class="text-sm">{selectedCompany.nom}</p>
												</div>
											</div>
											<div class="rounded-lg border border-red-200 bg-red-50 p-4">
												<p class="text-sm text-red-800">
													<strong>Attention :</strong> Cette action est irréversible. Toutes les données
													associées à cette société seront définitivement supprimées.
												</p>
											</div>
											<div class="modal-action">
												<button type="button" class="btn" onclick={closeDeleteModal}>Annuler</button
												>
												<button type="submit" disabled={loading} class="btn">
													{loading ? 'Suppression...' : 'Supprimer définitivement'}
												</button>
											</div>
										</form>
									{/if}
								</div>
							</dialog>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		{#if !loading}
			<Pagination
				{page}
				{totalPages}
				totalItems={filteredCompanies.length}
				{perPage}
				onPageChange={(p) => (page = p)}
			/>
		{/if}
	</div>
</main>

{#if toast}
	<div class="toast">
		<div class="alert alert-info">
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
