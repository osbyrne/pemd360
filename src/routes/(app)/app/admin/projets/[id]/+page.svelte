<script lang="ts">
  import { ArrowLeft, Edit, Trash2, Building2, MapPin, Calendar, FileText } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: ({ projet } = data);

  function formatDate(date: Date | number | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
</script>

<svelte:head>
  <title>Projet · {projet.libelle}</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
  <!-- Fil d'ariane / Retour -->
  <div class="mb-8">
    <a href="/app/admin/projets" class="btn btn-ghost">
      <ArrowLeft class="h-4 w-4" />
      Retour à la liste
    </a>
  </div>

  <!-- Header -->
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold">{projet.libelle}</h1>
      <p class="mt-1 text-sm">Référence: {projet.reference}</p>
      <p
        class="mt-2 inline-block rounded bg-emerald-50 px-2 py-1 font-mono text-xs text-emerald-600"
      >
        ID Matterport: {projet.id}
      </p>
    </div>
    <div class="flex gap-3">
      <a href="/app/admin/projets/{projet.id}/modifier" class="btn">
        <Edit class="h-4 w-4" />
        Modifier
      </a>
    </div>
  </div>

  <!-- Informations générales -->
  <div class="mb-6 rounded-xl border border-gray-200 p-6 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-lg bg-blue-50 p-2">
        <FileText class="h-6 w-6 text-blue-600" />
      </div>
      <h2 class="text-xl font-semibold">Informations générales</h2>
    </div>

    <dl class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <dt class="text-sm font-medium">Référence</dt>
        <dd class="mt-1 text-sm">{projet.reference}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Libellé</dt>
        <dd class="mt-1 text-sm">{projet.libelle}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Type d'opération</dt>
        <dd class="mt-1 text-sm">{projet.typeOperation || "-"}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Maître d'ouvrage</dt>
        <dd class="mt-1 text-sm">{projet.maitreDOuvrage || "-"}</dd>
      </div>
    </dl>
  </div>

  <!-- Établissement & Société -->
  <div class="mb-6 rounded-xl border border-gray-200 p-6 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-lg bg-purple-50 p-2">
        <Building2 class="h-6 w-6 text-purple-600" />
      </div>
      <h2 class="text-xl font-semibold">Établissement & Société</h2>
    </div>

    <dl class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <dt class="text-sm font-medium">Établissement</dt>
        <dd class="mt-1 text-sm">{projet.etablissementNom || "-"}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Ville de l'établissement</dt>
        <dd class="mt-1 text-sm">{projet.etablissementVille || "-"}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Société</dt>
        <dd class="mt-1">
          {#if projet.societeNom}
            <span
              class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {projet.societeNom}
            </span>
          {:else}
            <span class="text-sm">-</span>
          {/if}
        </dd>
      </div>
    </dl>
  </div>

  <!-- Localisation -->
  <div class="mb-6 rounded-xl border border-gray-200 p-6 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-lg bg-emerald-50 p-2">
        <MapPin class="h-6 w-6 text-emerald-600" />
      </div>
      <h2 class="text-xl font-semibold">Localisation</h2>
    </div>

    <dl class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div class="md:col-span-2">
        <dt class="text-sm font-medium">Adresse</dt>
        <dd class="mt-1 text-sm">{projet.rue}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Code Postal</dt>
        <dd class="mt-1 text-sm">{projet.cp}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Ville</dt>
        <dd class="mt-1 text-sm">{projet.ville}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Code INSEE</dt>
        <dd class="mt-1 text-sm">{projet.codeInsee || "-"}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Section cadastrale</dt>
        <dd class="mt-1 text-sm">{projet.section}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Parcelle</dt>
        <dd class="mt-1 text-sm">{projet.parcelle}</dd>
      </div>
    </dl>
  </div>

  <!-- Dates -->
  <div class="rounded-xl border border-gray-200 p-6 shadow-sm">
    <div class="mb-6 flex items-center gap-3">
      <div class="rounded-lg bg-amber-50 p-2">
        <Calendar class="h-6 w-6 text-amber-600" />
      </div>
      <h2 class="text-xl font-semibold">Planning</h2>
    </div>

    <dl class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <dt class="text-sm font-medium">Date de démarrage</dt>
        <dd class="mt-1 text-sm">{formatDate(projet.dateDemarrage)}</dd>
      </div>
      <div>
        <dt class="text-sm font-medium">Date de fin</dt>
        <dd class="mt-1 text-sm">{formatDate(projet.dateDeFin)}</dd>
      </div>
    </dl>
  </div>
</div>
