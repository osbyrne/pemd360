<script lang="ts">
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const id = $derived($page.params.id);

  function toDateInput(ts: number | null | undefined): string {
    if (!ts) return "";
    return new Date(ts).toISOString().split("T")[0];
  }

  const storedTypologies: string[] = JSON.parse(data.operation?.typologieBat || "[]");
  const storedOperationsSoumis: string[] = JSON.parse(data.operation?.operationSoumis || "[]");

  let typologies = $state([...storedTypologies]);
  let operationsSoumis = $state([...storedOperationsSoumis]);

  const typologiesList = [
    "Maison individuelle",
    "Logement collectif",
    "Commerces",
    "Bureaux",
    "Bâtiment industriel",
    "Établissement de santé",
    "Établissement d'enseignement",
    "Café, hôtel, restaurants",
    "Bâtiment à usage sportif ou de loisirs",
    "ICPE",
    "Autre",
  ];
</script>

<svelte:head>
  <title>CERFA · L'opération</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-6">
  <div class="mb-6">
    <a href="/app/cerfa/informations?projetId={id}" class="btn btn-ghost btn-sm">← Retour</a>
  </div>

  <div class="card bg-base-100 shadow-sm">
    <div class="px-6 py-4">
      <h1 class="text-xl font-semibold">L'opération</h1>
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
              value={data.operation?.adresse || ""}
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
                value={data.operation?.cp || ""}
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
                value={data.operation?.commune || ""}
                placeholder="Commune"
                class="input"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="dateDebut" class="mb-2 block text-sm font-medium">Date de début</label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="date"
              value={toDateInput(data.operation?.dateDeDebut)}
              class="input"
            />
          </div>
          <div>
            <label for="dateFin" class="mb-2 block text-sm font-medium">Date de fin</label>
            <input
              id="dateFin"
              name="dateFin"
              type="date"
              value={toDateInput(data.operation?.dateDeFin)}
              class="input"
            />
          </div>
        </div>

        <div>
          <label for="operation" class="mb-2 block text-sm font-medium">L'opération est-elle</label>
          <select id="operation" name="operation" class="select">
            <option value="">Sélectionnez...</option>
            <option value="demolition" selected={data.operation?.operation === "demolition"}
              >Démolition</option
            >
            <option value="renovation" selected={data.operation?.operation === "renovation"}
              >Rénovation</option
            >
            <option value="mixte" selected={data.operation?.operation === "mixte"}
              >Mixte (Démolition + Rénovation)</option
            >
          </select>
        </div>

        <div class="space-y-4 rounded-lg p-4">
          <h4 class="font-semibold">Démolition</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="nbBatDemolition" class="mb-2 block text-sm font-medium"
                >Nombre de bâtiments concernés</label
              >
              <input
                id="nbBatDemolition"
                name="nbBatDemolition"
                type="number"
                value={data.operation?.nbBatDemolition ?? 0}
                min="0"
                class="input"
              />
            </div>
            <div>
              <label for="surfaceDemolir" class="mb-2 block text-sm font-medium"
                >Surface totale de plancher (m²)</label
              >
              <input
                id="surfaceDemolir"
                name="surfaceDemolir"
                type="number"
                value={data.operation?.surfaceADemolir ?? 0}
                min="0"
                step="0.01"
                class="input"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 rounded-lg p-4">
          <h4 class="font-semibold">Rénovation significative</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="nbBatRenovation" class="mb-2 block text-sm font-medium"
                >Nombre de bâtiments concernés</label
              >
              <input
                id="nbBatRenovation"
                name="nbBatRenovation"
                type="number"
                value={data.operation?.nbBatRenovation ?? 0}
                min="0"
                class="input"
              />
            </div>
            <div>
              <label for="surfaceRenover" class="mb-2 block text-sm font-medium"
                >Surface totale de plancher (m²)</label
              >
              <input
                id="surfaceRenover"
                name="surfaceRenover"
                type="number"
                value={data.operation?.surfaceARenover ?? 0}
                min="0"
                step="0.01"
                class="input"
              />
            </div>
          </div>
        </div>

        <div>
          <div class="mb-2 block text-sm font-medium">Typologies principales des bâtiments</div>
          <div class="grid grid-cols-2 gap-3">
            {#each typologiesList as typologie}
              <label
                for={`typologie-${typologie.replace(/\s+/g, "-").toLowerCase()}`}
                class="flex items-center gap-2"
              >
                <input
                  id={`typologie-${typologie.replace(/\s+/g, "-").toLowerCase()}`}
                  type="checkbox"
                  name="typologies"
                  value={typologie}
                  checked={typologies.includes(typologie)}
                  onchange={(e) => {
                    if (e.currentTarget.checked) {
                      typologies = [...typologies, typologie];
                    } else {
                      typologies = typologies.filter((t) => t !== typologie);
                    }
                  }}
                  class="checkbox"
                />
                <span class="text-sm">{typologie}</span>
              </label>
            {/each}
          </div>
        </div>

        <div>
          <label for="datePermis" class="mb-2 block text-sm font-medium"
            >Date d'obtention du permis de construction du bâtiment le plus ancien</label
          >
          <input
            id="datePermis"
            name="datePermis"
            type="date"
            value={toDateInput(data.operation?.datePermisDeConstruire)}
            class="input"
          />
        </div>

        <div>
          <div class="mb-2 block text-sm font-medium">
            Cochez, s'il y en a eu, le(s) type(s) d'opération(s) auxquel(s) le bâtiment a été soumis
            depuis la date mentionnée ci-dessus :
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                name="operationsSoumis"
                value="renovation"
                checked={operationsSoumis.includes("renovation")}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    operationsSoumis = [...operationsSoumis, "renovation"];
                  } else {
                    operationsSoumis = operationsSoumis.filter((t) => t !== "renovation");
                  }
                }}
                class="checkbox"
              />
              <span class="text-sm">Rénovation importante</span>
            </label>
            {#if operationsSoumis.includes("renovation")}
              <input type="month" name="dateRenovation" class="input" />
            {/if}
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                name="operationsSoumis"
                value="decontamination"
                checked={operationsSoumis.includes("decontamination")}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    operationsSoumis = [...operationsSoumis, "decontamination"];
                  } else {
                    operationsSoumis = operationsSoumis.filter((t) => t !== "decontamination");
                  }
                }}
                class="checkbox"
              />
              <span class="text-sm">Opération de décontamination (ex: désamiantage)</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                name="operationsSoumis"
                value="autre"
                checked={operationsSoumis.includes("autre")}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    operationsSoumis = [...operationsSoumis, "autre"];
                  } else {
                    operationsSoumis = operationsSoumis.filter((t) => t !== "autre");
                  }
                }}
                class="checkbox"
              />
              <span class="text-sm">Autre intervention importante</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                name="operationsSoumis"
                value="aucune"
                checked={operationsSoumis.includes("aucune")}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    operationsSoumis = [...operationsSoumis, "aucune"];
                  } else {
                    operationsSoumis = operationsSoumis.filter((t) => t !== "aucune");
                  }
                }}
                class="checkbox"
              />
              <span class="text-sm">Aucune opération</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                name="operationsSoumis"
                value="ne_sait_pas"
                checked={operationsSoumis.includes("ne_sait_pas")}
                onchange={(e) => {
                  if (e.currentTarget.checked) {
                    operationsSoumis = [...operationsSoumis, "ne_sait_pas"];
                  } else {
                    operationsSoumis = operationsSoumis.filter((t) => t !== "ne_sait_pas");
                  }
                }}
                class="checkbox"
              />
              <span class="text-sm">Ne sait pas</span>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <a href="/app/cerfa/informations?projetId={id}" class="btn">Annuler</a>
          <button type="submit" class="btn">Valider</button>
        </div>
      </form>
    </div>
  </div>
</div>
