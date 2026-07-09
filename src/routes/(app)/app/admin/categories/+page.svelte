<script lang="ts">
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
</script>

<svelte:head>
  <title>Admin · Catégories</title>
</svelte:head>

<!-- Header -->
<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <h1 class="text-2xl font-bold">Gestion des Catégories</h1>
    <p class="mt-1 text-sm">Gérez la liste des catégories et leurs groupes associés.</p>
  </div>
  <button onclick={openCreateModal} class="btn">
    <Plus class="h-4 w-4" />
    Ajouter
  </button>
</div>

<!-- Search Bar -->
<label class="input relative mb-6">
  <Search />
  <input type="search" bind:value={query} placeholder="Rechercher par catégorie ou groupe..." />
</label>
<br />
<br />

<!-- Table -->
<div class="overflow-hidden rounded-xl shadow-sm">
  <div class="overflow-x-auto">
    <table class="table">
      <thead class="text-xs font-semibold uppercase">
        <tr>
          <th class="w-20 px-6 py-4">ID</th>
          <th class="px-6 py-4">Catégorie</th>
          <th class="px-6 py-4">Groupe</th>
          <th class="w-32 px-6 py-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each displayedList as category}
          <tr class="hover: transition-colors">
            <td class="px-6 py-4 font-mono">#{category.id}</td>
            <td class="px-6 py-4 font-medium">{category.categorie}</td>
            <td class="px-6 py-4">
              {#if category.groupeName}
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                >
                  {category.groupeName}
                </span>
              {:else}
                <span class="">-</span>
              {/if}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  onclick={() => openEditModal(category)}
                  class="btn btn-ghost"
                  title="Modifier"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  onclick={() => openDeleteModal(category)}
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
            <td colspan="4" class="px-6 py-12 text-center">
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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 backdrop-blur-sm transition-opacity"
      role="button"
      tabindex="-1"
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
    ></div>
    <div
      class="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-xl"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4">
        <h2 class="text-lg font-semibold">
          {isEditMode ? "Modifier la catégorie" : "Nouvelle catégorie"}
        </h2>
        <button onclick={closeModal} class="hover: transition-colors">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="overflow-y-auto p-6">
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="categoryForm"
          class="space-y-4"
        >
          {#if isEditMode}
            <input type="hidden" name="id" value={form.id} />
          {/if}

          <div>
            <label for="categorie" class="mb-1 block text-sm font-medium">
              Nom de la catégorie <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categorie"
              name="categorie"
              bind:value={form.categorie}
              required
              class="input"
              placeholder="Ex: Béton"
            />
          </div>

          <div>
            <label for="groupeId" class="mb-1 block text-sm font-medium">
              Groupe <span class="text-red-500">*</span>
            </label>
            <select
              id="groupeId"
              name="groupeId"
              bind:value={form.groupeId}
              required
              class="select"
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
      <div class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
        <button type="button" onclick={closeModal} class="btn"> Annuler </button>
        <button type="submit" form="categoryForm" class="btn">
          <Save class="h-4 w-4" />
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
