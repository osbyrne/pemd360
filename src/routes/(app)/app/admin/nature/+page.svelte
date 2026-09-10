<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { enhance } from "$app/forms";
  import { Pencil, Trash2, Plus, X, Search } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";

  let { data } = $props();

  let isModalOpen = $state(false);
  let isDeleteModalOpen = $state(false);
  let isEditMode = $state(false);

  let currentNature = $state<any>(null);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Derived
  const filteredList = $derived(
    (data.natures || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return item.nature?.toLowerCase().includes(q);
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

  // Form defaults
  let initialForm = {
    id: "",
    nature: "",
    reutilisation: 0,
    recyclable: 0,
    valorisationMatiere: 0,
    valorisationEnergetique: 0,
    densite: null,
    stockage: "",
    codeDechet: null,
    ecoOrganismeRep: "",
    incinerationSansValorisationEnergetique: 0,
    nonValorisation: 0,
  };

  let form = $state({ ...initialForm });

  const booleanFields: { key: keyof typeof initialForm; label: string }[] = [
    { key: "reutilisation", label: "Réutilisation" },
    { key: "recyclable", label: "Recyclable" },
    { key: "valorisationMatiere", label: "Valorisation Matière" },
    { key: "valorisationEnergetique", label: "Valorisation Énergétique" },
    { key: "incinerationSansValorisationEnergetique", label: "Incinération sans val. énerg." },
    { key: "nonValorisation", label: "Non Valorisation" },
  ];

  function openCreateModal() {
    isEditMode = false;
    form = { ...initialForm };
    isModalOpen = true;
  }

  function openEditModal(nature: any) {
    isEditMode = true;
    form = { ...nature };
    isModalOpen = true;
  }

  function openDeleteModal(nature: any) {
    currentNature = nature;
    isDeleteModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    currentNature = null;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentNature = null;
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
      textAlign: "center",
    },
    tbody: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.7% 0.003 264.542)",
    },
    td: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontWeight: 500,
    },
    td2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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
    button: {
      position: "fixed",
      inset: 0,
      height: "100%",
      width: "100%",
      cursor: "default",
      borderWidth: "0px",
      borderStyle: "solid",
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
      maxWidth: "42rem",
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
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    button2: {
      borderRadius: ".5rem",
      paddingTop: "0.25rem",
      paddingRight: "0.25rem",
      paddingBottom: "0.25rem",
      paddingLeft: "0.25rem",
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
      "--stack-gap": "1.5rem",
    },
    div10: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 640px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "1.5rem",
    },
    div11: {
      gridColumn: {
        "@media (min-width: 640px)": "span 2 / span 2",
      },
    },
    label2: {
      marginBottom: "0.25rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div12: {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(96.7% 0.003 264.542)",
      paddingTop: "1.5rem",
    },
    h4: {
      marginBottom: "1rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div13: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 640px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "1rem",
    },
    div14: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      borderRadius: ".5rem",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    label3: {
      flex: "1 1 0%",
      cursor: "pointer",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      userSelect: "none",
    },
    div15: {
      display: "flex",
      flexShrink: 0,
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
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Nature</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Gestion des Natures</h1>
      <p class={stylex.attrs(styles.p).class}>
        Gérez la liste des natures de déchets et leurs propriétés.
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
    <input type="search" bind:value={query} placeholder="Rechercher par nature..." />
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
              >Nature</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Code Déchet</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Densité</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >Recyclable</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >Actions</th
            >
          </tr>
        </thead>
        <tbody class={stylex.attrs(styles.tbody).class}>
          {#each displayedList as nature}
            <tr class={stylex.attrs(ui.divideChild).class}>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}
                >{nature.nature}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
                >{nature.codeDechet || "-"}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                >{nature.densite || "-"}</td
              >
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
                {#if nature.recyclable}
                  <input
                    type="checkbox"
                    class={stylex.attrs(ui.checkbox).class}
                    disabled
                    checked={true}
                  />
                {:else}
                  <input
                    type="checkbox"
                    class={stylex.attrs(ui.checkbox).class}
                    disabled
                    checked={false}
                  />
                {/if}
              </td>
              <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                <div class={stylex.attrs(styles.div5).class}>
                  <button
                    onclick={() => openEditModal(nature)}
                    class={stylex.attrs(ui.button, ui.buttonGhost).class}
                    title="Modifier"
                  >
                    <Pencil class={stylex.attrs(styles.Plus).class} />
                  </button>
                  <button
                    onclick={() => openDeleteModal(nature)}
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
              <td colspan="5" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td3).class}>
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucune nature enregistrée.
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
    <button
      type="button"
      class={stylex.attrs(styles.button).class}
      onclick={closeModal}
      aria-label="Fermer la modal"
    ></button>
    <div class={stylex.attrs(styles.div7).class}>
      <div class={stylex.attrs(styles.div8).class}>
        <h3 class={stylex.attrs(styles.h3).class}>
          {isEditMode ? "Modifier la nature" : "Ajouter une nature"}
        </h3>
        <button onclick={closeModal} class={stylex.attrs(styles.button2).class}>
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>

      <div class={stylex.attrs(styles.div9).class}>
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="natureForm"
          class={stylex.attrs(styles.form).class}
        >
          {#if isEditMode}
            <input
              class={stylex.attrs(styles.stackSpacing15).class}
              type="hidden"
              name="id"
              value={form.id}
            />
          {/if}

          <div class={stylex.attrs(styles.stackSpacing15, styles.div10).class}>
            <div class={stylex.attrs(styles.div11).class}>
              <label for="nature" class={stylex.attrs(styles.label2).class}>Nature</label>
              <input
                id="nature"
                type="text"
                name="nature"
                required
                bind:value={form.nature}
                class={stylex.attrs(ui.input).class}
                placeholder="Ex: Béton"
              />
            </div>

            <div>
              <label for="codeDechet" class={stylex.attrs(styles.label2).class}>Code Déchet</label>
              <input
                id="codeDechet"
                type="number"
                name="codeDechet"
                bind:value={form.codeDechet}
                class={stylex.attrs(ui.input).class}
              />
            </div>

            <div>
              <label for="densite" class={stylex.attrs(styles.label2).class}>Densité</label>
              <input
                id="densite"
                type="number"
                step="0.01"
                name="densite"
                bind:value={form.densite}
                class={stylex.attrs(ui.input).class}
              />
            </div>

            <div>
              <label for="stockage" class={stylex.attrs(styles.label2).class}>Stockage</label>
              <input
                id="stockage"
                type="text"
                name="stockage"
                bind:value={form.stockage}
                class={stylex.attrs(ui.input).class}
              />
            </div>

            <div>
              <label for="ecoOrganismeRep" class={stylex.attrs(styles.label2).class}
                >Eco Organisme REP</label
              >
              <input
                id="ecoOrganismeRep"
                type="text"
                name="ecoOrganismeRep"
                bind:value={form.ecoOrganismeRep}
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>

          <div class={stylex.attrs(styles.stackSpacing15, styles.div12).class}>
            <h4 class={stylex.attrs(styles.h4).class}>Propriétés (0 ou 1)</h4>
            <div class={stylex.attrs(styles.div13).class}>
              {#each booleanFields as item}
                <div class={stylex.attrs(styles.div14).class}>
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={Boolean(form[item.key])}
                    onchange={(e) => {
                      (form as any)[item.key] = e.currentTarget.checked ? 1 : 0;
                    }}
                    class={stylex.attrs(ui.checkbox).class}
                  />
                  <input type="hidden" name={item.key} value={form[item.key]} />
                  <label for={item.key} class={stylex.attrs(styles.label3).class}>
                    {item.label}
                  </label>
                </div>
              {/each}
            </div>
          </div>
        </form>
      </div>

      <div class={stylex.attrs(styles.div15).class}>
        <button type="button" onclick={closeModal} class={stylex.attrs(ui.button).class}>
          Annuler
        </button>
        <button type="submit" form="natureForm" class={stylex.attrs(ui.button).class}>
          {isEditMode ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </div>
  </div>
{/if}

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentNature?.nature || ""}
  itemId={currentNature?.id}
  onClose={closeDeleteModal}
/>
