<script lang="ts">
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const id = $derived($page.params.id);

  let typePersonne = $state(data.moa?.nomPerMorale ? "morale" : "physique");
</script>

<svelte:head>
  <title>CERFA · Maître d'Ouvrage</title>
</svelte:head>

<div class="mx-auto max-w-2xl p-6">
  <div class="mb-6">
    <a href="/app/cerfa/informations?projetId={id}" class="btn btn-ghost btn-sm">← Retour</a>
  </div>

  <div class="card bg-base-100 shadow-sm">
    <div class="px-6 py-4">
      <h1 class="text-xl font-semibold">Maître d'Ouvrage</h1>
    </div>
    <div class="p-6">
      <form method="POST" use:enhance class="space-y-6">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label for="adresse" class="mb-2 block text-sm font-medium">Adresse</label>
            <input
              id="adresse"
              name="adresse"
              type="text"
              value={data.moa?.adresse || ""}
              placeholder="Adresse"
              class="input"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="cp" class="mb-2 block text-sm font-medium">Code postal</label>
              <input
                id="cp"
                name="cp"
                type="text"
                value={data.moa?.cp || ""}
                placeholder="Code postal"
                class="input"
              />
            </div>
            <div>
              <label for="commune" class="mb-2 block text-sm font-medium">Commune</label>
              <input
                id="commune"
                name="commune"
                type="text"
                value={data.moa?.commune || ""}
                placeholder="Commune"
                class="input"
              />
            </div>
          </div>
        </div>

        <div class="flex gap-4 rounded-lg p-4">
          <label for="personne-physique" class="flex cursor-pointer items-center gap-2">
            <input
              id="personne-physique"
              type="radio"
              name="typePersonne"
              value="physique"
              checked={typePersonne === "physique"}
              onchange={() => (typePersonne = "physique")}
              class="radio"
            />
            <span class="font-medium">Personne physique</span>
          </label>
          <label for="personne-morale" class="flex cursor-pointer items-center gap-2">
            <input
              id="personne-morale"
              type="radio"
              name="typePersonne"
              value="morale"
              checked={typePersonne === "morale"}
              onchange={() => (typePersonne = "morale")}
              class="radio"
            />
            <span class="font-medium">Personne morale</span>
          </label>
        </div>

        {#if typePersonne === "physique"}
          <div class="space-y-4 rounded-lg p-4">
            <h4 class="font-semibold">Si personne physique</h4>
            <div>
              <label for="nom" class="mb-2 block text-sm font-medium">Nom</label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={data.moa?.nomPerPhy || ""}
                placeholder="Nom"
                class="input"
              />
            </div>
            <div>
              <label for="prenom" class="mb-2 block text-sm font-medium">Prénom</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={data.moa?.prenomPerPhy || ""}
                placeholder="Prénom"
                class="input"
              />
            </div>
          </div>
        {:else}
          <div class="space-y-4 rounded-lg p-4">
            <h4 class="font-semibold">Si personne morale</h4>
            <div>
              <label for="raisonSociale" class="mb-2 block text-sm font-medium"
                >Raison sociale</label
              >
              <input
                id="raisonSociale"
                name="raisonSociale"
                type="text"
                value={data.moa?.nomPerMorale || ""}
                placeholder="Raison sociale"
                class="input"
              />
            </div>
            <div>
              <label for="siretSiren" class="mb-2 block text-sm font-medium"
                >Numéro de Siret ou Siren</label
              >
              <input
                id="siretSiren"
                name="siretSiren"
                type="text"
                value={data.moa?.siretSiren || ""}
                placeholder="Siret ou Siren"
                class="input"
              />
            </div>
          </div>
        {/if}

        <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <a href="/app/cerfa/informations?projetId={id}" class="btn">Annuler</a>
          <button type="submit" class="btn">Valider</button>
        </div>
      </form>
    </div>
  </div>
</div>
