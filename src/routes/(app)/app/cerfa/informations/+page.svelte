<script lang="ts">
  import CerfaTabs from "$lib/components/CerfaTabs.svelte";
  import { Building2, UserCircle, MapPin, CalendarDays, Edit2 } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const projetId = $derived($page.url.searchParams.get("projetId") || "");

  const projectData = $derived(
    data.list.find((item) => item.projetId === projetId) || data.list[0],
  );
</script>

<svelte:head>
  <title>CERFA · Informations</title>
</svelte:head>

<div class="mx-auto max-w-7xl p-6">
  <CerfaTabs />
  <div class="mb-8 flex items-start justify-between">
    <div>
      <h1 class="text-3xl font-bold">Partie Informations</h1>
      <p>Informations administratives du projet : Maîtrise d'ouvrage, Opération, Diagnostiqueur</p>
    </div>
  </div>

  {#if projectData}
    <div class="mb-6 flex items-center gap-4 rounded-xl p-6 shadow-lg">
      <div>
        <p class="text-sm font-medium">Projet actuel</p>
        <h2 class="text-2xl font-bold">{projectData.projetNom || "Projet sans nom"}</h2>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Left Column -->
      <div class="space-y-6">
        <!-- Section: Maître d'Ouvrage -->
        <div class="card bg-base-100 shadow-sm">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <Building2 class="h-5 w-5" />
              <h2>Maître d'Ouvrage</h2>
            </div>
            <a href="/app/cerfa/informations/{projectData.projetId}/maitre" class="btn">
              <Edit2 class="h-4 w-4" />
              <span class="text-sm font-medium">Modifier</span>
            </a>
          </div>
          <div class="p-6">
            {#if projectData.moaNom || projectData.moaNomPhy}
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <UserCircle class="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <div class="flex-1">
                    <p class="mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase">
                      Identité
                    </p>
                    <p class="font-semibold">
                      {projectData.moaNom ||
                        `${projectData.moaPrenomPhy || ""} ${projectData.moaNomPhy || ""}`}
                    </p>
                  </div>
                </div>
                {#if projectData.moaAdresse}
                  <div class="flex items-start gap-3">
                    <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div class="flex-1">
                      <p class="mb-1 text-xs font-medium tracking-wide text-blue-600 uppercase">
                        Adresse
                      </p>
                      <p class="">{projectData.moaAdresse}</p>
                      <p class="text-sm">
                        {projectData.moaCp || ""}
                        {projectData.moaCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="py-8 text-center">
                <UserCircle class="mx-auto mb-3 h-12 w-12" />
                <p class="italic">Non renseigné</p>
                <p class="mt-1 text-sm">Cliquez sur "Modifier" pour ajouter les informations</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section: Diagnostiqueur -->
        <div class="card bg-base-100 shadow-sm">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-purple-500 p-2">
                <UserCircle class="h-5 w-5 text-white" />
              </div>
              <h2>Diagnostiqueur</h2>
            </div>
            <a href="/app/cerfa/informations/{projectData.projetId}/diagnostiqueur" class="btn">
              <Edit2 class="h-4 w-4" />
              <span class="text-sm font-medium">Modifier</span>
            </a>
          </div>
          <div class="p-6">
            {#if projectData.diagnostiqueurNom || projectData.diagnostiqueurNomPhy}
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <UserCircle class="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                  <div class="flex-1">
                    <p class="mb-1 text-xs font-medium tracking-wide text-purple-600 uppercase">
                      Identité
                    </p>
                    <p class="font-semibold">
                      {projectData.diagnostiqueurNom ||
                        `${projectData.diagnostiqueurPrenomPhy || ""} ${projectData.diagnostiqueurNomPhy || ""}`}
                    </p>
                  </div>
                </div>
                {#if projectData.diagnostiqueurAdresse}
                  <div class="flex items-start gap-3">
                    <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-purple-600" />
                    <div class="flex-1">
                      <p class="mb-1 text-xs font-medium tracking-wide text-purple-600 uppercase">
                        Adresse
                      </p>
                      <p class="">{projectData.diagnostiqueurAdresse}</p>
                      <p class="text-sm">
                        {projectData.diagnostiqueurCp || ""}
                        {projectData.diagnostiqueurCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="py-8 text-center">
                <UserCircle class="mx-auto mb-3 h-12 w-12" />
                <p class="italic">Non renseigné</p>
                <p class="mt-1 text-sm">Cliquez sur "Modifier" pour ajouter les informations</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="space-y-6">
        <!-- Section: Le diagnostic -->
        <div class="card bg-base-100 shadow-sm">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-teal-500 p-2">
                <CalendarDays class="h-5 w-5 text-white" />
              </div>
              <h2>Le diagnostic</h2>
            </div>
            <a href="/app/cerfa/informations/{projectData.projetId}/diagnostic" class="btn">
              <Edit2 class="h-4 w-4" />
              <span class="text-sm font-medium">Modifier</span>
            </a>
          </div>
          <div class="p-6">
            {#if projectData.diagnosticDerniereVisite}
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <CalendarDays class="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                  <div class="flex-1">
                    <p class="mb-1 text-xs font-medium tracking-wide text-teal-600 uppercase">
                      Dernière visite
                    </p>
                    <p class="font-semibold">
                      {new Date(projectData.diagnosticDerniereVisite).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {#if projectData.diagnosticDesordres !== null}
                  <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="rounded-lg bg-teal-50 p-3">
                      <p class="mb-1 text-xs font-medium text-teal-700">Désordres constatés</p>
                      <p class="text-sm font-semibold text-teal-900">
                        {projectData.diagnosticDesordres ? "Oui" : "Non"}
                      </p>
                    </div>
                    <div class="rounded-lg bg-teal-50 p-3">
                      <p class="mb-1 text-xs font-medium text-teal-700">Précautions</p>
                      <p class="text-sm font-semibold text-teal-900">
                        {projectData.diagnosticPrecaution ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="py-8 text-center">
                <CalendarDays class="mx-auto mb-3 h-12 w-12" />
                <p class="italic">Non renseigné</p>
                <p class="mt-1 text-sm">Cliquez sur "Modifier" pour ajouter les informations</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section: L'opération -->
        <div class="card bg-base-100 shadow-sm">
          <div class="flex items-center justify-between px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-amber-500 p-2">
                <MapPin class="h-5 w-5 text-white" />
              </div>
              <h2>L'opération</h2>
            </div>
            <a href="/app/cerfa/informations/{projectData.projetId}/operation" class="btn">
              <Edit2 class="h-4 w-4" />
              <span class="text-sm font-medium">Modifier</span>
            </a>
          </div>
          <div class="p-6">
            {#if projectData.operationAdresse || projectData.datePermis}
              <div class="space-y-4">
                {#if projectData.operationAdresse}
                  <div class="flex items-start gap-3">
                    <MapPin class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div class="flex-1">
                      <p class="mb-1 text-xs font-medium tracking-wide text-amber-600 uppercase">
                        Localisation
                      </p>
                      <p class="font-semibold">{projectData.operationAdresse}</p>
                      <p class="text-sm">
                        {projectData.operationCp || ""}
                        {projectData.operationCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
                {#if projectData.operationType}
                  <div class="flex items-start gap-3">
                    <Building2 class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div class="flex-1">
                      <p class="mb-1 text-xs font-medium tracking-wide text-amber-600 uppercase">
                        Type d'opération
                      </p>
                      <p class="">{projectData.operationType}</p>
                    </div>
                  </div>
                {/if}
                {#if projectData.datePermis}
                  <div class="flex items-start gap-3">
                    <CalendarDays class="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div class="flex-1">
                      <p class="mb-1 text-xs font-medium tracking-wide text-amber-600 uppercase">
                        Permis de construire
                      </p>
                      <p class="font-semibold">
                        {new Date(projectData.datePermis).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                {/if}
                {#if projectData.operationDateDebut || projectData.operationDateFin}
                  <div class="mt-4 rounded-lg bg-amber-50 p-4">
                    <p class="mb-2 text-xs font-medium text-amber-700">Période d'opération</p>
                    <div class="flex items-center gap-3 text-sm">
                      {#if projectData.operationDateDebut}
                        <span class="font-medium"
                          >Du {new Date(projectData.operationDateDebut).toLocaleDateString(
                            "fr-FR",
                          )}</span
                        >
                      {/if}
                      {#if projectData.operationDateFin}
                        <span class=""
                          >au {new Date(projectData.operationDateFin).toLocaleDateString(
                            "fr-FR",
                          )}</span
                        >
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class="py-8 text-center">
                <MapPin class="mx-auto mb-3 h-12 w-12" />
                <p class="italic">Non renseigné</p>
                <p class="mt-1 text-sm">Cliquez sur "Modifier" pour ajouter les informations</p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="rounded-xl border border-gray-200 p-12 text-center">
      <p class="">Aucune donnée disponible pour ce projet.</p>
    </div>
  {/if}
</div>
