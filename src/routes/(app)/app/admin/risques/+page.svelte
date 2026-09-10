<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, Search } from "lucide-svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ProjectFilter from "$lib/components/ProjectFilter.svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);
  let includeAmiante = $state(true);
  let includePlomb = $state(true);
  let includeTermites = $state(true);

  let isDeleteModalOpen = $state(false);
  let currentItem = $state<any>(null);

  // Derived
  const filteredList = $derived(
    data.list.filter((item: any) => {
      if (item.riskType === "amiante" && !includeAmiante) return false;
      if (item.riskType === "plomb" && !includePlomb) return false;
      if (item.riskType === "termites" && !includeTermites) return false;

      if (!query) return true;
      const q = query.toLowerCase();
      return (
        item.label?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.projetNom?.toLowerCase().includes(q) ||
        item.riskLabel?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

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
    div2: {
      marginBottom: "1rem",
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
    },
    label: {
      display: "inline-flex",
      cursor: "pointer",
      alignItems: "center",
      gap: "0.5rem",
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
    label2: {
      position: "relative",
      marginBottom: "1.5rem",
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
    th2: {
      width: "8rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      textAlign: "center",
    },
    tbody: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.7% 0.003 264.542)",
    },
    td: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      textAlign: "center",
    },
    tr: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    td2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
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
    div4: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    Trash2: {
      height: "1rem",
      width: "1rem",
    },
  });
</script>

<svelte:head>
  <title>Admin · Risques</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <div>
    <h1 class={stylex.attrs(styles.h1).class}>Inventaire Risques</h1>
    <p class={stylex.attrs(styles.p).class}>Liste des tags amiante, plomb et termites détectés.</p>
  </div>
  <a href="risques/export{$pageStore.url.search}" class={stylex.attrs(ui.button).class}>
    <Download />
    Exporter en Excel
  </a>
</div>

<div class={stylex.attrs(styles.div2).class}>
  <label class={stylex.attrs(styles.label).class}>
    <input type="checkbox" class={stylex.attrs(ui.checkbox).class} bind:checked={includeAmiante} />
    <span>Amiante</span>
  </label>
  <label class={stylex.attrs(styles.label).class}>
    <input type="checkbox" class={stylex.attrs(ui.checkbox).class} bind:checked={includePlomb} />
    <span>Plomb</span>
  </label>
  <label class={stylex.attrs(styles.label).class}>
    <input type="checkbox" class={stylex.attrs(ui.checkbox).class} bind:checked={includeTermites} />
    <span>Termites</span>
  </label>
</div>

<!-- Filters -->
<div class={stylex.attrs(styles.div3).class}>
  <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
  <label class={stylex.attrs(ui.input, styles.label2).class}>
    <Search />
    <input
      type="search"
      bind:value={query}
      placeholder="Rechercher par label, description ou projet..."
    />
  </label>
  <br />
</div>

<table class={stylex.attrs(ui.table).class}>
  <thead class={stylex.attrs(styles.thead).class}>
    <tr>
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
        >Nom du prélèvement</th
      >
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
        >Description</th
      >
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
        >Localisation</th
      >
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
        >Type</th
      >
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
        >Miniature</th
      >
      <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
        >Actions</th
      >
    </tr>
  </thead>
  <tbody class={stylex.attrs(styles.tbody).class}>
    {#if displayedList.length === 0}
      <tr class={stylex.attrs(ui.divideChild).class}>
        <td colspan="6" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
          {#if query}
            Aucun résultat pour "{query}".
          {:else}
            Aucun tag risque enregistré.
          {/if}
        </td>
      </tr>
    {:else}
      {#each displayedList as item (item.uid)}
        <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}> {item.label} </td>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
            {item.description || "-"}
          </td>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
            {item.etage || "-"}
          </td>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
            {item.riskLabel || item.type || "-"}
          </td>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
            {#if item.thumbnailUrl}
              <img
                src={item.thumbnailUrl}
                alt={item.label}
                class={stylex.attrs(styles.img).class}
              />
            {:else}
              <span class={stylex.attrs(styles.span).class}>N/A</span>
            {/if}
          </td>
          <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
            <div class={stylex.attrs(styles.div4).class}>
              <button
                onclick={() => openDeleteModal(item)}
                class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonWarning).class}
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

<Pagination
  {page}
  {totalPages}
  totalItems={filteredList.length}
  {perPage}
  onPageChange={(p) => (page = p)}
/>

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentItem?.label || ""}
  itemId={currentItem?.id}
  riskType={currentItem?.riskType}
  onClose={closeModal}
/>
