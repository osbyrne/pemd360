<script lang="ts">
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

{#if totalItems > 0}
	<div class="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
		<p class="text-sm text-gray-600">
			Affichage de <span class="font-semibold">{startItem}</span>
			à <span class="font-semibold">{endItem}</span>
			sur <span class="font-semibold">{totalItems}</span> résultats
		</p>
		<div class="flex gap-2">
			<button
				onclick={() => onPageChange(Math.max(1, page - 1))}
				disabled={page === 1}
				class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Précédent
			</button>
			<button
				onclick={() => onPageChange(Math.min(totalPages, page + 1))}
				disabled={page === totalPages}
				class="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
			>
				Suivant
			</button>
		</div>
	</div>
{/if}
