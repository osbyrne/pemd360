<script lang="ts">
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
</script>

<svelte:head>
  <title>Admin · Risques</title>
</svelte:head>

<div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
  <div>
    <h1 class="text-2xl font-bold">Inventaire Risques</h1>
    <p class="mt-1 text-sm">Liste des tags amiante, plomb et termites détectés.</p>
  </div>
  <a href="risques/export{$pageStore.url.search}" class="btn">
    <Download />
    Exporter en Excel
  </a>
</div>

<div class="mb-4 flex flex-wrap gap-4">
  <label class="inline-flex cursor-pointer items-center gap-2">
    <input type="checkbox" class="checkbox" bind:checked={includeAmiante} />
    <span>Amiante</span>
  </label>
  <label class="inline-flex cursor-pointer items-center gap-2">
    <input type="checkbox" class="checkbox" bind:checked={includePlomb} />
    <span>Plomb</span>
  </label>
  <label class="inline-flex cursor-pointer items-center gap-2">
    <input type="checkbox" class="checkbox" bind:checked={includeTermites} />
    <span>Termites</span>
  </label>
</div>

<!-- Filters -->
<div class="mb-6 flex flex-col gap-4 sm:flex-row">
  <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
  <label class="input relative mb-6">
    <Search />
    <input
      type="search"
      bind:value={query}
      placeholder="Rechercher par label, description ou projet..."
    />
  </label>
  <br />
</div>

<table class="table">
  <thead class="text-xs font-semibold uppercase">
    <tr>
      <th class="px-6 py-4">Nom du prélèvement</th>
      <th class="px-6 py-4">Description</th>
      <th class="px-6 py-4">Localisation</th>
      <th class="px-6 py-4">Type</th>
      <th class="px-6 py-4">Miniature</th>
      <th class="w-32 px-6 py-4 text-center">Actions</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-100">
    {#if displayedList.length === 0}
      <tr>
        <td colspan="6" class="px-6 py-12 text-center">
          {#if query}
            Aucun résultat pour "{query}".
          {:else}
            Aucun tag risque enregistré.
          {/if}
        </td>
      </tr>
    {:else}
      {#each displayedList as item (item.uid)}
        <tr class="hover: transition-colors">
          <td class="px-6 py-4 font-medium"> {item.label} </td>
          <td class="px-6 py-4"> {item.description || "-"} </td>
          <td class="px-6 py-4"> {item.etage || "-"} </td>
          <td class="px-6 py-4"> {item.riskLabel || item.type || "-"} </td>
          <td class="px-6 py-4">
            {#if item.thumbnailUrl}
              <img
                src={item.thumbnailUrl}
                alt={item.label}
                class="h-12 w-12 rounded object-cover shadow-sm"
              />
            {:else}
              <span class="text-xs">N/A</span>
            {/if}
          </td>
          <td class="px-6 py-4">
            <div class="flex items-center justify-center gap-2">
              <button
                onclick={() => openDeleteModal(item)}
                class="btn btn-ghost btn-warning"
                title="Supprimer"
              >
                <Trash2 class="h-4 w-4" />
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
