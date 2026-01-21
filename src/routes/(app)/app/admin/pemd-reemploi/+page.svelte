<script lang="ts">
    import PemdTabs from '$lib/components/PemdTabs.svelte';
    import { goto } from '$app/navigation';
    import { page as pageStore } from '$app/stores';
    let { data } = $props();

    // Pagination & Search
    let query = $state('');
    let perPage = 25;
    let page = $state(1);

    // Derived
    const filteredList = $derived(
        (data?.list || []).filter((item: any) => {
            if (!query) return true;
            const q = query.toLowerCase();
            return (
                item.groupe?.toLowerCase().includes(q) ||
                item.categorie?.toLowerCase().includes(q) ||
                item.objet?.toLowerCase().includes(q) ||
                item.projetNom?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
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
</script>

<svelte:head>
    <title>Admin · PEMD - Réemploi</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
    <PemdTabs />
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Tableau Réemploi</h1>
            <p class="text-sm text-gray-500 mt-1">Gestion des éléments destinés au réemploi.</p>
        </div>
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
                placeholder="Rechercher par macro-catégorie, catégorie ou objet..."
                class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
        </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-4">Projet</th>
                        <th class="px-6 py-4">Macro-catégorie</th>
                        <th class="px-6 py-4">Catégorie</th>
                        <th class="px-6 py-4">Objet</th>
                        <th class="px-6 py-4">Description</th>
                        <th class="px-6 py-4">Quantité</th>
                        <th class="px-6 py-4">Potentiel Réemploi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {#each displayedList as item}
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">{item.projetNom || '-'}</td>
                            <td class="px-6 py-4">{item.groupe || '-'}</td>
                            <td class="px-6 py-4">{item.categorie || '-'}</td>
                            <td class="px-6 py-4">{item.objet || '-'}</td>
                            <td class="px-6 py-4">{item.description || '-'}</td>
                            <td class="px-6 py-4">{item.quantite || '-'}</td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {item.potentielReemploi || item.deposeReemlpoi || 'Oui'}
                                </span>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                {#if query}
                                    Aucun résultat pour "{query}".
                                {:else}
                                    Aucun élément trouvé.
                                {/if}
                            </td>
                        </tr>
                    {/each}
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
