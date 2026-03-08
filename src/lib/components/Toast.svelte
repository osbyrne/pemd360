<script lang="ts">
	import { scale } from 'svelte/transition';
	import { Ban, SquareCheckBig } from 'lucide-svelte';

	export let toast: { message: string; type: 'success' | 'error' } | null = null;
</script>

{#if toast}
	<div class="fixed bottom-4 right-4 z-50" transition:scale={{ duration: 200 }}>
		<div
			class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg {toast.type === 'success'
				? 'bg-emerald-600'
				: 'bg-red-600'} text-white"
		>
			{#if toast.type === 'success'}
				<SquareCheckBig />
			{:else}
				<Ban />
			{/if}
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
