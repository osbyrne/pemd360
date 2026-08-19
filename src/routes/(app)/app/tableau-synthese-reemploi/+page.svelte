<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Trash2, QrCode, Download, Search, X } from "lucide-svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  let isDeleteModalOpen = $state(false);
  let isQrModalOpen = $state(false);
  let currentItem = $state<any>(null);
  let qrItem = $state<any>(null);

  // Derived
  const displayedList = $derived(data?.list || []);
  const pagination = $derived(data.pagination);

  $effect(() => {
    query = data.q || "";
  });

  function updateUrl(params: Record<string, string | null>) {
    const url = new URL($pageStore.url);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }

    goto(url, { keepFocus: true, noScroll: true });
  }

  function handleProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    updateUrl({
      projectId: value || null,
      page: null,
    });
  }

  function handleSearchInput(event: Event) {
    query = (event.target as HTMLInputElement).value;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      updateUrl({
        q: query.trim() || null,
        page: null,
      });
    }, 300);
  }

  function goToPage(nextPage: number) {
    updateUrl({
      page: String(nextPage),
    });
  }

  function openDeleteModal(item: any) {
    currentItem = item;
    isDeleteModalOpen = true;
  }

  function openQrModal(item: any) {
    qrItem = item;
    isQrModalOpen = true;
  }

  function closeModal() {
    isDeleteModalOpen = false;
    isQrModalOpen = false;
    currentItem = null;
    qrItem = null;
  }

  function handleFormResult() {
    return async ({ result, update }: any) => {
      if (result.type === "success") {
        closeModal();
        await update();
      }
    };
  }

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
  }

  // Calcul du coefficient de réemploi (pourcentage)
  function getCoefficientReemploi(item: any): string {
    if (item.reemploi) {
      return "100%";
    } else if (item.potentielReemploi) {
      // Vous pouvez ajuster la logique selon vos besoins
      return item.potentielReemploi;
    }
    return "0%";
  }
</script>

<svelte:head>
  <title>Tableaux Synthèse Réemploi</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Tableaux Synthèse Réemploi</h1>
      <p class="mt-1 text-sm">
        Vue de synthèse des éléments PEMD avec potentiel de réemploi par projet.
      </p>
    </div>
    <a href="tableau-synthese-reemploi/export{$pageStore.url.search}" class="btn">
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters -->
  <div class="mb-6 flex flex-col gap-4 sm:flex-row">
    <!-- Project Selector -->
    <div class="w-full sm:w-64">
      <select class="select" value={data.selectedProjectId || ""} onchange={handleProjectChange}>
        <option value="">Tous les projets</option>
        {#each data.projects as project}
          <option value={project.id}>{project.libelle}</option>
        {/each}
      </select>
    </div>

    <!-- Search Bar -->
    <label class="input relative">
      <Search />
      <input type="search" value={query} oninput={handleSearchInput} placeholder="Rechercher..." />
    </label>
  </div>

  <div class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="text-xs font-semibold uppercase">
          <tr>
            <th class="px-6 py-4">Description</th>
            <th class="px-6 py-4">État</th>
            <th class="px-6 py-4">Étage</th>
            <th class="px-6 py-4">Potentiel réemploi</th>
            <th class="px-6 py-4">Coefficient réemploi</th>
            <th class="px-6 py-4">Miniature</th>
            <th class="px-6 py-4 text-center">QR code</th>
            <th class="w-32 px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#if displayedList.length === 0}
            <tr>
              <td colspan="8" class="px-6 py-12 text-center">
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun élément PEMD avec potentiel de réemploi.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class="hover: transition-colors">
                <td class="px-6 py-4 font-medium">{item.description || item.objet || "-"}</td>
                <td class="px-6 py-4">
                  {#if item.etat}
                    <span
                      class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {item.etat}
                    </span>
                  {:else}
                    <span class="">-</span>
                  {/if}
                </td>
                <td class="px-6 py-4">{item.etage || "-"}</td>
                <td class="px-6 py-4">
                  {#if item.potentielReemploi}
                    <span
                      class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                    >
                      {item.potentielReemploi}
                    </span>
                  {:else}
                    <span class="">-</span>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <span class="font-medium {item.reemploi ? 'text-green-600' : ''}">
                    {getCoefficientReemploi(item)}
                  </span>
                </td>
                <td class="px-6 py-4">
                  {#if item.imageHash}
                    <img
                      src={imageUrl(item.imageHash)}
                      alt="Miniature"
                      loading="lazy"
                      class="h-16 w-16 rounded object-cover shadow-sm"
                    />
                  {:else}
                    <span class="text-xs">N/A</span>
                  {/if}
                </td>
                <td class="px-6 py-4 text-center">
                  <button
                    onclick={() => openQrModal(item)}
                    class="hover: hover: inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors"
                    title="Afficher QR Code"
                  >
                    <QrCode class="h-4 w-4" />
                    <span class="hidden sm:inline">Voir</span>
                  </button>
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

    <!-- Pagination -->
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      perPage={pagination.perPage}
      onPageChange={goToPage}
    />
  </div>
</div>

<!-- Delete Modal -->
{#if isDeleteModalOpen}
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
    <div class="relative w-full max-w-md overflow-hidden rounded-xl shadow-xl">
      <div class="p-6">
        <h3 class="mb-2 text-lg font-semibold">Confirmer la suppression</h3>
        <p class="mb-6 text-sm">
          Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
        </p>
        <form method="POST" action="?/delete" use:enhance={handleFormResult()}>
          <input type="hidden" name="id" value={currentItem?.id} />
          <div class="flex justify-end gap-3">
            <button type="button" onclick={closeModal} class="btn"> Annuler </button>
            <button type="submit" class="btn btn-warning"> Supprimer </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- QR Code Modal -->
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
        <button onclick={closeModal} class="btn" aria-label="Fermer">
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
        <p class="mt-4 text-center text-sm font-medium">
          {qrItem?.objet || qrItem?.description}
        </p>
        {#if qrItem?.description && qrItem?.objet}
          <p class="mt-1 text-center text-xs">{qrItem.description}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
