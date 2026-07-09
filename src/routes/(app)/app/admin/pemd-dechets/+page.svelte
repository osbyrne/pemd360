<script lang="ts">
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, Scale, Search } from "lucide-svelte";
  import PemdTabs from "$lib/components/PemdTabs.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ProjectFilter from "$lib/components/ProjectFilter.svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  let isDeleteModalOpen = $state(false);
  let currentItem = $state<any>(null);

  // Derived
  const displayedList = $derived(data?.list || []);
  const pagination = $derived(data.pagination);
  const totalMass = $derived(Number(data.totalMass) || 0);

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
  <title>Admin · PEMD - Déchets</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <PemdTabs />

  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Inventaire PEMD - Déchets</h1>
      <p class="mt-1 text-sm">Classification et traitement des déchets par projet.</p>
    </div>
    <a href="pemd-dechets/export{$pageStore.url.search}" class="btn">
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters & Stats -->
  <div class="mb-6 flex flex-col items-center gap-4 md:flex-row">
    <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
    <label class="input relative mb-6">
      <Search />
      <input
        type="search"
        value={query}
        oninput={handleSearchInput}
        placeholder="Rechercher par nature, code déchet, éco-organisme..."
      />
    </label>

    <!-- Total Mass Card -->
    <div
      class="flex w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 whitespace-nowrap text-emerald-800 shadow-sm transition-colors hover:bg-emerald-100 md:w-auto lg:h-11.5"
    >
      <div class="rounded-lg bg-emerald-100 p-1.5">
        <Scale class="h-5 w-5 text-emerald-600" />
      </div>
      <div class="flex flex-col md:flex-row md:items-baseline md:gap-2">
        <span class="text-xs font-semibold tracking-wider text-emerald-600/80 uppercase"
          >Masse Totale</span
        >
        <span class="text-lg font-bold"
          >{totalMass.toLocaleString("fr-FR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
          })} t</span
        >
      </div>
    </div>
  </div>

  <div class="rounded-xlshadow-sm overflow-hidden">
    <div class="overflow-x-auto">
      <table class="table">
        <thead class="text-xs font-semibold uppercase">
          <tr>
            <th class="px-6 py-4">Nature</th>
            <th class="px-6 py-4">Code déchet</th>
            <th class="px-6 py-4">Masse</th>
            <th class="px-6 py-4">Réutilisation sur site</th>
            <th class="px-6 py-4">Recyclable</th>
            <th class="px-6 py-4">Remblayage</th>
            <th class="px-6 py-4">Incinération valorisation énergétique</th>
            <th class="px-6 py-4">Non valorisation à enfouir</th>
            <th class="px-6 py-4">Incinération sans valorisation énergétique</th>
            <th class="px-6 py-4">Eco-organisme REP</th>
            <th class="px-6 py-4">Stockage</th>
            <th class="w-32 px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#if displayedList.length === 0}
            <tr>
              <td colspan="12" class="px-6 py-12 text-center">
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun déchet PEMD enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class="hover: transition-colors">
                <td class="px-6 py-4 font-medium">{item.nature || "-"}</td>
                <td class="px-6 py-4">{item.codeDechet || "-"}</td>
                <td class="px-6 py-4">{item.masse || "-"}</td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.reutilisation
                      ? 'bg-green-100 text-green-800'
                      : ' '}"
                  >
                    {item.reutilisation ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.recyclable
                      ? 'bg-blue-100 text-blue-800'
                      : ' '}"
                  >
                    {item.recyclable ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.valorisationMatiere
                      ? 'bg-emerald-100 text-emerald-800'
                      : ' '}"
                  >
                    {item.valorisationMatiere ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.valorisationEnergetique
                      ? 'bg-orange-100 text-orange-800'
                      : ' '}"
                  >
                    {item.valorisationEnergetique ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.nonValorisation
                      ? 'bg-red-100 text-red-800'
                      : ' '}"
                  >
                    {item.nonValorisation ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded px-2 py-1 text-xs font-medium {item.incinerationSansValorisationEnergetique
                      ? 'bg-purple-100 text-purple-800'
                      : ' '}"
                  >
                    {item.incinerationSansValorisationEnergetique ? "Oui" : "Non"}
                  </span>
                </td>
                <td class="px-6 py-4">{item.ecoOrganismeRep || "-"}</td>
                <td class="px-6 py-4">{item.stockage || "-"}</td>
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
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      perPage={pagination.perPage}
      onPageChange={(page) => updateUrl({ page: String(page) })}
    />
  </div>
</div>

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentItem?.nature || currentItem?.codeDechet || ""}
  itemId={currentItem?.id}
  onClose={closeModal}
/>
