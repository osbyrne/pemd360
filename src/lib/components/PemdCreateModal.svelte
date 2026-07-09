<script lang="ts">
  import { enhance } from "$app/forms";
  import { Plus, Save, MapPin } from "lucide-svelte";

  interface Props {
    show: boolean;
    pendingPosition: {
      anchorPosition: { x: number; y: number; z: number };
      normal: { x: number; y: number; z: number };
    } | null;
    groups: { id: number | null; name: string | null }[];
    categoriesV2: App.CategoriesV2[];
    allPemdObjects: { id: number | null; name: string | null; categorieId: number | null }[];
    onClose: () => void;
  }

  let { show, pendingPosition, groups, categoriesV2, allPemdObjects, onClose }: Props = $props();

  let dialog: HTMLDialogElement;

  // Form field state — reset each time the modal opens
  let objetId = $state("");
  let description = $state("");
  let quantite = $state("");
  let etage = $state("");
  let etat = $state("");
  let longueur = $state("");
  let largeur = $state("");
  let epaisseur = $state("");
  let potentielReemploi = $state("");

  // Cascade selection state
  let groupId: string | number = $state("");
  let categoryId: string | number = $state("");
  let categoriesFiltered: App.CategoriesV2[] = $state([]);
  let objectsFiltered = $state(
    [] as { id: number | null; name: string | null; categorieId: number | null }[],
  );

  let isSaving = $state(false);

  // Sync dialog open/close state and reset fields when opening
  $effect(() => {
    if (!dialog) return;
    if (show && pendingPosition) {
      objetId = "";
      description = "";
      quantite = "";
      etage = "";
      etat = "";
      longueur = "";
      largeur = "";
      epaisseur = "";
      potentielReemploi = "";
      groupId = "";
      categoryId = "";
      categoriesFiltered = [];
      objectsFiltered = [];
      dialog.showModal();
    } else {
      dialog.close();
    }
  });

  function handleGroupChange() {
    if (groupId !== "" && groupId !== null && groupId !== undefined) {
      const gId = typeof groupId === "string" ? Number(groupId) : groupId;
      const group = groups.find((g) => g.id === gId);
      if (group) {
        categoriesFiltered = categoriesV2.filter((c) => c.groupeId === group.id);
      } else {
        categoriesFiltered = [];
      }
      categoryId = "";
      objetId = "";
      objectsFiltered = [];
    } else {
      categoriesFiltered = [];
      objectsFiltered = [];
      categoryId = "";
      objetId = "";
    }
  }

  function handleCategoryChange() {
    if (categoryId !== "" && categoryId !== null && categoryId !== undefined) {
      const cId = typeof categoryId === "string" ? Number(categoryId) : categoryId;
      const cat = categoriesV2.find((c) => c.id === cId);
      if (cat) {
        objectsFiltered = allPemdObjects.filter((o) => o.categorieId === cat.id);
      } else {
        objectsFiltered = [];
      }
      objetId = "";
    } else {
      objectsFiltered = [];
      objetId = "";
    }
  }
</script>

<dialog bind:this={dialog} class="modal" onclose={onClose}>
  <div class="modal-box max-h-[90vh] max-w-lg overflow-y-auto">
    {#if pendingPosition}
      <div class="mb-4 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
          <Plus size={20} class="text-purple-700" />
        </div>
        <h3 class="text-lg font-semibold">Nouveau tag PEMD</h3>
      </div>

      <form
        method="POST"
        action="?/createPemdTag"
        use:enhance={() => {
          isSaving = true;
          return async ({ result, update }) => {
            isSaving = false;
            await update();
          };
        }}
      >
        <!-- Hidden fields for position -->
        <input
          type="hidden"
          name="anchorPosition"
          value={JSON.stringify(pendingPosition.anchorPosition)}
        />
        <input type="hidden" name="stemVector" value={JSON.stringify(pendingPosition.normal)} />

        <!-- Legend for required fields -->
        <p class="mb-4 text-xs">
          Les champs marqués d'un <span class="font-medium text-red-500">*</span> sont obligatoires
        </p>

        <div class="space-y-4">
          <!-- Section: Identification du matériau -->
          <div class="pb-4">
            <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span class="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
              Identification du matériau <span class="text-red-500">*</span>
            </h4>

            <!-- Étape 1: Groupe -->
            <div class="mb-3">
              <label for="pemd-groupe" class="mb-1 block text-sm font-medium">
                <span
                  class="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700"
                  >1</span
                >
                Groupe
              </label>
              <select
                id="pemd-groupe"
                bind:value={groupId}
                onchange={handleGroupChange}
                class="select"
              >
                <option value="">-- Sélectionner un groupe --</option>
                {#each groups as group (group.id)}
                  <option value={group.id}>{group.name}</option>
                {/each}
              </select>
              {#if !groupId}
                <p class="mt-1 text-xs">Commencez par sélectionner un groupe</p>
              {/if}
            </div>

            <!-- Étape 2: Catégorie -->
            <div class="mb-3">
              <label for="pemd-categorie" class="mb-1 block text-sm font-medium">
                <span
                  class="inline-flex h-5 w-5 items-center justify-center {groupId
                    ? 'bg-purple-100'
                    : ''} mr-1 rounded-full text-xs font-bold">2</span
                >
                Catégorie
              </label>
              <select
                id="pemd-categorie"
                bind:value={categoryId}
                onchange={handleCategoryChange}
                disabled={!groupId || categoriesFiltered.length === 0}
                class="select {groupId && !categoryId ? 'border-purple-300' : 'border-gray-300'}"
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {#each categoriesFiltered as categorie (categorie.id)}
                  <option value={categorie.id}>{categorie.name}</option>
                {/each}
              </select>
              {#if !groupId}
                <p class="mt-1 text-xs">Sélectionnez d'abord un groupe</p>
              {:else if categoriesFiltered.length === 0}
                <p class="mt-1 text-xs text-amber-600">
                  Aucune catégorie disponible pour ce groupe
                </p>
              {:else if !categoryId}
                <p class="mt-1 text-xs">
                  Sélectionnez une catégorie ({categoriesFiltered.length} disponible{categoriesFiltered.length >
                  1
                    ? "s"
                    : ""})
                </p>
              {/if}
            </div>

            <!-- Étape 3: Objet (OBLIGATOIRE) -->
            <div>
              <label for="pemd-objet" class="mb-1 block text-sm font-medium">
                <span
                  class="inline-flex h-5 w-5 items-center justify-center {categoryId
                    ? 'bg-purple-100'
                    : ''} mr-1 rounded-full text-xs font-bold">3</span
                >
                Objet <span class="text-red-500">*</span>
              </label>
              <select
                id="pemd-objet"
                bind:value={objetId}
                name="objetId"
                required
                disabled={!categoryId || objectsFiltered.length === 0}
                class="select {categoryId && !objetId ? 'border-red-300' : 'border-gray-300'}"
              >
                <option value="">-- Sélectionner un objet --</option>
                {#each objectsFiltered as object (object.id)}
                  <option value={object.id}>{object.name}</option>
                {/each}
              </select>
              {#if !categoryId}
                <p class="mt-1 text-xs">Sélectionnez d'abord une catégorie</p>
              {:else if objectsFiltered.length === 0}
                <p class="mt-1 text-xs text-amber-600">
                  Aucun objet disponible pour cette catégorie
                </p>
              {:else if !objetId}
                <p class="mt-1 text-xs">
                  Sélectionnez un objet ({objectsFiltered.length} disponible{objectsFiltered.length >
                  1
                    ? "s"
                    : ""})
                </p>
              {:else}
                <p class="mt-1 text-xs">Objet sélectionné</p>
              {/if}
            </div>
          </div>

          <!-- Section: Informations complémentaires (optionnel) -->
          <div class="pb-4">
            <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span class="h-1.5 w-1.5 rounded-full"></span>
              Informations complémentaires
              <span class="text-xs font-normal">(optionnel)</span>
            </h4>

            <!-- Description -->
            <div class="mb-3">
              <label for="pemd-description" class="mb-1 block text-sm font-medium"
                >Description</label
              >
              <textarea
                id="pemd-description"
                bind:value={description}
                name="description"
                rows="2"
                class="input"
                placeholder="Description du matériau..."></textarea>
            </div>

            <!-- Row: Quantité, Étage, État -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label for="pemd-quantite" class="mb-1 block text-sm font-medium">Quantité</label>
                <input
                  id="pemd-quantite"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={quantite}
                  name="quantite"
                  class="input"
                  placeholder="0"
                />
              </div>
              <div>
                <label for="pemd-etage" class="mb-1 block text-sm font-medium">Étage</label>
                <input
                  id="pemd-etage"
                  type="text"
                  bind:value={etage}
                  name="etage"
                  class="input"
                  placeholder="RDC, 1, 2..."
                />
              </div>
              <div>
                <label for="pemd-etat" class="mb-1 block text-sm font-medium">État</label>
                <select id="pemd-etat" bind:value={etat} name="etat" class="select">
                  <option value="">--</option>
                  <option value="Bon">Bon</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Mauvais">Mauvais</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section: Dimensions (optionnel) -->
          <div class="pb-4">
            <h4 class="mb-3 flex items-center gap-2 text-sm font-semibold">
              <span class="h-1.5 w-1.5 rounded-full"></span>
              Dimensions <span class="text-xs font-normal">(optionnel)</span>
            </h4>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label for="pemd-longueur" class="mb-1 block text-sm font-medium"
                  >Longueur (m)</label
                >
                <input
                  id="pemd-longueur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={longueur}
                  name="longueur"
                  class="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label for="pemd-largeur" class="mb-1 block text-sm font-medium">Largeur (m)</label>
                <input
                  id="pemd-largeur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={largeur}
                  name="largeur"
                  class="input"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label for="pemd-epaisseur" class="mb-1 block text-sm font-medium"
                  >Épaisseur (m)</label
                >
                <input
                  id="pemd-epaisseur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={epaisseur}
                  name="epaisseur"
                  class="input"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <!-- Section: Potentiel Réemploi (optionnel) -->
          <div>
            <label for="pemd-potentiel" class="mb-1 block text-sm font-medium">
              Potentiel de réemploi <span class="text-xs font-normal">(optionnel)</span>
            </label>
            <select
              id="pemd-potentiel"
              bind:value={potentielReemploi}
              name="potentielReemploi"
              class="select"
            >
              <option value="">-- Non défini --</option>
              <option value="Fort">Fort</option>
              <option value="Moyen">Moyen</option>
              <option value="Faible">Faible</option>
              <option value="Nul">Nul</option>
            </select>
          </div>

          <!-- Position info (readonly) -->
          <div class="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm">
            <p class="mb-1 flex items-center gap-2 font-medium">
              <MapPin class="h-4 w-4" />
              Position sur le modèle 3D
            </p>
            <p class="font-mono text-xs">
              X: {pendingPosition.anchorPosition.x.toFixed(3)} | Y: {pendingPosition.anchorPosition.y.toFixed(
                3,
              )} | Z: {pendingPosition.anchorPosition.z.toFixed(3)}
            </p>
          </div>
        </div>

        <div class="modal-action">
          <button type="button" onclick={onClose} class="btn">Annuler</button>
          <button type="submit" disabled={isSaving || !objetId} class="btn btn-primary">
            <Save size={16} />
            {isSaving ? "Enregistrement..." : "Enregistrer le tag"}
          </button>
        </div>
      </form>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={onClose}>close</button>
  </form>
</dialog>
