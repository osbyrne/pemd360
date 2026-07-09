<script lang="ts">
  import {
    ArrowLeft,
    Save,
    Building2,
    MapPin,
    Phone,
    Mail,
    Hash,
    Globe,
    LoaderCircle,
  } from "lucide-svelte";
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  export let data: PageData;
  export let form: ActionData;
  $: ({ etablissement, societes } = data);

  let saving = false;
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <!-- Fil d'ariane / Retour -->
  <div class="mb-8">
    <a
      href="/app/admin/etablissements/{etablissement.id}"
      class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700"
    >
      <ArrowLeft class="h-4 w-4" />
      Retour aux détails
    </a>
  </div>

  <!-- Titre -->
  <div class="mb-8">
    <h1 class="mb-2 text-3xl font-bold">Modifier l'établissement</h1>
    <p class="text-sm">Mettez à jour les informations de {etablissement.nom}.</p>
  </div>

  {#if form?.message}
    <div
      class="mb-6 rounded-lg p-4 {form.success === false
        ? 'border border-red-200 bg-red-50 text-red-700'
        : 'border border-emerald-200 bg-emerald-50 text-emerald-700'}"
    >
      {form.message}
    </div>
  {/if}

  <form
    method="POST"
    use:enhance={() => {
      saving = true;
      return async ({ result, update }) => {
        saving = false;
        // Le update() va gérer la redirection si succès ou afficher l'erreur
        await update();
      };
    }}
    class="space-y-8"
  >
    <!-- Section Identifiants & Contact -->
    <div class="rounded-xl border border-gray-200 p-6 shadow-sm">
      <div class="mb-6 flex items-center gap-3">
        <div class="rounded-lg bg-emerald-50 p-2">
          <Globe class="h-6 w-6 text-emerald-600" />
        </div>
        <h2 class="text-xl font-semibold">Identité & Contact</h2>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-1.5 md:col-span-2">
          <label for="nom" class="text-sm font-medium">Nom de l'établissement</label>
          <br />
          <input type="text" id="nom" name="nom" value={etablissement.nom} required class="input" />
        </div>

        <div class="space-y-1.5 md:col-span-2">
          <label for="societeId" class="text-sm font-medium">Société</label>
          <br />
          <select id="societeId" name="societeId" required class="select">
            {#each societes as societe}
              <option value={societe.id} selected={societe.id === etablissement.societeId}
                >{societe.nom}</option
              >
            {/each}
          </select>
        </div>

        <div class="space-y-1.5">
          <label for="raisonSocial" class="text-sm font-medium">Raison Sociale</label>
          <input
            type="text"
            id="raisonSocial"
            name="raisonSocial"
            value={etablissement.raisonSocial}
            class="input"
          />
        </div>

        <div class="space-y-1.5">
          <label for="siret" class="text-sm font-medium">SIRET</label>
          <br />
          <input
            type="text"
            id="siret"
            name="siret"
            value={etablissement.siret}
            required
            class="input"
          />
        </div>

        <div class="space-y-1.5">
          <label for="email" class="text-sm font-medium">Email</label>
          <br />
          <input type="email" id="email" name="email" value={etablissement.email} class="input" />
        </div>

        <div class="space-y-1.5">
          <label for="tel" class="text-sm font-medium">Téléphone</label>
          <br />
          <input type="tel" id="tel" name="tel" value={etablissement.tel} class="input" />
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

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-1.5 md:col-span-2">
          <label for="rue" class="text-sm font-medium">Adresse</label>
          <br />
          <input type="text" id="rue" name="rue" value={etablissement.rue} class="input" />
        </div>
        <div class="space-y-1.5">
          <label for="cp" class="text-sm font-medium">Code Postal</label>
          <br />
          <input type="text" id="cp" name="cp" value={etablissement.cp} class="input" />
        </div>
        <div class="space-y-1.5">
          <label for="ville" class="text-sm font-medium">Ville</label>
          <br />
          <input type="text" id="ville" name="ville" value={etablissement.ville} class="input" />
        </div>
        <div class="space-y-1.5 md:col-span-2">
          <label for="fax" class="text-sm font-medium">Fax</label>
          <br />
          <input type="text" id="fax" name="fax" value={etablissement.fax} class="input" />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 transition-all">
      <a href="/app/admin/etablissements/{etablissement.id}" class="btn"> Annuler </a>
      <button type="submit" disabled={saving} class="btn btn-secondary">
        {#if saving}
          <LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
          Enregistrement...
        {:else}
          <Save class="mr-2 h-4 w-4" />
          Enregistrer les modifications
        {/if}
      </button>
    </div>
  </form>
</div>
