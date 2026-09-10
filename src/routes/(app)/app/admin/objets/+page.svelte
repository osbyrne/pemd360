<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { enhance } from "$app/forms";
  import { Pencil, Trash2, Plus, X, Save, Search } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";

  let { data } = $props();

  let isModalOpen = $state(false);
  let isDeleteModalOpen = $state(false);
  let isEditMode = $state(false);

  let currentObjet = $state<any>(null);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Derived
  const filteredList = $derived(
    (data.objets || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return item.objet?.toLowerCase().includes(q) || item.categorieName?.toLowerCase().includes(q);
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

  // Form defaults
  let initialForm = {
    id: "",
    objet: "",
    categorieId: "",
  };

  let form = $state({ ...initialForm });

  function openCreateModal() {
    isEditMode = false;
    form = { ...initialForm };
    isModalOpen = true;
  }

  function openEditModal(objet: any) {
    isEditMode = true;
    form = {
      id: objet.id,
      objet: objet.objet,
      categorieId: objet.categorieId,
    };
    isModalOpen = true;
  }

  function openDeleteModal(objet: any) {
    currentObjet = objet;
    isDeleteModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    currentObjet = null;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentObjet = null;
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
    span: {
      color: "oklch(63.7% 0.237 25.331)",
    },
    div10: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Objets</title>
</svelte:head>

<!-- Header -->
<div class={stylex.attrs(styles.div).class}>
  <div>
    <h1 class={stylex.attrs(styles.h1).class}>Gestion des Objets</h1>
    <p class={stylex.attrs(styles.p).class}>
      Gérez la liste des objets et leurs catégories associées.
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
  <input type="search" bind:value={query} placeholder="Rechercher par objet ou catégorie..." />
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
            >Objet</th
          >
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
            >Catégorie</th
          >
          <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
            >Actions</th
          >
        </tr>
      </thead>
      <tbody>
        {#each displayedList as objet}
          <tr>
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>#{objet.id}</td>
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}>{objet.objet}</td
            >
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
              {objet.categorieName}
            </td>
            <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
              <div class={stylex.attrs(styles.div4).class}>
                <button
                  onclick={() => openEditModal(objet)}
                  class={stylex.attrs(ui.button, ui.buttonGhost).class}
                  title="Modifier"
                >
                  <Pencil class={stylex.attrs(styles.Plus).class} />
                </button>
                <button
                  onclick={() => openDeleteModal(objet)}
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
                Aucun objet enregistré.
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
          {isEditMode ? "Modifier l'objet" : "Nouvel objet"}
        </h2>
        <button onclick={closeModal} class={stylex.attrs(ui.button, ui.buttonGhost).class}>
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class={stylex.attrs(styles.div9).class}>
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="objetForm"
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
            <label for="objet" class={stylex.attrs(styles.label2).class}>
              Nom de l'objet <span class={stylex.attrs(styles.span).class}>*</span>
            </label>
            <input
              type="text"
              id="objet"
              name="objet"
              bind:value={form.objet}
              required
              class={stylex.attrs(ui.input).class}
              placeholder="Ex: Porte intérieure"
            />
          </div>

          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="categorieId" class={stylex.attrs(styles.label2).class}>
              Catégorie <span class={stylex.attrs(styles.span).class}>*</span>
            </label>
            <select
              id="categorieId"
              name="categorieId"
              bind:value={form.categorieId}
              required
              class={stylex.attrs(ui.select).class}
            >
              <option value="">Sélectionner une catégorie</option>
              {#each data.categories as category}
                <option value={category.id}>{category.categoriev2}</option>
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
        <button type="submit" form="objetForm" class={stylex.attrs(ui.button).class}>
          <Save class={stylex.attrs(styles.Plus).class} />
          {isEditMode ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  </div>
{/if}

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentObjet?.objet || ""}
  itemId={currentObjet?.id}
  onClose={closeDeleteModal}
/>
