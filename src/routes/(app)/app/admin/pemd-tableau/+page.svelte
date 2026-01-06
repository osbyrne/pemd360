<script lang="ts">
    import PemdTabs from '$lib/components/PemdTabs.svelte';
    let { data } = $props();
</script>

<svelte:head>
    <title>Admin · PEMD - Tableau Général</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
    <PemdTabs />
    
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Tableau PEMD</h1>
        <p class="text-sm text-gray-500 mt-1">Vue d'ensemble de l'inventaire Produits, Équipements, Matériaux et Déchets.</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-4">Macro-catégorie</th>
                        <th class="px-6 py-4">Catégorie</th>
                        <th class="px-6 py-4">Objet</th>
                        <th class="px-6 py-4">Unité</th>
                        <th class="px-6 py-4">Masse (kg)</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    {#each data?.items || [] as item}
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">{item.groupe}</td>
                            <td class="px-6 py-4">{item.categorie}</td>
                            <td class="px-6 py-4">{item.objet}</td>
                            <td class="px-6 py-4">{item.unite || '-'}</td>
                            <td class="px-6 py-4">{item.masseUnitaire || '-'}</td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                                Aucun élément trouvé dans l'inventaire PEMD.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
