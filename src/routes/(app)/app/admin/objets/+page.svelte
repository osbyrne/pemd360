<script lang="ts">
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
</script>

<svelte:head>
  <title>Admin · Objets</title>
</svelte:head>

<!-- Header -->
<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <h1 class="text-2xl font-bold">Gestion des Objets</h1>
    <p class="mt-1 text-sm">Gérez la liste des objets et leurs catégories associées.</p>
  </div>
  <button onclick={openCreateModal} class="btn">
    <Plus class="h-4 w-4" />
    Ajouter
  </button>
</div>

<!-- Search Bar -->
<label class="input relative mb-6">
  <Search />
  <input type="search" bind:value={query} placeholder="Rechercher par objet ou catégorie..." />
</label>
<br />
<br />

<!-- Table -->
<div class="overflow-hidden">
  <div class="overflow-x-auto">
    <table class="table">
      <thead class="text-xs font-semibold uppercase">
        <tr>
          <th class="w-20 px-6 py-4">ID</th>
          <th class="px-6 py-4">Objet</th>
          <th class="px-6 py-4">Catégorie</th>
          <th class="w-32 px-6 py-4 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each displayedList as objet}
          <tr>
            <td class="px-6 py-4 font-mono">#{objet.id}</td>
            <td class="px-6 py-4 font-medium">{objet.objet}</td>
            <td class="px-6 py-4">
              {objet.categorieName}
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button onclick={() => openEditModal(objet)} class="btn btn-ghost" title="Modifier">
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  onclick={() => openDeleteModal(objet)}
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
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0"
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
          {isEditMode ? "Modifier l'objet" : "Nouvel objet"}
        </h2>
        <button onclick={closeModal} class="btn btn-ghost">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Modal Body -->
      <div class="overflow-y-auto p-6">
        <form
          action={isEditMode ? "?/update" : "?/create"}
          method="POST"
          use:enhance={handleFormResult}
          id="objetForm"
          class="space-y-4"
        >
          {#if isEditMode}
            <input type="hidden" name="id" value={form.id} />
          {/if}

          <div>
            <label for="objet" class="mb-1 block text-sm font-medium">
              Nom de l'objet <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="objet"
              name="objet"
              bind:value={form.objet}
              required
              class="input"
              placeholder="Ex: Porte intérieure"
            />
          </div>

          <div>
            <label for="categorieId" class="mb-1 block text-sm font-medium">
              Catégorie <span class="text-red-500">*</span>
            </label>
            <select
              id="categorieId"
              name="categorieId"
              bind:value={form.categorieId}
              required
              class="select"
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
      <div class="flex justify-end gap-3 px-6 py-4">
        <button type="button" onclick={closeModal} class="btn"> Annuler </button>
        <button type="submit" form="objetForm" class="btn">
          <Save class="h-4 w-4" />
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
