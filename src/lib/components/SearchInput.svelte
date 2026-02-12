<script lang="ts">
	import { Search } from 'lucide-svelte';

	interface Props {
		value: string;
		placeholder?: string;
		onInput?: (value: string) => void;
	}

	let { value = $bindable(), placeholder = 'Rechercher...' }: Props = $props();
</script>

<div class="relative flex-1">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
		<Search class="h-5 w-5 text-gray-400" />
	</div>
	<input
		type="text"
		bind:value
		{placeholder}
		class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
	/>
</div>
