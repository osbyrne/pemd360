<script lang="ts">
    import { PieChart, ArrowUpRight, Recycle, Trash2, Box } from 'lucide-svelte';
    
    let { data } = $props();
    let stats = $derived(data.stats);
</script>

<svelte:head>
    <title>Tableau de Synthèse Global</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Tableau de Synthèse Global</h1>
        <p class="text-sm text-gray-500 mt-1">Vue d'ensemble et indicateurs clés du projet PEMD.</p>
    </div>

    <!-- Cards Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Total Objets</p>
                <h3 class="text-3xl font-bold text-gray-900 mt-2">{stats.totalObjets}</h3>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg">
                <Box class="w-6 h-6 text-blue-600" />
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Éléments Réemploi</p>
                <h3 class="text-3xl font-bold text-gray-900 mt-2">{stats.totalReemploi}</h3>
                <p class="text-xs text-green-600 mt-1 flex items-center">
                    <ArrowUpRight class="w-3 h-3 mr-1" />
                    {stats.totalObjets ? Math.round((stats.totalReemploi / stats.totalObjets) * 100) : 0}% du total
                </p>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
                <Recycle class="w-6 h-6 text-green-600" />
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">Éléments Déchets</p>
                <h3 class="text-3xl font-bold text-gray-900 mt-2">{stats.totalDechets}</h3>
                <p class="text-xs text-gray-500 mt-1">
                    {stats.totalObjets ? Math.round((stats.totalDechets / stats.totalObjets) * 100) : 0}% du total
                </p>
            </div>
            <div class="p-3 bg-gray-50 rounded-lg">
                <Trash2 class="w-6 h-6 text-gray-600" />
            </div>
        </div>
    </div>

    <!-- Details Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 class="font-semibold text-gray-900">Répartition par Macro-catégorie</h2>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-4">Macro-catégorie</th>
                        <th class="px-6 py-4 text-right">Nombre d'objets</th>
                        <th class="px-6 py-4 text-right">Réemploi</th>
                        <th class="px-6 py-4 text-right">Déchets</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {#each Object.entries(stats.byGroupe) as [groupe, data]}
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 font-medium text-gray-900">{groupe}</td>
                            <td class="px-6 py-4 text-right">{data.count}</td>
                            <td class="px-6 py-4 text-right text-green-600 font-medium">{data.reemploi}</td>
                            <td class="px-6 py-4 text-right text-gray-600">{data.dechets}</td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-gray-400">
                                Aucune donnée disponible pour la synthèse.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
