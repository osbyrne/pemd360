<script lang="ts">
    import { page } from '$app/stores';
    import { Info, Box, Trash2, Download } from 'lucide-svelte';

    const tabs = [
        { href: '/app/cerfa/informations', label: 'Partie informations', icon: Info, color: 'text-blue-600' },
        { href: '/app/cerfa/pem', label: 'Caractérisation PEM', icon: Box, color: 'text-amber-600' },
        { href: '/app/cerfa/dechets', label: 'Caractérisation Déchets', icon: Trash2, color: 'text-gray-600' }
    ];

    const currentPath = $derived($page.url.pathname);
    const projetId = $derived($page.url.searchParams.get('projetId'));
    
    function getTabUrl(baseHref: string): string {
        return projetId ? `${baseHref}?projetId=${projetId}` : baseHref;
    }
</script>

<div class="border-b border-gray-200 mb-6 -mx-6 px-6 bg-white sticky top-0 z-10">
    <div class="flex justify-between items-center">
        <nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            {#each tabs as tab}
                {@const isActive = currentPath.includes(tab.href)}
                <a
                    href={getTabUrl(tab.href)}
                    class="
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                        {isActive 
                            ? 'border-emerald-500 text-emerald-600' 
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                    "
                    aria-current={isActive ? 'page' : undefined}
                >
                    <tab.icon 
                        class="
                            -ml-0.5 mr-2 h-4 w-4 
                            {isActive ? tab.color : 'text-gray-400 group-hover:text-gray-500'}
                        " 
                    />
                    <span>{tab.label}</span>
                </a>
            {/each}
        </nav>

        {#if projetId}
            <a 
                href="/api/projects/{projetId}/cerfa" 
                target="_blank"
                class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
                <Download class="h-4 w-4" />
                Télécharger CERFA
            </a>
        {/if}
    </div>
</div>
