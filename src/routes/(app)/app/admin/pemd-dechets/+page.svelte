<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { Trash2, Download, Scale } from 'lucide-svelte';
    import PemdTabs from '$lib/components/PemdTabs.svelte';

    let { data } = $props();

    // Pagination & Search
    let query = $state('');
    let perPage = 25;
    let page = $state(1);

	let isDeleteModalOpen = $state(false);
	let currentItem = $state<any>(null);

    // Derived
    const filteredList = $derived(
        (data?.list || []).filter((item: any) => {
            if (!query) return true;
            const q = query.toLowerCase();
            return (
                item.nature?.toLowerCase().includes(q) ||
                item.codeDechet?.toString().toLowerCase().includes(q) ||
                item.ecoOrganismeRep?.toLowerCase().includes(q) ||
                item.stockage?.toLowerCase().includes(q)
            );
        })
    );

    const totalPages = $derived(Math.ceil(filteredList.length / perPage));
    const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

    const totalMass = $derived(
        filteredList.reduce((sum: number, item: any) => sum + (Number(item.masse) || 0), 0)
    );

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
    <title>Admin · PEMD - Déchets</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
    <PemdTabs />
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Inventaire PEMD - Déchets</h1>
            <p class="text-sm text-gray-500 mt-1">Classification et traitement des déchets par projet.</p>
        </div>        <a
            href="pemd-dechets/export{$pageStore.url.search}"
            class="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
            <Download class="w-4 h-4" />
            Exporter en Excel
        </a>    </div>

    <!-- Filters & Stats -->
    <div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <!-- Project Selector -->
        <div class="w-full md:w-64">
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
        <div class="relative flex-1 w-full">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
            </div>
            <input
                type="text"
                bind:value={query}
                placeholder="Rechercher par nature, code déchet, éco-organisme..."
                class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>

        <!-- Total Mass Card -->
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3 w-full md:w-auto hover:bg-emerald-100 transition-colors whitespace-nowrap lg:h-[46px]">
            <div class="p-1.5 bg-emerald-100 rounded-lg">
                <Scale class="w-5 h-5 text-emerald-600" />
            </div>
            <div class="flex flex-col md:flex-row md:items-baseline md:gap-2">
                <span class="text-xs font-semibold uppercase tracking-wider text-emerald-600/80">Masse Totale</span>
                <span class="text-lg font-bold">{totalMass.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t</span>
            </div>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-4">Nature</th>
                        <th class="px-6 py-4">Code déchet</th>
                        <th class="px-6 py-4">Masse</th>
                        <th class="px-6 py-4">Réutilisation sur site</th>
                        <th class="px-6 py-4">Recyclable</th>
                        <th class="px-6 py-4">Remblayage</th>
                        <th class="px-6 py-4">Incinération valorisation énergétique</th>
                        <th class="px-6 py-4">Non valorisation à enfouir</th>
                        <th class="px-6 py-4">Incinération sans valorisation énergétique</th>
                        <th class="px-6 py-4">Eco-organisme REP</th>
                        <th class="px-6 py-4">Stockage</th>
                        <th class="px-6 py-4 text-center w-32">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {#if displayedList.length === 0}
						<tr>
							<td colspan="12" class="px-6 py-12 text-center text-gray-400">
                                {#if query}
								    Aucun résultat pour "{query}".
                                {:else}
								    Aucun déchet PEMD enregistré.
                                {/if}
							</td>
						</tr>
					{:else}
                        {#each displayedList as item}
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4 font-medium text-gray-900">{item.nature || '-'}</td>
                                <td class="px-6 py-4">{item.codeDechet || '-'}</td>
                                <td class="px-6 py-4">{item.masse || '-'}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.reutilisation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.reutilisation ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.recyclable ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.recyclable ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.valorisationMatiere ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.valorisationMatiere ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.valorisationEnergetique ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.valorisationEnergetique ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.nonValorisation ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.nonValorisation ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium {item.incinerationSansValorisationEnergetique ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}">
                                        {item.incinerationSansValorisationEnergetique ? 'Oui' : 'Non'}
                                    </span>
                                </td>
                                <td class="px-6 py-4">{item.ecoOrganismeRep || '-'}</td>
                                <td class="px-6 py-4">{item.stockage || '-'}</td>
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
		<div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" transition:fade onclick={closeModal} onkeydown={(e) => e.key === 'Escape' && closeModal()} role="button" tabindex="-1"></div>
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
					Êtes-vous sûr de vouloir supprimer cet élément PEMD <span class="font-medium text-gray-900">"{currentItem?.objet || currentItem?.description}"</span> ?
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
