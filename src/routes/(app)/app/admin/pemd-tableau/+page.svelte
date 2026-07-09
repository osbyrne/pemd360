<script lang="ts">
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, Search } from "lucide-svelte";
  import PemdTabs from "$lib/components/PemdTabs.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ProjectFilter from "$lib/components/ProjectFilter.svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  let isDeleteModalOpen = $state(false);
  let currentItem = $state<any>(null);

  // Derived
  const filteredList = $derived(
    (data?.list || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        item.groupe?.toLowerCase().includes(q) ||
        item.categorie?.toLowerCase().includes(q) ||
        item.objet?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.nature?.toLowerCase().includes(q) ||
        item.etat?.toLowerCase().includes(q) ||
        item.constitution?.toLowerCase().includes(q) ||
        item.etage?.toLowerCase().includes(q) ||
        item.typologieAppart?.toLowerCase().includes(q)
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

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
  }
</script>

<svelte:head>
  <title>Admin · PEMD - Tableau Général</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <PemdTabs />

  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Inventaire PEMD - Tableau Général</h1>
      <p class="mt-1 text-sm">
        Vue d'ensemble de l'inventaire Produits, Équipements, Matériaux et Déchets par projet.
      </p>
    </div>
    <a href="pemd-tableau/export{$pageStore.url.search}" class="btn">
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row">
    <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
    <label class="input relative mb-6">
      <Search />
      <input
        type="search"
        bind:value={query}
        placeholder="Rechercher par macro-catégorie, catégorie, objet ou projet..."
      />
    </label>
  </div>

  <div class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="text-xs font-semibold uppercase">
          <tr>
            <th class="px-6 py-4">Groupe</th>
            <th class="px-6 py-4">Catégorie</th>
            <th class="px-6 py-4">PEMD</th>
            <th class="px-6 py-4">Estimation d'âge</th>
            <th class="px-6 py-4">Quantité</th>
            <th class="px-6 py-4">Description</th>
            <th class="px-6 py-4">État</th>
            <th class="px-6 py-4">Nature</th>
            <th class="px-6 py-4">Surface (m²)</th>
            <th class="px-6 py-4">Épaisseur (m)</th>
            <th class="px-6 py-4">Densité</th>
            <th class="px-6 py-4">Masse (kg)</th>
            <th class="px-6 py-4">Constitution</th>
            <th class="px-6 py-4">Miniature</th>
            <th class="px-6 py-4">Étage</th>
            <th class="px-6 py-4">Typologie</th>
            <th class="w-32 px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#if displayedList.length === 0}
            <tr>
              <td colspan="17" class="px-6 py-12 text-center">
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun élément PEMD enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class="hover: transition-colors">
                <td class="px-6 py-4 font-medium">{item.groupe || "-"}</td>
                <td class="px-6 py-4">{item.categorie || "-"}</td>
                <td class="px-6 py-4">{item.objet || "-"}</td>
                <td class="px-6 py-4">{item.estimationAge || "-"}</td>
                <td class="px-6 py-4">{item.quantite || "-"}</td>
                <td class="px-6 py-4">{item.description || "-"}</td>
                <td class="px-6 py-4">{item.etat || "-"}</td>
                <td class="px-6 py-4">{item.nature || "-"}</td>
                <td class="px-6 py-4">{item.surface || "-"}</td>
                <td class="px-6 py-4">{item.epaisseur || "-"}</td>
                <td class="px-6 py-4">{item.densite || "-"}</td>
                <td class="px-6 py-4">{item.masse || "-"}</td>
                <td class="px-6 py-4">{item.constitution || "-"}</td>
                <td class="px-6 py-4">
                  {#if item.imageHash}
                    <img
                      src={imageUrl(item.imageHash)}
                      alt="Miniature"
                      loading="lazy"
                      class="h-12 w-12 rounded object-cover shadow-sm"
                    />
                  {:else}
                    <span class="text-xs">N/A</span>
                  {/if}
                </td>
                <td class="px-6 py-4">{item.etage || "-"}</td>
                <td class="px-6 py-4">{item.typologieAppart || "-"}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      onclick={() => openDeleteModal(item)}
                      class="rounded-lg p-1.5 transition-colors hover:bg-red-50 hover:text-red-600"
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

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentItem?.objet || currentItem?.description || ""}
  itemId={currentItem?.id}
  onClose={closeModal}
/>
