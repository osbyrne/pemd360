<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, Scale, Search } from "lucide-svelte";
  import PemdTabs from "$lib/components/PemdTabs.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ProjectFilter from "$lib/components/ProjectFilter.svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  let isDeleteModalOpen = $state(false);
  let currentItem = $state<any>(null);

  // Derived
  const displayedList = $derived(data?.list || []);
  const pagination = $derived(data.pagination);
  const totalMass = $derived(Number(data.totalMass) || 0);

  $effect(() => {
    query = data.q || "";
  });

  function updateUrl(params: Record<string, string | null>) {
    const url = new URL($pageStore.url);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }

    goto(url, { keepFocus: true, noScroll: true });
  }

  function handleSearchInput(event: Event) {
    query = (event.target as HTMLInputElement).value;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      updateUrl({
        q: query.trim() || null,
        page: null,
      });
    }, 300);
  }

  function openDeleteModal(item: any) {
    currentItem = item;
    isDeleteModalOpen = true;
  }

  function closeModal() {
    isDeleteModalOpen = false;
    currentItem = null;
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
    div3: {
      marginBottom: "1.5rem",
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 768px)": "row",
      },
      alignItems: "center",
      gap: "1rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div4: {
      display: "flex",
      width: {
        default: "100%",
        "@media (min-width: 768px)": "auto",
      },
      alignItems: "center",
      gap: "0.75rem",
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(90.5% 0.093 164.15)",
      backgroundColor: {
        default: "oklch(97.9% 0.021 166.113)",
        ":hover": "oklch(95% 0.052 163.051)",
      },
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      whiteSpace: "nowrap",
      color: "oklch(43.2% 0.095 166.913)",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      height: {
        "@media (min-width: 1024px)": "2.875rem",
      },
    },
    div5: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(95% 0.052 163.051)",
      paddingTop: "0.375rem",
      paddingRight: "0.375rem",
      paddingBottom: "0.375rem",
      paddingLeft: "0.375rem",
    },
    Scale: {
      height: "1.25rem",
      width: "1.25rem",
      color: "oklch(59.6% 0.145 163.225)",
    },
    div6: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 768px)": "row",
      },
      alignItems: {
        "@media (min-width: 768px)": "baseline",
      },
      gap: {
        "@media (min-width: 768px)": "0.5rem",
      },
    },
    span: {
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      letterSpacing: ".05em",
      color: "color-mix(in oklab, oklch(59.6% 0.145 163.225) 80%, transparent)",
      textTransform: "uppercase",
    },
    span2: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 700,
    },
    th2: {
      width: "8rem",
      textAlign: "center",
    },
    td2: {
      fontWeight: 500,
    },
    span3: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: ".25rem",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
    },
    div9: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    button: {
      borderRadius: ".5rem",
      paddingTop: "0.375rem",
      paddingRight: "0.375rem",
      paddingBottom: "0.375rem",
      paddingLeft: "0.375rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: {
        ":hover": "oklch(97.1% 0.013 17.38)",
      },
      color: {
        ":hover": "oklch(57.7% 0.245 27.325)",
      },
    },
    Trash2: {
      height: "1rem",
      width: "1rem",
    },
  });
</script>

<svelte:head>
  <title>Admin · PEMD - Déchets</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <PemdTabs />

  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Inventaire PEMD - Déchets</h1>
      <p class={stylex.attrs(styles.p).class}>
        Classification et traitement des déchets par projet.
      </p>
    </div>
    <a href="pemd-dechets/export{$pageStore.url.search}" class={stylex.attrs(ui.button).class}>
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters & Stats -->
  <div class={stylex.attrs(styles.div3).class}>
    <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
    <label class={stylex.attrs(ui.input, ui.searchField, styles.label).class}>
      <Search class={stylex.attrs(ui.searchIcon).class} aria-hidden="true" />
      <input
        class={stylex.attrs(ui.searchInput).class}
        aria-label="Rechercher par nature, code déchet, éco-organisme..."
        type="search"
        value={query}
        oninput={handleSearchInput}
        placeholder="Rechercher par nature, code déchet, éco-organisme..."
      />
    </label>

    <!-- Total Mass Card -->
    <div class={stylex.attrs(styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <Scale class={stylex.attrs(styles.Scale).class} />
      </div>
      <div class={stylex.attrs(styles.div6).class}>
        <span class={stylex.attrs(styles.span).class}>Masse Totale</span>
        <span class={stylex.attrs(styles.span2).class}
          >{totalMass.toLocaleString("fr-FR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          })} t</span
        >
      </div>
    </div>
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
              >Nature</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Code déchet</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Masse</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Réutilisation sur site</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Recyclable</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Remblayage</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Incinération valorisation énergétique</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Non valorisation à enfouir</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Incinération sans valorisation énergétique</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Eco-organisme REP</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Stockage</th
            >
            <th
              scope="col"
              class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >Actions</th
            >
          </tr>
        </thead>
        <tbody>
          {#if displayedList.length === 0}
            <tr class={stylex.attrs(ui.tableRow).class}>
              <td
                colspan="12"
                class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableEmpty).class}
              >
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun déchet PEMD enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class={stylex.attrs(ui.tableRow).class}>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
                  >{item.nature || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.codeDechet || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.masse || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.reutilisation ? [ui.bgGreen100, ui.textGreen800] : false,
                    ).class}
                  >
                    {item.reutilisation ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.recyclable ? [ui.bgBlue100, ui.textBlue800] : false,
                    ).class}
                  >
                    {item.recyclable ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.valorisationMatiere ? [ui.bgEmerald100, ui.textEmerald800] : false,
                    ).class}
                  >
                    {item.valorisationMatiere ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.valorisationEnergetique ? [ui.bgOrange100, ui.textOrange800] : false,
                    ).class}
                  >
                    {item.valorisationEnergetique ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.nonValorisation ? [ui.bgRed100, ui.textRed800] : false,
                    ).class}
                  >
                    {item.nonValorisation ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <span
                    class={stylex.attrs(
                      styles.span3,
                      item.incinerationSansValorisationEnergetique
                        ? [ui.bgPurple100, ui.textPurple800]
                        : false,
                    ).class}
                  >
                    {item.incinerationSansValorisationEnergetique ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.ecoOrganismeRep || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.stockage || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <div class={stylex.attrs(styles.div9).class}>
                    <button
                      onclick={() => openDeleteModal(item)}
                      class={stylex.attrs(styles.button).class}
                      title="Supprimer"
                    >
                      <Trash2 class={stylex.attrs(styles.Trash2).class} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      perPage={pagination.perPage}
      onPageChange={(page) => updateUrl({ page: String(page) })}
    />
  </div>
</div>

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentItem?.nature || currentItem?.codeDechet || ""}
  itemId={currentItem?.id}
  onClose={closeModal}
/>
