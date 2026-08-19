<script lang="ts">
  import CerfaTabs from "$lib/components/CerfaTabs.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Search, X, Download } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  // Get projetId from URL params
  const projetId = $derived($page.url.searchParams.get("projetId") || "");

  // Search functionality
  let searchTerm = $state("");
  let filterByValorisation = $state<string>("all"); // all, valorisable, non-valorisable

  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = 10;

  // Calculate statistics
  const stats = $derived({
    total: data.dechets.length,
    totalMasse: data.dechets.reduce((sum, d) => sum + (d.masse || 0), 0),
    totalVolume: data.dechets.reduce((sum, d) => sum + (d.volume || 0), 0),
  });

  // Filter dechets based on search and filters
  const filteredDechets = $derived(
    data.dechets.filter((dechet) => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          dechet.categorie?.toLowerCase().includes(search) ||
          dechet.objet?.toLowerCase().includes(search) ||
          dechet.nature?.toLowerCase().includes(search) ||
          dechet.codeDechet?.toString().includes(search);
        if (!matchesSearch) return false;
      }

      // Valorisation filter
      if (filterByValorisation === "valorisable") {
        return (
          dechet.recyclable === 1 ||
          dechet.reutilisation === 1 ||
          dechet.valorisationMatiere === 1 ||
          dechet.valorisationEnergetique === 1
        );
      } else if (filterByValorisation === "non-valorisable") {
        return dechet.nonValorisation === 1;
      }

      return true;
    }),
  );

  // Pagination logic
  const totalPages = $derived(Math.ceil(filteredDechets.length / itemsPerPage));
  const paginatedDechets = $derived(
    filteredDechets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
  );

  // Reset pagination when filters change
  $effect(() => {
    // Just acknowledging the dependency
    searchTerm;
    filterByValorisation;
    currentPage = 1;
  });

  // Format number with proper decimals
  function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }

  // Format large number with units
  function formatLargeNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + " M";
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + " K";
    }
    return value.toFixed(2);
  }

  // Helper for table checks
  function isChecked(value: number | null | undefined): boolean {
    return value === 1;
  }
</script>

<svelte:head>
  <title>CERFA · Caractérisation des Déchets</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <CerfaTabs />

  <!-- Header Section -->
  <div class="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 class="text-2xl font-bold">Caractérisation des déchets</h1>
      {#if data.projetInfo}
        <p class="mt-1 text-sm">
          Projet: <span class="font-medium">{data.projetInfo.libelle}</span>
          (Réf: {data.projetInfo.reference})
        </p>
      {/if}
    </div>
    <a href="dechets/export?projetId={projetId}" class="btn">
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Statistics Summary (Simplified) -->
  <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="card w-96 bg-base-100 shadow-sm">
      <div class="card-body">
        <p class="">Total déchets</p>
        <p class="text-xl font-bold">{stats.total}</p>
      </div>
    </div>
    <div class="card w-96 bg-base-100 shadow-sm">
      <div class="card-body">
        <p class="">Masse totale</p>
        <p class="text-xl font-bold">
          {formatLargeNumber(stats.totalMasse)}
          <span class="text-sm font-normal">kg</span>
        </p>
      </div>
    </div>
    <div class="card w-96 bg-base-100 shadow-sm">
      <div class="card-body">
        <p class="">Volume total</p>
        <p class="text-xl font-bold">
          {formatLargeNumber(stats.totalVolume)}
          <span class="text-sm font-normal">m³</span>
        </p>
      </div>
    </div>
  </div>

  <!-- Filters Section -->
  <div class="flex flex-col gap-4 sm:flex-row">
    <!-- Search -->
    <label class="input relative mb-6">
      <Search />
      <input type="search" bind:value={searchTerm} placeholder="Rechercher..." />
    </label>

    <!-- Filter by valorisation -->
    <div class="w-full sm:w-64">
      <select bind:value={filterByValorisation} class="select">
        <option value="all">Tous les déchets</option>
        <option value="valorisable">Valorisables</option>
        <option value="non-valorisable">Non valorisables</option>
      </select>
    </div>

    {#if searchTerm || filterByValorisation !== "all"}
      <button
        onclick={() => {
          searchTerm = "";
          filterByValorisation = "all";
        }}
        class="hover: hover: rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors"
      >
        <X class="mr-1 inline h-4 w-4" />
        Reset
      </button>
    {/if}
  </div>

  <!-- Tableau des déchets (Simple & Clean) -->
  <div class="flex flex-col overflow-hidden">
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th class="min-w-75 px-4 py-3 font-semibold whitespace-nowrap">Catégorie / Nature</th>
            <th class="px-4 py-3 font-semibold whitespace-nowrap">Code</th>
            <th class="px-4 py-3 text-right font-semibold whitespace-nowrap">Masse (Kg)</th>
            <th class="px-4 py-3 text-right font-semibold whitespace-nowrap">Vol (m³)</th>
            <th
              class="border-l border-gray-200 px-2 py-3 text-center text-xs font-semibold whitespace-nowrap"
            >
              Diag.<br />filières?
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Réutili-<br />sation
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Recy-<br />clable
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Remblay-<br />age
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Incin.<br />avec valo.
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Incin.<br />sans valo.
            </th>
            <th class="px-2 py-3 text-center text-xs font-semibold whitespace-nowrap">
              Enfouiss-<br />ment
            </th>
            <th class="border-l border-gray-200 px-4 py-3 text-left font-semibold whitespace-nowrap"
              >Conditions / Notes</th
            >
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          {#each paginatedDechets as dechet, i (i)}
            <tr class="hover: transition-colors">
              <td class="px-4 py-3 align-top">
                <div class="font-medium">{dechet.categorie || "-"}</div>
                {#if dechet.objet && dechet.objet !== dechet.categorie}
                  <div class="mt-0.5 text-xs">{dechet.objet}</div>
                {/if}
                {#if dechet.nature && dechet.nature !== dechet.objet}
                  <div class="mt-0.5 text-xs italic">{dechet.nature}</div>
                {/if}
              </td>
              <td class="px-4 py-3 align-top font-mono text-xs">
                {dechet.codeDechet || "-"}
              </td>
              <td class="px-4 py-3 text-right align-top font-medium">
                {formatNumber(dechet.masse)}
              </td>
              <td class="px-4 py-3 text-right align-top">
                {formatNumber(dechet.volume)}
              </td>

              <!-- Checklist columns -->
              <td class="border-l border-gray-100 px-2 py-3 text-center align-top">
                {dechet.ecoOrganisme ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.reutilisation) ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.recyclable) ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.valorisationMatiere) ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.valorisationEnergetique) ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.incinerationSansValo) ? "☑" : "☐"}
              </td>
              <td class="px-2 py-3 text-center align-top">
                {isChecked(dechet.nonValorisation) ? "☑" : "☐"}
              </td>
              <!-- End checklist columns -->

              <td class="border-l border-gray-100 px-4 py-3 align-top text-xs">
                <div
                  class="max-w-37.5 truncate"
                  title={dechet.stockage || dechet.description || ""}
                >
                  {dechet.stockage || dechet.description || "-"}
                </div>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="12" class="px-6 py-12 text-center"> Aucun résultat. </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <Pagination
      page={currentPage}
      {totalPages}
      totalItems={filteredDechets.length}
      perPage={itemsPerPage}
      onPageChange={(page) => (currentPage = page)}
    />
  </div>

  <div class="mt-4 flex gap-4 text-xs">
    <span>Légende :</span>
    <span>☑ = Oui / Applicable</span>
    <span>☐ = Non / Non applicable</span>
  </div>
</div>
