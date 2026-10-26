<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import CerfaTabs from "$lib/components/CerfaTabs.svelte";
  import { Box } from "lucide-svelte";

  let { data } = $props();

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "80rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    div2: {
      marginBottom: "2rem",
    },
    h1: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 700,
    },
    p: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    td: {
      fontWeight: 500,
    },
    td2: {
      whiteSpace: "nowrap",
    },
    Box: {
      display: "inline-block",
      marginInlineEnd: ".5rem",
      height: "1rem",
      width: "1rem",
      color: "oklch(66.6% 0.179 58.318)",
    },
    span: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(96.2% 0.059 95.617)",
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(47.3% 0.137 46.201)",
    },
  });
</script>

<svelte:head>
  <title>CERFA · Caractérisation PEM</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <CerfaTabs />

  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>Caractérisation PEM</h1>
    <p class={stylex.attrs(styles.p).class}>
      Inventaire des Produits, Équipements et Matériaux (Réemploi/Réutilisation).
    </p>
  </div>

  <div class={stylex.attrs(ui.tableFrame).class}>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard access to horizontal scrolling.) -->
    <div
      class={stylex.attrs(ui.tableScroll).class}
      tabindex="0"
      role="region"
      aria-label="Tableau défilant"
    >
      <table class={stylex.attrs(ui.table).class}>
        <thead>
          <tr>
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Famille (Macro)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Matériau (Catégorie)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Nature (Objet)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Quantité / Unité</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Destination</th
            >
          </tr>
        </thead>
        <tbody>
          {#each data.items as item}
            <tr class={stylex.attrs(ui.tableRow).class}>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}
                >{item.groupe}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.categorie}</td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}>
                <Box class={stylex.attrs(styles.Box).class} />
                {item.objet}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                {item.masseUnitaire || "?"}
                {item.unite || ""}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                <span class={stylex.attrs(styles.span).class}>
                  {item.etat || "Réemploi"}
                </span>
              </td>
            </tr>
          {:else}
            <tr class={stylex.attrs(ui.tableRow).class}>
              <td colspan="5" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableEmpty).class}>
                Aucun élément caractérisé PEM (Réemploi) trouvé.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
