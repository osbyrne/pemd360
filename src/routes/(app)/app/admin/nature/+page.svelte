<script lang="ts">
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
</script>

<svelte:head>
  <title>Admin · Nature</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <!-- Header -->
  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Gestion des Natures</h1>
      <p class="mt-1 text-sm">Gérez la liste des natures de déchets et leurs propriétés.</p>
    </div>
    <button onclick={openCreateModal} class="btn">
      <Plus class="h-4 w-4" />
      Ajouter
    </button>
  </div>

  <!-- Search Bar -->
  <label class="input relative mb-6">
    <Search />
    <input type="search" bind:value={query} placeholder="Rechercher par nature..." />
  </label>
  <br />
  <br />

  <!-- Table -->
  <div class="overflow-hidden rounded-xl shadow-sm">
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="text-xs font-semibold uppercase">
          <tr>
            <th class="px-6 py-4">Nature</th>
            <th class="px-6 py-4">Code Déchet</th>
            <th class="px-6 py-4">Densité</th>
            <th class="px-6 py-4 text-center">Recyclable</th>
            <th class="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each displayedList as nature}
            <tr>
              <td class="px-6 py-4 font-medium">{nature.nature}</td>
              <td class="px-6 py-4 font-mono">{nature.codeDechet || "-"}</td>
              <td class="px-6 py-4">{nature.densite || "-"}</td>
              <td class="px-6 py-4 text-center">
                {#if nature.recyclable}
                  <input type="checkbox" class="checkbox" disabled checked={true} />
                {:else}
                  <input type="checkbox" class="checkbox" disabled checked={false} />
                {/if}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-2">
                  <button
                    onclick={() => openEditModal(nature)}
                    class="btn btn-ghost"
                    title="Modifier"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>
                  <button
                    onclick={() => openDeleteModal(nature)}
                    class="btn btn-ghost btn-warning"
                    title="Supprimer"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="5" class="px-6 py-12 text-center">
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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <button
      type="button"
      class="fixed inset-0 h-full w-full cursor-default border-0 backdrop-blur-sm transition-opacity"
      onclick={closeModal}
      aria-label="Fermer la modal"
    ></button>
    <div
      class="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl shadow-xl"
    >
      <div class="flex items-center justify-between px-6 py-4">
        <h3 class="text-lg font-semibold">
          {isEditMode ? "Modifier la nature" : "Ajouter une nature"}
        </h3>
        <button onclick={closeModal} class="hover: hover: rounded-lg p-1">
          <X class="h-5 w-5" />
        </button>
      </div>

      <div class="overflow-y-auto p-6">
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="natureForm"
          class="space-y-6"
        >
          {#if isEditMode}
            <input type="hidden" name="id" value={form.id} />
          {/if}

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="nature" class="mb-1 block text-sm font-medium">Nature</label>
              <input
                id="nature"
                type="text"
                name="nature"
                required
                bind:value={form.nature}
                class="input"
                placeholder="Ex: Béton"
              />
            </div>

            <div>
              <label for="codeDechet" class="mb-1 block text-sm font-medium">Code Déchet</label>
              <input
                id="codeDechet"
                type="number"
                name="codeDechet"
                bind:value={form.codeDechet}
                class="input"
              />
            </div>

            <div>
              <label for="densite" class="mb-1 block text-sm font-medium">Densité</label>
              <input
                id="densite"
                type="number"
                step="0.01"
                name="densite"
                bind:value={form.densite}
                class="input"
              />
            </div>

            <div>
              <label for="stockage" class="mb-1 block text-sm font-medium">Stockage</label>
              <input
                id="stockage"
                type="text"
                name="stockage"
                bind:value={form.stockage}
                class="input"
              />
            </div>

            <div>
              <label for="ecoOrganismeRep" class="mb-1 block text-sm font-medium"
                >Eco Organisme REP</label
              >
              <input
                id="ecoOrganismeRep"
                type="text"
                name="ecoOrganismeRep"
                bind:value={form.ecoOrganismeRep}
                class="input"
              />
            </div>
          </div>

          <div class="border-t border-gray-100 pt-6">
            <h4 class="mb-4 text-sm font-medium">Propriétés (0 ou 1)</h4>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {#each booleanFields as item}
                <div class="flex items-center gap-3 rounded-lg p-3">
                  <input
                    type="checkbox"
                    id={item.key}
                    checked={Boolean(form[item.key])}
                    onchange={(e) => {
                      (form as any)[item.key] = e.currentTarget.checked ? 1 : 0;
                    }}
                    class="checkbox"
                  />
                  <input type="hidden" name={item.key} value={form[item.key]} />
                  <label for={item.key} class="flex-1 cursor-pointer text-sm select-none">
                    {item.label}
                  </label>
                </div>
              {/each}
            </div>
          </div>
        </form>
      </div>

      <div class="flex shrink-0 justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <button type="button" onclick={closeModal} class="btn"> Annuler </button>
        <button type="submit" form="natureForm" class="btn">
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
