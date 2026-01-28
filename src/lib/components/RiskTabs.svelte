<script lang="ts">
	import { TestTubeDiagonal, Bug, TriangleAlert } from 'lucide-svelte';
	import Tabs from './Tabs.svelte';

	const tabs = [
		{ href: '/app/admin/amiante', label: 'Amiante', icon: TestTubeDiagonal, color: 'text-red-600' },
		{ href: '/app/admin/plomb', label: 'Plomb', icon: TriangleAlert, color: 'text-orange-600' },
		{ href: '/app/admin/termites', label: 'Termites', icon: Bug, color: 'text-amber-700' }
	];
</script>

<Tabs {tabs} />
