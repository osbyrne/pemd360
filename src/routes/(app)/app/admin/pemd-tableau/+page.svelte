<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, Search } from "lucide-svelte";
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

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
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
        "@media (min-width: 640px)": "row",
      },
      gap: "1rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    th2: {
      width: "8rem",
      textAlign: "center",
    },
    td2: {
      fontWeight: 500,
    },
    img: {
      height: "3rem",
      width: "3rem",
      borderRadius: ".25rem",
      objectFit: "cover",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    span: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div6: {
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
  <title>Admin · PEMD - Tableau Général</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <PemdTabs />

  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Inventaire PEMD - Tableau Général</h1>
      <p class={stylex.attrs(styles.p).class}>
        Vue d'ensemble de l'inventaire Produits, Équipements, Matériaux et Déchets par projet.
      </p>
    </div>
    <a href="pemd-tableau/export{$pageStore.url.search}" class={stylex.attrs(ui.button).class}>
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters -->
  <div class={stylex.attrs(styles.div3).class}>
    <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
    <label class={stylex.attrs(ui.input, ui.searchField, styles.label).class}>
      <Search class={stylex.attrs(ui.searchIcon).class} aria-hidden="true" />
      <input
        class={stylex.attrs(ui.searchInput).class}
        aria-label="Rechercher par macro-catégorie, catégorie, objet ou projet..."
        type="search"
        value={query}
        oninput={handleSearchInput}
        placeholder="Rechercher par macro-catégorie, catégorie, objet ou projet..."
      />
    </label>
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
              >Groupe</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Catégorie</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >PEMD</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Estimation d'âge</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Quantité</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Description</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >État</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Nature</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Surface (m²)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Épaisseur (m)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Densité</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Masse (kg)</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Constitution</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Miniature</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Étage</th
            >
            <th scope="col" class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
              >Typologie</th
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
                colspan="17"
                class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableEmpty).class}
              >
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun élément PEMD enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class={stylex.attrs(ui.tableRow).class}>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
                  >{item.groupe || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.categorie || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.objet || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.estimationAge || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.quantite || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.description || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.etat || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.nature || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.surface || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.epaisseur || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.densite || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.masse || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.constitution || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  {#if item.imageHash}
                    <img
                      src={imageUrl(item.imageHash)}
                      alt="Miniature"
                      loading="lazy"
                      class={stylex.attrs(styles.img).class}
                    />
                  {:else}
                    <span class={stylex.attrs(styles.span).class}>N/A</span>
                  {/if}
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>{item.etage || "-"}</td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}
                  >{item.typologieAppart || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule).class}>
                  <div class={stylex.attrs(styles.div6).class}>
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
  itemLabel={currentItem?.objet || currentItem?.description || ""}
  itemId={currentItem?.id}
  onClose={closeModal}
/>
