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
    div3: {
      overflow: "hidden",
    },
    div4: {
      overflowX: "auto",
    },
    thead: {
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    th: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    tbody: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.7% 0.003 264.542)",
    },
    tr: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    td: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontWeight: 500,
    },
    td2: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    Box: {
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
    td3: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      textAlign: "center",
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

  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div4).class}>
      <table class={stylex.attrs(ui.table).class}>
        <thead class={stylex.attrs(styles.thead).class}>
          <tr>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Famille (Macro)</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Matériau (Catégorie)</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Nature (Objet)</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Quantité / Unité</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Destination</th
            >
          </tr>
        </thead>
        <tbody class={stylex.attrs(styles.tbody).class}>
          {#each data.items as item}
            <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}
                >{item.groupe}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                >{item.categorie}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}>
                <Box class={stylex.attrs(styles.Box).class} />
                {item.objet}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                {item.masseUnitaire || "?"}
                {item.unite || ""}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                <span class={stylex.attrs(styles.span).class}>
                  {item.etat || "Réemploi"}
                </span>
              </td>
            </tr>
          {:else}
            <tr class={stylex.attrs(ui.divideChild).class}>
              <td colspan="5" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td3).class}>
                Aucun élément caractérisé PEM (Réemploi) trouvé.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
