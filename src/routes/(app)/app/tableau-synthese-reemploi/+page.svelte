<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { Trash2, QrCode, Download, Search, X } from 'lucide-svelte';

	let { data } = $props();

	// Pagination & Search
	let query = $state('');
	let perPage = 25;
	let page = $state(1);

	let isDeleteModalOpen = $state(false);
	let isQrModalOpen = $state(false);
	let currentItem = $state<any>(null);
	let qrItem = $state<any>(null);

	// Derived
	const filteredList = $derived(
		(data?.list || []).filter((item: any) => {
			if (!query) return true;
			const q = query.toLowerCase();
			return (
				item.objet?.toLowerCase().includes(q) ||
				item.description?.toLowerCase().includes(q) ||
				item.etat?.toLowerCase().includes(q) ||
				item.etage?.toLowerCase().includes(q) ||
				item.potentielReemploi?.toLowerCase().includes(q)
			);
		})
	);

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	function handleProjectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const value = select.value;
		const url = new URL($pageStore.url);
		if (value) {
			url.searchParams.set('projectId', value);
		} else {
			url.searchParams.delete('projectId');
		}
		goto(url);
	}

	function openDeleteModal(item: any) {
		currentItem = item;
		isDeleteModalOpen = true;
	}

	function openQrModal(item: any) {
		qrItem = item;
		isQrModalOpen = true;
	}

	function closeModal() {
		isDeleteModalOpen = false;
		isQrModalOpen = false;
		currentItem = null;
		qrItem = null;
	}

	function handleFormResult() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				closeModal();
				await update();
			}
		};
	}

	// Calcul du coefficient de réemploi (pourcentage)
	function getCoefficientReemploi(item: any): string {
		if (item.reemploi) {
			return '100%';
		} else if (item.potentielReemploi) {
			// Vous pouvez ajuster la logique selon vos besoins
			return item.potentielReemploi;
		}
		return '0%';
	}
</script>

<svelte:head>
	<title>Tableaux Synthèse Réemploi</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold">Tableaux Synthèse Réemploi</h1>
			<p class="text-sm mt-1">
				Vue de synthèse des éléments PEMD avec potentiel de réemploi par projet.
			</p>
		</div>
		<a href="tableau-synthese-reemploi/export{$pageStore.url.search}" class="btn">
			<Download />
			Exporter en Excel
		</a>
	</div>

	<!-- Filters -->
	<div class="mb-6 flex flex-col sm:flex-row gap-4">
		<!-- Project Selector -->
		<div class="w-full sm:w-64">
			<select class="select" value={data.selectedProjectId || ''} onchange={handleProjectChange}>
				<option value="">Tous les projets</option>
				{#each data.projects as project}
					<option value={project.id}>{project.libelle}</option>
				{/each}
			</select>
		</div>

		<!-- Search Bar -->
		<label class="input relative">
			<Search />
			<input type="search" bind:value={query} placeholder="Rechercher..." />
		</label>
	</div>

	<div class="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class=" text-xs uppercase font-semibold border-b border-gray-200">
					<tr>
						<th class="px-6 py-4">Description</th>
						<th class="px-6 py-4">État</th>
						<th class="px-6 py-4">Étage</th>
						<th class="px-6 py-4">Potentiel réemploi</th>
						<th class="px-6 py-4">Coefficient réemploi</th>
						<th class="px-6 py-4">Miniature</th>
						<th class="px-6 py-4 text-center">QR code</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if displayedList.length === 0}
						<tr>
							<td colspan="8" class="px-6 py-12 text-center">
								{#if query}
									Aucun résultat pour "{query}".
								{:else}
									Aucun élément PEMD avec potentiel de réemploi.
								{/if}
							</td>
						</tr>
					{:else}
						{#each displayedList as item}
							<tr class="hover: transition-colors">
								<td class="px-6 py-4 font-medium">{item.description || item.objet || '-'}</td>
								<td class="px-6 py-4">
									{#if item.etat}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
										>
											{item.etat}
										</span>
									{:else}
										<span class="">-</span>
									{/if}
								</td>
								<td class="px-6 py-4">{item.etage || '-'}</td>
								<td class="px-6 py-4">
									{#if item.potentielReemploi}
										<span
											class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
										>
											{item.potentielReemploi}
										</span>
									{:else}
										<span class="">-</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<span class="font-medium {item.reemploi ? 'text-green-600' : ''}">
										{getCoefficientReemploi(item)}
									</span>
								</td>
								<td class="px-6 py-4">
									{#if item.image}
										<img
											src={item.image}
											alt="Miniature"
											class="h-16 w-16 object-cover rounded shadow-sm bg-white"
										/>
									{:else}
										<span class="text-xs">N/A</span>
									{/if}
								</td>
								<td class="px-6 py-4 text-center">
									<button
										onclick={() => openQrModal(item)}
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm hover: hover: rounded-lg transition-colors"
										title="Afficher QR Code"
									>
										<QrCode class="w-4 h-4" />
										<span class="hidden sm:inline">Voir</span>
									</button>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-center gap-2">
										<button
											onclick={() => openDeleteModal(item)}
											class="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

		<!-- Pagination -->
		{#if filteredList.length > 0 && totalPages > 1}
			<div class="flex items-center justify-between border-t border-gray-200 px-4 py-3">
				<p class="text-sm">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredList.length, (page - 1) * perPage + 1)}</span
					>
					à <span class="font-semibold">{Math.min(filteredList.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredList.length}</span> résultats
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
</div>

<!-- Delete Modal -->
{#if isDeleteModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed inset-0 backdrop-blur-sm transition-opacity"
			transition:fade
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
			role="button"
			tabindex="-1"
		></div>
		<div
			class="relative w-full max-w-md rounded-xl shadow-xl overflow-hidden"
			transition:scale={{ start: 0.95 }}
		>
			<div class="p-6">
				<h3 class="text-lg font-semibold mb-2">Confirmer la suppression</h3>
				<p class="text-sm mb-6">
					Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
				</p>
				<form method="POST" action="?/delete" use:enhance={handleFormResult()}>
					<input type="hidden" name="id" value={currentItem?.id} />
					<div class="flex gap-3 justify-end">
						<button type="button" onclick={closeModal} class="btn"> Annuler </button>
						<button type="submit" class="btn btn-warning"> Supprimer </button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

<!-- QR Code Modal -->
{#if isQrModalOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed inset-0 backdrop-blur-sm transition-opacity"
			transition:fade
			onclick={closeModal}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
			role="button"
			tabindex="-1"
		></div>
		<div
			class="relative w-full max-w-md rounded-xl shadow-xl overflow-hidden p-6"
			transition:scale={{ start: 0.95 }}
		>
			<div class="flex justify-between items-center mb-4">
				<h3 class="text-lg font-semibold">QR Code</h3>
				<button onclick={closeModal} class="btn" aria-label="Fermer">
					<X class="w-6 h-6" />
				</button>
			</div>
			<div class="flex flex-col items-center">
				<div class="p-4 rounded-lg border-2 border-gray-200">
					<!-- Placeholder pour le QR Code - à remplacer par une vraie bibliothèque QR -->
					<div class="w-48 h-48 flex items-center justify-center">
						<span class=" text-sm text-center">QR Code<br />{qrItem?.id}</span>
					</div>
				</div>
				<p class="text-sm mt-4 text-center font-medium">
					{qrItem?.objet || qrItem?.description}
				</p>
				{#if qrItem?.description && qrItem?.objet}
					<p class="text-xs mt-1 text-center">{qrItem.description}</p>
				{/if}
			</div>
		</div>
	</div>
{/if}
