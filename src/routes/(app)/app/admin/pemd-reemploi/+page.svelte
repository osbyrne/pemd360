<script lang="ts">
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, X, Search } from "lucide-svelte";
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
  let isQrModalOpen = $state(false);
  let isCardModalOpen = $state(false);
  let qrItem = $state<any>(null);
  let cardItem = $state<any>(null);

  // Derived
  const filteredList = $derived(
    (data?.list || []).filter((item: any) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        item.objet?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.etat?.toLowerCase().includes(q) ||
        item.etage?.toLowerCase().includes(q) ||
        item.potentielReemploi?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredList.length / perPage));
  const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

  function openDeleteModal(item: any) {
    currentItem = item;
    isDeleteModalOpen = true;
  }

  function openQrModal(item: any) {
    qrItem = item;
    isQrModalOpen = true;
  }

  function openCardModal(item: any) {
    cardItem = item;
    isCardModalOpen = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentItem = null;
  }

  function closeModal() {
    isQrModalOpen = false;
    isCardModalOpen = false;
    qrItem = null;
    cardItem = null;
  }

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
  }
</script>

<svelte:head>
  <title>Admin · PEMD - Réemploi</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <PemdTabs />

  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Inventaire PEMD - Réemploi</h1>
      <p class="mt-1 text-sm">Gestion des éléments destinés au réemploi par projet.</p>
    </div>
    <a href="pemd-reemploi/export{$pageStore.url.search}" class="btn">
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
            <th class="px-6 py-4">PEMD</th>
            <th class="px-6 py-4">Description</th>
            <th class="px-6 py-4">État</th>
            <th class="px-6 py-4">Étage</th>
            <th class="px-6 py-4">Potentiel réemploi</th>
            <th class="px-6 py-4">Coefficient réemploi</th>
            <th class="px-6 py-4">Miniature</th>
            <th class="px-6 py-4">QR code</th>
            <th class="w-32 px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#if displayedList.length === 0}
            <tr>
              <td colspan="9" class="px-6 py-12 text-center">
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun élément PEMD réemploi enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class="hover: transition-colors">
                <td class="px-6 py-4 font-medium">{item.objet || "-"}</td>
                <td class="px-6 py-4">{item.description || "-"}</td>
                <td class="px-6 py-4">{item.etat || "-"}</td>
                <td class="px-6 py-4">{item.etage || "-"}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {item.potentielReemploi
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'}"
                  >
                    {item.potentielReemploi ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">{item.reemploi ?? "-"}</td>
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
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button
                      onclick={() => openQrModal(item)}
                      class="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 transition-colors hover:bg-blue-200"
                      title="Afficher QR Code"
                    >
                      QR Code
                    </button>
                    <button
                      onclick={() => openCardModal(item)}
                      class="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-200"
                      title="Voir la carte"
                    >
                      Voir la carte
                    </button>
                  </div>
                </td>
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
  onClose={closeDeleteModal}
/>

{#if isQrModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 backdrop-blur-sm transition-opacity"
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="-1"
    ></div>
    <div class="relative w-full max-w-md overflow-hidden rounded-xl p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-semibold">QR Code</h3>
        <button onclick={closeModal} class="hover: transition-colors" aria-label="Fermer">
          <X class="h-6 w-6" />
        </button>
      </div>
      <div class="flex flex-col items-center">
        <div class="rounded-lg border-2 border-gray-200 p-4">
          <!-- Placeholder pour le QR Code - à remplacer par une vraie bibliothèque QR -->
          <div class="flex h-48 w-48 items-center justify-center">
            <span class="text-center text-sm">QR Code<br />{qrItem?.id}</span>
          </div>
        </div>
        <p class="mt-4 text-center text-sm">{qrItem?.objet}</p>
      </div>
    </div>
  </div>
{/if}

{#if isCardModalOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 backdrop-blur-sm transition-opacity"
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="-1"
    ></div>
    <div class="relative w-full max-w-2xl overflow-hidden rounded-xl shadow-xl">
      <div class="flex items-center justify-between p-6">
        <h3 class="text-xl font-semibold">Carte PEMD</h3>
        <button onclick={closeModal} class="hover: transition-colors" aria-label="Fermer">
          <X class="h-6 w-6" />
        </button>
      </div>

      <div class="p-6">
        <h4 class="mb-2 text-lg font-medium">{cardItem?.objet}</h4>
        <p class="mb-6 text-sm">{cardItem?.description || "Aucune description"}</p>

        {#if cardItem?.imageHash}
          <div class="mb-6">
            <img
              src={imageUrl(cardItem.imageHash)}
              alt={cardItem.objet}
              loading="lazy"
              class="h-64 w-full rounded-lg object-cover shadow-sm"
            />
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div class="rounded-lg p-4">
            <p class="mb-1 text-xs uppercase">Localisation</p>
            <p class="text-sm font-medium">Étage {cardItem?.etage || "N/A"}</p>
          </div>

          <div class="rounded-lg p-4">
            <p class="mb-1 text-xs uppercase">État</p>
            <p class="text-sm font-medium">{cardItem?.etat || "N/A"}</p>
          </div>

          <div class="rounded-lg p-4">
            <p class="mb-1 text-xs uppercase">Coefficient de réemploi</p>
            <p class="text-sm font-medium">{cardItem?.reemploi ?? "N/A"}</p>
          </div>

          <div class="rounded-lg p-4">
            <p class="mb-1 text-xs uppercase">Masse</p>
            <p class="text-sm font-medium">
              {cardItem?.masse ? `${cardItem.masse} Kg` : "N/A"}
            </p>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button onclick={closeModal} class="btn"> Fermer </button>
        </div>
      </div>
    </div>
  </div>
{/if}
