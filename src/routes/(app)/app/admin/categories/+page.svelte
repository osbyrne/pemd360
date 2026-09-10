<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { enhance } from "$app/forms";
  import { Pencil, Trash2, Search, Plus, X, Save } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";

  let { data } = $props();

  let isModalOpen = $state(false);
  let isDeleteModalOpen = $state(false);
  let isEditMode = $state(false);

  let currentCategory = $state<any>(null);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Derived
  const filteredList = $derived(
    (data.categories || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        item.categorie?.toLowerCase().includes(q) || item.groupeName?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

  // Form defaults
  let initialForm = {
    id: "",
    categorie: "",
    groupeId: "",
  };

  let form = $state({ ...initialForm });

  function openCreateModal() {
    isEditMode = false;
    form = { ...initialForm };
    isModalOpen = true;
  }

  function openEditModal(category: any) {
    isEditMode = true;
    form = {
      id: category.id,
      categorie: category.categorie,
      groupeId: category.groupeId,
    };
    isModalOpen = true;
  }

  function openDeleteModal(category: any) {
    currentCategory = category;
    isDeleteModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    currentCategory = null;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentCategory = null;
  }

  function handleFormResult() {
    return async ({ result, update }: any) => {
      if (result.type === "success") {
        closeModal();
        await update();
      }
    };
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
    Plus: {
      height: "1rem",
      width: "1rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div2: {
      overflow: "hidden",
      borderRadius: ".75rem",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div3: {
      overflowX: "auto",
    },
    thead: {
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    th: {
      width: "5rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    th2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    th3: {
      width: "8rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      textAlign: "center",
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
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    td2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontWeight: 500,
    },
    span: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.2% 0.032 255.585)",
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(42.4% 0.199 265.638)",
    },
    div4: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    td3: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      textAlign: "center",
    },
    div5: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingRight: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingBottom: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingLeft: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
    },
    div6: {
      position: "fixed",
      inset: 0,
      backdropFilter: "blur(8px)",
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div7: {
      position: "relative",
      display: "flex",
      maxHeight: "90vh",
      width: "100%",
      maxWidth: "32rem",
      flexDirection: "column",
      overflow: "hidden",
      borderRadius: ".75rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div8: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    h2: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    X: {
      height: "1.25rem",
      width: "1.25rem",
    },
    div9: {
      overflowY: "auto",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    form: {
      "--stack-gap": "1rem",
    },
    label2: {
      marginBottom: "0.25rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    span2: {
      color: "oklch(63.7% 0.237 25.331)",
    },
    div10: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(96.7% 0.003 264.542)",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Catégories</title>
</svelte:head>

<!-- Header -->
<div class={stylex.attrs(styles.div).class}>
  <div>
    <h1 class={stylex.attrs(styles.h1).class}>Gestion des Catégories</h1>
    <p class={stylex.attrs(styles.p).class}>
      Gérez la liste des catégories et leurs groupes associés.
    </p>
  </div>
  <button onclick={openCreateModal} class={stylex.attrs(ui.button).class}>
    <Plus class={stylex.attrs(styles.Plus).class} />
    Ajouter
  </button>
</div>

<!-- Search Bar -->
<label class={stylex.attrs(ui.input, styles.label).class}>
  <Search />
  <input type="search" bind:value={query} placeholder="Rechercher par catégorie ou groupe..." />
</label>
<br />
<br />

<!-- Table -->
<div class={stylex.attrs(styles.div2).class}>
  <div class={stylex.attrs(styles.div3).class}>
    <table class={stylex.attrs(ui.table).class}>
      <thead class={stylex.attrs(styles.thead).class}>
        <tr>
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
            >ID</th
          >
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
            >Catégorie</th
          >
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
            >Groupe</th
          >
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
            >Actions</th
          >
        </tr>
      </thead>
      <tbody>
        {#each displayedList as category}
          <tr class={stylex.attrs(styles.tr).class}>
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>#{category.id}</td
            >
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
              >{category.categorie}</td
            >
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
              {#if category.groupeName}
                <span class={stylex.attrs(styles.span).class}>
                  {category.groupeName}
                </span>
              {:else}
                <span>-</span>
              {/if}
            </td>
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
              <div class={stylex.attrs(styles.div4).class}>
                <button
                  onclick={() => openEditModal(category)}
                  class={stylex.attrs(ui.button, ui.buttonGhost).class}
                  title="Modifier"
                >
                  <Pencil class={stylex.attrs(styles.Plus).class} />
                </button>
                <button
                  onclick={() => openDeleteModal(category)}
                  class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonWarning).class}
                  title="Supprimer"
                >
                  <Trash2 class={stylex.attrs(styles.Plus).class} />
                </button>
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="4" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td3).class}>
              {#if query}
                Aucun résultat pour "{query}".
              {:else}
                Aucune catégorie enregistrée.
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <Pagination
    {page}
    {totalPages}
    totalItems={filteredList.length}
    {perPage}
    onPageChange={(p) => (page = p)}
  />
</div>

<!-- Create/Edit Modal -->
{#if isModalOpen}
  <div class={stylex.attrs(styles.div5).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(styles.div6).class}
      role="button"
      tabindex="-1"
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
    ></div>
    <div class={stylex.attrs(styles.div7).class}>
      <!-- Modal Header -->
      <div class={stylex.attrs(styles.div8).class}>
        <h2 class={stylex.attrs(styles.h2).class}>
          {isEditMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h2>
        <button onclick={closeModal} class={stylex.attrs(styles.tr).class}>
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class={stylex.attrs(styles.div9).class}>
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="categoryForm"
          class={stylex.attrs(styles.form).class}
        >
          {#if isEditMode}
            <input
              class={stylex.attrs(styles.stackSpacing1).class}
              type="hidden"
              name="id"
              value={form.id}
            />
          {/if}

          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="categorie" class={stylex.attrs(styles.label2).class}>
              Nom de la catégorie <span class={stylex.attrs(styles.span2).class}>*</span>
            </label>
            <input
              type="text"
              id="categorie"
              name="categorie"
              bind:value={form.categorie}
              required
              class={stylex.attrs(ui.input).class}
              placeholder="Ex: Béton"
            />
          </div>

          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="groupeId" class={stylex.attrs(styles.label2).class}>
              Groupe <span class={stylex.attrs(styles.span2).class}>*</span>
            </label>
            <select
              id="groupeId"
              name="groupeId"
              bind:value={form.groupeId}
              required
              class={stylex.attrs(ui.select).class}
            >
              <option value="">Sélectionner un groupe</option>
              {#each data.groupes as groupe}
                <option value={groupe.id}>{groupe.groupe}</option>
              {/each}
            </select>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class={stylex.attrs(styles.div10).class}>
        <button type="button" onclick={closeModal} class={stylex.attrs(ui.button).class}>
          Annuler
        </button>
        <button type="submit" form="categoryForm" class={stylex.attrs(ui.button).class}>
          <Save class={stylex.attrs(styles.Plus).class} />
          {isEditMode ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  </div>
{/if}

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentCategory?.categorie || ""}
  itemId={currentCategory?.id}
  onClose={closeDeleteModal}
/>
