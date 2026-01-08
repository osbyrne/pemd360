<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { Trash2, Download } from 'lucide-svelte';
	import RiskTabs from '$lib/components/RiskTabs.svelte';

	let { data } = $props();

    // Pagination & Search
    let query = $state('');
    let perPage = 25;
    let page = $state(1);

	let isDeleteModalOpen = $state(false);
	let currentItem = $state<any>(null);

    // Derived
    const filteredList = $derived(
        data.list.filter((item: any) => {
            if (!query) return true;
            const q = query.toLowerCase();
            return (
                item.label?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.projetNom?.toLowerCase().includes(q)
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

	function closeModal() {
		isDeleteModalOpen = false;
		currentItem = null;
	}

	function handleFormResult() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				closeModal();
				await update();
			}
		};
	}
</script>

<svelte:head>
	<title>Admin · Plomb</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<RiskTabs />
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Inventaire Plomb</h1>
			<p class="text-sm text-gray-500 mt-1">Liste des tags plomb détectés.</p>
		</div>
        <a
            href="plomb/export{$pageStore.url.search}"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
            <Download class="w-4 h-4" />
            Exporter en Excel
        </a>
	</div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <!-- Project Selector -->
        <div class="w-full sm:w-64">
             <select
                class="block w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-sm shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={data.selectedProjectId || ''}
                onchange={handleProjectChange}
            >
                <option value="">Tous les projets</option>
                {#each data.projects as project}
                    <option value={project.id}>{project.libelle}</option>
                {/each}
            </select>
        </div>

        <!-- Search Bar -->
        <div class="relative flex-1">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                bind:value={query}
                placeholder="Rechercher par label, description ou projet..."
                class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
    </div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
					<tr>
						<th class="px-6 py-4">Nom du prélèvement</th>
						<th class="px-6 py-4">Description</th>
						<th class="px-6 py-4">Localisation</th>
						<th class="px-6 py-4">Type</th>
						<th class="px-6 py-4">Miniature</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if displayedList.length === 0}
						<tr>
							<td colspan="6" class="px-6 py-12 text-center text-gray-400">
                                {#if query}
								    Aucun résultat pour "{query}".
                                {:else}
								    Aucun tag plomb enregistré.
                                {/if}
							</td>
						</tr>
					{:else}
						{#each displayedList as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900">
                                    {item.label}
                                </td>
								<td class="px-6 py-4">
                                    {item.description || '-'}
                                </td>
                                <td class="px-6 py-4">
                                    {item.etage || '-'}
                                </td>
                                <td class="px-6 py-4">
                                    Plomb
                                </td>
                                <td class="px-6 py-4">
                                    {#if item.customImage}
                                        <img src={item.customImage} alt={item.label} class="h-12 w-12 object-cover rounded shadow-sm bg-white" />
                                    {:else}
                                        <span class="text-xs text-gray-400">N/A</span>
                                    {/if}
                                </td>
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

        <!-- Pagination -->
        {#if filteredList.length > 0}
            <div class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                <p class="text-sm text-gray-600">
                    Affichage de <span class="font-semibold">{Math.min(filteredList.length, (page - 1) * perPage + 1)}</span>
                    à <span class="font-semibold">{Math.min(filteredList.length, page * perPage)}</span>
                    sur <span class="font-semibold">{filteredList.length}</span> résultats
                </p>
                <div class="flex gap-2">
                    <button
                        onclick={() => (page = Math.max(1, page - 1))}
                        disabled={page === 1}
                        class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <button
                        onclick={() => (page = Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            </div>
        {/if}
	</div>
</div>

{#if isDeleteModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" transition:fade onclick={closeModal}></div>
		<div
			class="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-6"
			transition:scale={{ start: 0.95 }}
		>
			<div class="flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
					<Trash2 class="w-6 h-6 text-red-600" />
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
				<p class="text-sm text-gray-500 mb-6">
					Êtes-vous sûr de vouloir supprimer ce tag <span class="font-medium text-gray-900">"{currentItem?.label}"</span> ?
					Cette action est irréversible.
				</p>
				
				<form action="?/delete" method="POST" use:enhance={handleFormResult} class="w-full flex gap-3">
					<input type="hidden" name="id" value={currentItem?.id} />
					<button
						type="button"
						onclick={closeModal}
						class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
					>
						Annuler
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
					>
						Supprimer
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
