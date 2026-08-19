<script lang="ts">
  import { ChevronLeft, ChevronRight } from "lucide-svelte";

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
  <div
    class="flex flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center"
  >
    <p class="text-sm">
      Affichage de <span class="font-semibold">{startItem}</span>
      à <span class="font-semibold">{endItem}</span>
      sur <span class="font-semibold">{totalItems}</span> résultats
    </p>
    <div class="join" aria-label="Pagination">
      <button
        type="button"
        onclick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        class="btn join-item btn-sm"
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
        Précédent
      </button>
      <button
        type="button"
        onclick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        class="btn join-item btn-sm"
        aria-label="Page suivante"
      >
        Suivant
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
{/if}
