<script lang="ts">
    import CerfaTabs from '$lib/components/CerfaTabs.svelte';
    import { Building2, UserCircle, MapPin, CalendarDays } from 'lucide-svelte';
    
    let { data } = $props();
</script>

<svelte:head>
    <title>CERFA · Informations</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
    <CerfaTabs />
    
    <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Partie Informations</h1>
        <p class="text-sm text-gray-500 mt-1">Informations administratives (Maîtrise d'ouvrage, Opération, Diagnostiqueur).</p>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-gray-600">
                <thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                    <tr>
                        <th class="px-6 py-4">Projet</th>
                        <th class="px-6 py-4">Maître d'Ouvrage</th>
                        <th class="px-6 py-4">Diagnostiqueur</th>
                        <th class="px-6 py-4">Opération</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    {#each data.list as item}
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4">
                                <span class="font-medium text-gray-900">{item.projetNom || 'Projet sans nom'}</span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <Building2 class="w-4 h-4 text-gray-400" />
                                    <span>{item.moaNom || 'Non renseigné'}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-2">
                                    <UserCircle class="w-4 h-4 text-gray-400" />
                                    <span>{item.diagnostiqueurNom || 'Non renseigné'}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col gap-1">
                                    {#if item.operationAdresse}
                                        <div class="flex items-center gap-2">
                                            <MapPin class="w-3.5 h-3.5 text-gray-400" />
                                            <span class="truncate max-w-xs">{item.operationAdresse}</span>
                                        </div>
                                    {/if}
                                    {#if item.datePermis}
                                        <div class="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays class="w-3.5 h-3.5" />
                                            <span>Permis: {new Date(item.datePermis).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    {/if}
                                    {#if !item.operationAdresse && !item.datePermis}
                                        <span class="text-gray-400 italic">Non renseigné</span>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                Aucune donnée Cerfa trouvée pour les projets en cours.
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
