<script lang="ts">
	import { ClipboardList, Recycle, Trash2 } from 'lucide-svelte';
	import Tabs from './Tabs.svelte';

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
</script>

<Tabs {tabs} />
