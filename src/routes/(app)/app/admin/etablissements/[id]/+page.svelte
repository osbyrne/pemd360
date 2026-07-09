<script lang="ts">
  import { ArrowLeft, Building2, MapPin, Phone, Mail, Hash, Pencil, Globe } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ etablissement, societe } = data);
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <!-- Fil d'ariane / Retour -->
  <div class="mb-8">
    <a
      href="/app/admin/etablissements"
      class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
    >
      <ArrowLeft class="h-4 w-4" />
      Retour à la liste des établissements
    </a>
  </div>

  <!-- Titre et Actions -->
  <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="mb-2 text-3xl font-bold">{etablissement.nom}</h1>
      <div class="flex items-center gap-4 text-sm">
        <span class="flex items-center gap-1">
          <Hash class="h-4 w-4" />
          ID: #{etablissement.id}
        </span>
        <span class="flex items-center gap-1">
          <Building2 class="h-4 w-4" />
          Société: {societe?.nom || "N/A"}
        </span>
      </div>
    </div>
    <a href="/app/admin/etablissements/{etablissement.id}/modifier" class="btn">
      <Pencil class="mr-2 h-4 w-4" />
      Modifier
    </a>
  </div>

  <!-- Informations détaillées -->
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <!-- Section Identifiants & Contact -->
    <div class="rounded-xl border border-gray-200 p-6 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <div class="rounded-lg bg-emerald-50 p-2">
          <Globe class="h-6 w-6 text-emerald-600" />
        </div>
        <h2 class="text-xl font-semibold">Identité & Contact</h2>
      </div>

      <div class="space-y-4">
        <div>
          <p class="mb-1 text-sm">Raison Sociale</p>
          <p class="text-base font-medium">{etablissement.raisonSocial}</p>
        </div>
        <div>
          <p class="mb-1 text-sm">SIRET</p>
          <p class="font-mono text-base font-medium">{etablissement.siret}</p>
        </div>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <p class="mb-1 text-sm">Email</p>
            <p class="flex items-center gap-2 text-base font-medium">
              <Mail class="h-4 w-4" />
              {etablissement.email}
            </p>
          </div>
          <div>
            <p class="mb-1 text-sm">Téléphone</p>
            <p class="flex items-center gap-2 text-base font-medium">
              <Phone class="h-4 w-4" />
              {etablissement.tel}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Localisation -->
    <div class="rounded-xl border border-gray-200 p-6 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <div class="rounded-lg bg-emerald-50 p-2">
          <MapPin class="h-6 w-6 text-emerald-600" />
        </div>
        <h2 class="text-xl font-semibold">Localisation</h2>
      </div>

      <div class="space-y-4">
        <div>
          <p class="mb-1 text-sm">Adresse</p>
          <p class="text-base font-medium">{etablissement.rue}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="mb-1 text-sm">Code Postal</p>
            <p class="text-base font-medium">{etablissement.cp}</p>
          </div>
          <div>
            <p class="mb-1 text-sm">Ville</p>
            <p class="text-base font-medium">{etablissement.ville}</p>
          </div>
        </div>
        {#if etablissement.fax}
          <div>
            <p class="mb-1 text-sm">Fax</p>
            <p class="text-base font-medium">{etablissement.fax}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
