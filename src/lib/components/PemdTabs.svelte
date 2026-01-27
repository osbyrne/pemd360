<script lang="ts">
	import { page } from '$app/stores';
	import { ClipboardList, Recycle, Trash2 } from 'lucide-svelte';

	const tabs = [
		{
			href: '/app/admin/pemd-tableau',
			label: 'Tableau PEMD',
			icon: ClipboardList,
			color: 'text-blue-600'
		},
		{
			href: '/app/admin/pemd-reemploi',
			label: 'Tableau Réemploi',
			icon: Recycle,
			color: 'text-green-600'
		},
		{
			href: '/app/admin/pemd-dechets',
			label: 'Tableau Déchets',
			icon: Trash2,
			color: 'text-gray-600'
		}
	];

	const currentPath = $derived($page.url.pathname);

	// Fonction pour construire l'URL avec les paramètres actuels
	function buildHref(baseHref: string) {
		const searchParams = $page.url.searchParams;
		const params = new URLSearchParams(searchParams);
		const queryString = params.toString();
		return queryString ? `${baseHref}?${queryString}` : baseHref;
	}
</script>

<div class="border-b border-gray-200 mb-6 -mx-6 px-6 bg-white sticky top-0 z-10">
	<nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
		{#each tabs as tab}
			{@const isActive = currentPath.includes(tab.href)}
			<a
				href={buildHref(tab.href)}
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
                        {isActive ? 'text-emerald-500' : 'text-gray-400 group-hover:text-gray-500'}
                    "
				/>
				{tab.label}
			</a>
		{/each}
	</nav>
</div>
