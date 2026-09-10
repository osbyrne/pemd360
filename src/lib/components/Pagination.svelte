<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
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

  const styles = stylex.create({
    div: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      alignItems: {
        default: "flex-start",
        "@media (min-width: 640px)": "center",
      },
      justifyContent: "space-between",
      gap: "0.75rem",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span: {
      fontWeight: 600,
    },
  });
</script>

{#if totalItems > 0 && totalPages > 1}
  <div class={stylex.attrs(styles.div).class}>
    <p class={stylex.attrs(styles.p).class}>
      Affichage de <span class={stylex.attrs(styles.span).class}>{startItem}</span>
      à <span class={stylex.attrs(styles.span).class}>{endItem}</span>
      sur <span class={stylex.attrs(styles.span).class}>{totalItems}</span> résultats
    </p>
    <div class={stylex.attrs(ui.buttonGroup).class} aria-label="Pagination">
      <button
        type="button"
        onclick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        class={stylex.attrs(ui.button, ui.buttonGroupItem, ui.buttonSmall).class}
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} />
        Précédent
      </button>
      <button
        type="button"
        onclick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        class={stylex.attrs(ui.button, ui.buttonGroupItem, ui.buttonSmall).class}
        aria-label="Page suivante"
      >
        Suivant
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
{/if}
