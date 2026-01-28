<script lang="ts">
	import { page } from '$app/stores';
	import { Info, Box, Trash2, Download } from 'lucide-svelte';
	import Tabs from './Tabs.svelte';

	const tabs = [
		{
			href: '/app/cerfa/informations',
			label: 'Partie informations',
			icon: Info,
			color: 'text-blue-600'
		},
		{ href: '/app/cerfa/pem', label: 'Caractérisation PEM', icon: Box, color: 'text-amber-600' },
		{
			href: '/app/cerfa/dechets',
			label: 'Caractérisation Déchets',
			icon: Trash2,
			color: 'text-gray-600'
		}
	];

	const projetId = $derived($page.url.searchParams.get('projetId'));
</script>

<Tabs {tabs} useTabColorWhenActive={true}>
	{#snippet actions()}
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
	{/snippet}
</Tabs>
