<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		page: number;
		totalPages: number;
		totalItems: number;
		perPage: number;
		onPageChange: (newPage: number) => void;
	}

	let { page, totalPages, totalItems, perPage, onPageChange }: Props = $props();

	const startItem = $derived(Math.min(totalItems, (page - 1) * perPage + 1));
	const endItem = $derived(Math.min(totalItems, page * perPage));
</script>

{#if totalItems > 0 && totalPages > 1}
	<div class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
		<p class="text-sm">
			Affichage de <span class="font-semibold">{startItem}</span>
			à <span class="font-semibold">{endItem}</span>
			sur <span class="font-semibold">{totalItems}</span> résultats
		</p>
		<div class="flex gap-2">
			<button onclick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} class="btn">
				<ChevronLeft size={16} />
				Précédent
			</button>
			<button
				onclick={() => onPageChange(Math.min(totalPages, page + 1))}
				disabled={page === totalPages}
				class="btn"
			>
				Suivant
				<ChevronRight size={16} />
			</button>
		</div>
	</div>
{/if}
