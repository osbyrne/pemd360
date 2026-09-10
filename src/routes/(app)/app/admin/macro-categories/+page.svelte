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

  let currentGroupe = $state<any>(null);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Derived
  const filteredList = $derived(
    (data.groupes || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return item.groupe?.toLowerCase().includes(q);
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

  // Form defaults
  let initialForm = {
    id: "",
    groupe: "",
  };

  let form = $state({ ...initialForm });

  function openCreateModal() {
    isEditMode = false;
    form = { ...initialForm };
    isModalOpen = true;
  }

  function openEditModal(groupe: any) {
    isEditMode = true;
    form = { ...groupe };
    isModalOpen = true;
  }

  function openDeleteModal(groupe: any) {
    currentGroupe = groupe;
    isDeleteModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    currentGroupe = null;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentGroupe = null;
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
    Plus: {
      height: "1rem",
      width: "1rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div3: {
      overflow: "hidden",
      borderRadius: ".75rem",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
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
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    td2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontWeight: 500,
    },
    div5: {
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
    div6: {
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
    div7: {
      position: "fixed",
      inset: 0,
      backdropFilter: "blur(8px)",
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div8: {
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
    div9: {
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
    div10: {
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
    div11: {
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
  <title>Admin · Macro-catégories</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Gestion des Macro-catégories</h1>
      <p class={stylex.attrs(styles.p).class}>Gérez la liste des macro-catégories (Groupes).</p>
    </div>
    <button onclick={openCreateModal} class={stylex.attrs(ui.button).class}>
      <Plus class={stylex.attrs(styles.Plus).class} />
      Ajouter
    </button>
  </div>

  <!-- Search Bar -->
  <label class={stylex.attrs(ui.input, styles.label).class}>
    <Search />
    <input type="search" bind:value={query} placeholder="Rechercher par macro-catégorie..." />
  </label>
  <br />
  <br />

  <!-- Table -->
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div4).class}>
      <table class={stylex.attrs(ui.table).class}>
        <thead class={stylex.attrs(styles.thead).class}>
          <tr>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >ID</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >Groupe</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
              >Actions</th
            >
          </tr>
        </thead>
        <tbody class={stylex.attrs(styles.tbody).class}>
          {#each displayedList as groupe}
            <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>#{groupe.id}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
                >{groupe.groupe}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
                <div class={stylex.attrs(styles.div5).class}>
                  <button
                    onclick={() => openEditModal(groupe)}
                    class={stylex.attrs(ui.button, ui.buttonGhost).class}
                    title="Modifier"
                  >
                    <Pencil class={stylex.attrs(styles.Plus).class} />
                  </button>
                  <button
                    onclick={() => openDeleteModal(groupe)}
                    class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonWarning).class}
                    title="Supprimer"
                  >
                    <Trash2 class={stylex.attrs(styles.Plus).class} />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr class={stylex.attrs(ui.divideChild).class}>
              <td colspan="3" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td3).class}>
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucune macro-catégorie enregistrée.
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
</div>

<!-- Create/Edit Modal -->
{#if isModalOpen}
  <div class={stylex.attrs(styles.div6).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(styles.div7).class}
      role="button"
      tabindex="-1"
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
    ></div>
    <div class={stylex.attrs(styles.div8).class}>
      <!-- Modal Header -->
      <div class={stylex.attrs(styles.div9).class}>
        <h2 class={stylex.attrs(styles.h2).class}>
          {isEditMode ? "Modifier la macro-catégorie" : "Nouvelle macro-catégorie"}
        </h2>
        <button onclick={closeModal} class={stylex.attrs(styles.tr).class}>
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>

      <!-- Modal Body -->
      <div class={stylex.attrs(styles.div10).class}>
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="groupeForm"
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
            <label for="groupe" class={stylex.attrs(styles.label2).class}>
              Nom du groupe <span class={stylex.attrs(styles.span).class}>*</span>
            </label>
            <input
              type="text"
              id="groupe"
              name="groupe"
              bind:value={form.groupe}
              required
              class={stylex.attrs(ui.input).class}
              placeholder="Ex: Déchets inertes"
            />
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class={stylex.attrs(styles.div11).class}>
        <button type="button" onclick={closeModal} class={stylex.attrs(ui.button).class}>
          Annuler
        </button>
        <button type="submit" form="groupeForm" class={stylex.attrs(ui.button).class}>
          <Save class={stylex.attrs(styles.Plus).class} />
          {isEditMode ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  </div>
{/if}

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentGroupe?.groupe || ""}
  itemId={currentGroupe?.id}
  onClose={closeDeleteModal}
/>
