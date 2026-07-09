<script lang="ts">
  import { Info, Search, MapPin, Calendar, Building2, ChevronRight, Box } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  let mounted = $state(false);
  let searchQuery = $state("");
  let sortBy = $state<"date" | "name" | "ville">("date");
  let sortOrder = $state<"asc" | "desc">("desc");

  onMount(() => {
    mounted = true;
  });

  function formatDate(date: Date | number): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  let filteredProjets = $derived(
    data.projets
      .filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.libelle.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.ville.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "date") {
          comparison = new Date(a.dateDemarrage).getTime() - new Date(b.dateDemarrage).getTime();
        } else if (sortBy === "name") {
          comparison = a.libelle.localeCompare(b.libelle);
        } else if (sortBy === "ville") {
          comparison = a.ville.localeCompare(b.ville);
        }
        return sortOrder === "asc" ? comparison : -comparison;
      }),
  );

  function toggleSort(field: "date" | "name" | "ville") {
    if (sortBy === field) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortBy = field;
      sortOrder = "desc";
    }
  }
</script>

<svelte:head>
  <title>Projets</title>
</svelte:head>

<div class="min-h-screen">
  {#if mounted}
    <!-- Search & Filters Bar -->
    <div class="relative z-10 mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl border border-slate-200 p-4">
        <div class="flex flex-col gap-4 sm:flex-row">
          <!-- Search -->
          <label class="input relative flex-1">
            <Search />
            <input
              type="search"
              bind:value={searchQuery}
              placeholder="Rechercher un projet par nom, référence ou ville..."
            />
          </label>
          <br />

          <!-- View Toggle & Sort -->
          <div class="flex items-center gap-2">
            <!-- Sort Buttons -->
            <button
              onclick={() => toggleSort("date")}
              class="btn {sortBy === 'date' ? ' text-emerald-600' : ''}"
            >
              Date
            </button>
            <button
              onclick={() => toggleSort("name")}
              class="btn {sortBy === 'name' ? ' text-emerald-600' : ''}"
            >
              Nom
            </button>
            <button
              onclick={() => toggleSort("ville")}
              class="btn {sortBy === 'ville' ? ' text-emerald-600' : ''}"
            >
              Ville
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Content -->
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {#if filteredProjets.length === 0}
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20 text-center">
          <h3 class="mb-2 text-xl font-semibold">
            {searchQuery ? "Aucun résultat" : "Aucun projet disponible"}
          </h3>
          <p class="max-w-md">
            {searchQuery
              ? `Aucun projet ne correspond à "${searchQuery}". Essayez une autre recherche.`
              : "Vous n'avez pas encore de projets assignés. Contactez votre administrateur."}
          </p>
        </div>
      {:else}
        <!-- List View -->
        <ul class="list rounded-box bg-base-100 shadow-md">
          {#each filteredProjets as projet, i (projet.id)}
            <li
              class="list-row flex"
              in:fly={{ x: -20, duration: 300, delay: 300 + i * 30 }}
              animate:flip={{ duration: 300 }}
            >
              <!-- Info -->
              <div class="min-w-0 flex-1">
                <h3 class="mb-1 truncate font-semibold">
                  {projet.libelle}
                </h3>
                <div class="flex flex-wrap items-center gap-4 text-sm">
                  <span class="font-mono">{projet.reference}</span>
                  {#if projet.societeNom}
                    <span class="flex items-center gap-1 font-medium text-gray-500">
                      <Building2 class="h-3.5 w-3.5" />
                      {projet.societeNom}
                    </span>
                  {/if}
                  <span class="flex items-center gap-1">
                    <MapPin class="h-3.5 w-3.5" />
                    {projet.ville}
                  </span>
                  <span class="hidden items-center gap-1 md:flex">
                    <Calendar class="h-3.5 w-3.5" />
                    {formatDate(projet.dateDemarrage)}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <a href="/app/details/{projet.id}" class="btn btn-ghost" title="Voir les détails">
                  <Info class="h-5 w-5" />
                </a>
                <a href="/app/projets/{projet.id}" class="btn btn-ghost">
                  <span class="hidden sm:inline">Modèle 3D</span>
                </a>
                <a href="/app/cerfa/informations?projetId={projet.id}" class="btn btn-ghost"
                  >Cerfa</a
                >
              </div>
            </li>
          {/each}
        </ul>
      {/if}

      <!-- Results count -->
      {#if filteredProjets.length > 0 && searchQuery}
        <p class="mt-6 text-center text-sm">
          {filteredProjets.length} résultat{filteredProjets.length > 1 ? "s" : ""} pour "{searchQuery}"
        </p>
      {/if}
    </div>
  {/if}
</div>
