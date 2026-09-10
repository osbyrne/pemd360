<script lang="ts">
  import { theme } from "../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import CerfaTabs from "$lib/components/CerfaTabs.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Search, X, Download } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Get projetId from URL params
  const projetId = $derived($page.url.searchParams.get("projetId") || "");

  // Search functionality
  let searchTerm = $state("");
  let filterByValorisation = $state<string>("all"); // all, valorisable, non-valorisable

  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = 10;

  // Calculate statistics
  const stats = $derived({
    total: data.dechets.length,
    totalMasse: data.dechets.reduce((sum, d) => sum + (d.masse || 0), 0),
    totalVolume: data.dechets.reduce((sum, d) => sum + (d.volume || 0), 0),
  });

  // Filter dechets based on search and filters
  const filteredDechets = $derived(
    data.dechets.filter((dechet) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          dechet.categorie?.toLowerCase().includes(search) ||
          dechet.objet?.toLowerCase().includes(search) ||
          dechet.nature?.toLowerCase().includes(search) ||
          dechet.codeDechet?.toString().includes(search);
        if (!matchesSearch) return false;
      }

      // Valorisation filter
      if (filterByValorisation === "valorisable") {
        return (
          dechet.recyclable === 1 ||
          dechet.reutilisation === 1 ||
          dechet.valorisationMatiere === 1 ||
          dechet.valorisationEnergetique === 1
        );
      } else if (filterByValorisation === "non-valorisable") {
        return dechet.nonValorisation === 1;
      }

      return true;
    }),
  );

  // Pagination logic
  const totalPages = $derived(Math.ceil(filteredDechets.length / itemsPerPage));
  const paginatedDechets = $derived(
    filteredDechets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
  );

  // Reset pagination when filters change
  $effect(() => {
    // Just acknowledging the dependency
    searchTerm;
    filterByValorisation;
    currentPage = 1;
  });

  // Format number with proper decimals
  function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }

  // Format large number with units
  function formatLargeNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + " M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + " K";
    }
    return value.toFixed(2);
  }

  // Helper for table checks
  function isChecked(value: number | null | undefined): boolean {
    return value === 1;
  }

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
      gap: "1rem",
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
    span: {
      fontWeight: 500,
    },
    div3: {
      marginBottom: "1.5rem",
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 640px)": "repeat(3, minmax(0, 1fr))",
      },
      gap: "1rem",
    },
    div4: {
      width: "24rem",
      backgroundColor: theme.base100,
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    p2: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 700,
    },
    span2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 400,
    },
    div5: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      gap: "1rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div6: {
      width: {
        default: "100%",
        "@media (min-width: 640px)": "16rem",
      },
    },
    button: {
      borderRadius: ".375rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(87.2% 0.01 258.338)",
      paddingInlineStart: "0.75rem",
      paddingInlineEnd: "0.75rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    X: {
      marginRight: "0.25rem",
      display: "inline",
      height: "1rem",
      width: "1rem",
    },
    div7: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    div8: {
      overflowX: "auto",
    },
    th: {
      minWidth: "18.75rem",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    th2: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    th3: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "right",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    th4: {
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "center",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    th5: {
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "center",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    th6: {
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "left",
      fontWeight: 600,
      whiteSpace: "nowrap",
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
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      verticalAlign: "top",
    },
    div9: {
      marginTop: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div10: {
      marginTop: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontStyle: "italic",
    },
    td2: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      verticalAlign: "top",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    td3: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "right",
      verticalAlign: "top",
      fontWeight: 500,
    },
    td4: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "right",
      verticalAlign: "top",
    },
    td5: {
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(96.7% 0.003 264.542)",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "center",
      verticalAlign: "top",
    },
    td6: {
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      textAlign: "center",
      verticalAlign: "top",
    },
    td7: {
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(96.7% 0.003 264.542)",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      verticalAlign: "top",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div11: {
      maxWidth: "9.375rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    td8: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      textAlign: "center",
    },
    div12: {
      marginTop: "1rem",
      display: "flex",
      gap: "1rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
  });
</script>

<svelte:head>
  <title>CERFA · Caractérisation des Déchets</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <CerfaTabs />

  <!-- Header Section -->
  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Caractérisation des déchets</h1>
      {#if data.projetInfo}
        <p class={stylex.attrs(styles.p).class}>
          Projet: <span class={stylex.attrs(styles.span).class}>{data.projetInfo.libelle}</span>
          (Réf: {data.projetInfo.reference})
        </p>
      {/if}
    </div>
    <a href="dechets/export?projetId={projetId}" class={stylex.attrs(ui.button).class}>
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Statistics Summary (Simplified) -->
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(ui.card, styles.div4).class}>
      <div class={stylex.attrs(ui.cardBody).class}>
        <p>Total déchets</p>
        <p class={stylex.attrs(styles.p2).class}>{stats.total}</p>
      </div>
    </div>
    <div class={stylex.attrs(ui.card, styles.div4).class}>
      <div class={stylex.attrs(ui.cardBody).class}>
        <p>Masse totale</p>
        <p class={stylex.attrs(styles.p2).class}>
          {formatLargeNumber(stats.totalMasse)}
          <span class={stylex.attrs(styles.span2).class}>kg</span>
        </p>
      </div>
    </div>
    <div class={stylex.attrs(ui.card, styles.div4).class}>
      <div class={stylex.attrs(ui.cardBody).class}>
        <p>Volume total</p>
        <p class={stylex.attrs(styles.p2).class}>
          {formatLargeNumber(stats.totalVolume)}
          <span class={stylex.attrs(styles.span2).class}>m³</span>
        </p>
      </div>
    </div>
  </div>

  <!-- Filters Section -->
  <div class={stylex.attrs(styles.div5).class}>
    <!-- Search -->
    <label class={stylex.attrs(ui.input, styles.label).class}>
      <Search />
      <input type="search" bind:value={searchTerm} placeholder="Rechercher..." />
    </label>

    <!-- Filter by valorisation -->
    <div class={stylex.attrs(styles.div6).class}>
      <select bind:value={filterByValorisation} class={stylex.attrs(ui.select).class}>
        <option value="all">Tous les déchets</option>
        <option value="valorisable">Valorisables</option>
        <option value="non-valorisable">Non valorisables</option>
      </select>
    </div>

    {#if searchTerm || filterByValorisation !== "all"}
      <button
        onclick={() => {
          searchTerm = "";
          filterByValorisation = "all";
        }}
        class={stylex.attrs(styles.button).class}
      >
        <X class={stylex.attrs(styles.X).class} />
        Reset
      </button>
    {/if}
  </div>

  <!-- Tableau des déchets (Simple & Clean) -->
  <div class={stylex.attrs(styles.div7).class}>
    <div class={stylex.attrs(styles.div8).class}>
      <table class={stylex.attrs(ui.table).class}>
        <thead>
          <tr>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Catégorie / Nature</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >Code</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
              >Masse (Kg)</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
              >Vol (m³)</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th4).class}>
              Diag.<br />filières?
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Réutili-<br />sation
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Recy-<br />clable
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Remblay-<br />age
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Incin.<br />avec valo.
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Incin.<br />sans valo.
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th5).class}>
              Enfouiss-<br />ment
            </th>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th6).class}
              >Conditions / Notes</th
            >
          </tr>
        </thead>
        <tbody class={stylex.attrs(styles.tbody).class}>
          {#each paginatedDechets as dechet, i (i)}
            <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                <div class={stylex.attrs(styles.span).class}>{dechet.categorie || "-"}</div>
                {#if dechet.objet && dechet.objet !== dechet.categorie}
                  <div class={stylex.attrs(styles.div9).class}>{dechet.objet}</div>
                {/if}
                {#if dechet.nature && dechet.nature !== dechet.objet}
                  <div class={stylex.attrs(styles.div10).class}>{dechet.nature}</div>
                {/if}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}>
                {dechet.codeDechet || "-"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td3).class}>
                {formatNumber(dechet.masse)}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td4).class}>
                {formatNumber(dechet.volume)}
              </td>

              <!-- Checklist columns -->
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td5).class}>
                {dechet.ecoOrganisme ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.reutilisation) ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.recyclable) ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.valorisationMatiere) ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.valorisationEnergetique) ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.incinerationSansValo) ? "☑" : "☐"}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td6).class}>
                {isChecked(dechet.nonValorisation) ? "☑" : "☐"}
              </td>
              <!-- End checklist columns -->

              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td7).class}>
                <div
                  class={stylex.attrs(styles.div11).class}
                  title={dechet.stockage || dechet.description || ""}
                >
                  {dechet.stockage || dechet.description || "-"}
                </div>
              </td>
            </tr>
          {:else}
            <tr class={stylex.attrs(ui.divideChild).class}>
              <td colspan="12" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td8).class}>
                Aucun résultat.
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <Pagination
      page={currentPage}
      {totalPages}
      totalItems={filteredDechets.length}
      perPage={itemsPerPage}
      onPageChange={(page) => (currentPage = page)}
    />
  </div>

  <div class={stylex.attrs(styles.div12).class}>
    <span>Légende :</span>
    <span>☑ = Oui / Applicable</span>
    <span>☐ = Non / Non applicable</span>
  </div>
</div>
