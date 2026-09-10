<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
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

  const styles = stylex.create({
    div: {
      maxHeight: "90vh",
      maxWidth: "32rem",
      overflowY: "auto",
    },
    div2: {
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div3: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(94.6% 0.033 307.174)",
    },
    Plus: {
      color: "oklch(49.6% 0.265 301.924)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p: {
      marginBottom: "1rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    span: {
      fontWeight: 500,
      color: "oklch(63.7% 0.237 25.331)",
    },
    div4: {
      "--stack-gap": "1rem",
    },
    div5: {
      paddingBottom: "1rem",
    },
    h4: {
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
    },
    span2: {
      height: "0.375rem",
      width: "0.375rem",
      borderRadius: "9999px",
      backgroundColor: "oklch(62.7% 0.265 303.9)",
    },
    span3: {
      color: "oklch(63.7% 0.237 25.331)",
    },
    div6: {
      marginBottom: "0.75rem",
    },
    label: {
      marginBottom: "0.25rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    span4: {
      marginRight: "0.25rem",
      display: "inline-flex",
      height: "1.25rem",
      width: "1.25rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(94.6% 0.033 307.174)",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 700,
      color: "oklch(49.6% 0.265 301.924)",
    },
    p2: {
      marginTop: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    span5: {
      display: "inline-flex",
      height: "1.25rem",
      width: "1.25rem",
      alignItems: "center",
      justifyContent: "center",
      marginRight: "0.25rem",
      borderRadius: "9999px",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 700,
    },
    p3: {
      marginTop: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      color: "oklch(66.6% 0.179 58.318)",
    },
    span6: {
      height: "0.375rem",
      width: "0.375rem",
      borderRadius: "9999px",
    },
    span7: {
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 400,
    },
    div7: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "0.75rem",
    },
    div8: {
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(90.2% 0.063 306.703)",
      backgroundColor: "oklch(97.7% 0.014 308.299)",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p4: {
      marginBottom: "0.25rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontWeight: 500,
    },
    MapPin: {
      height: "1rem",
      width: "1rem",
    },
    p5: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<dialog bind:this={dialog} class={stylex.attrs(ui.dialog).class} onclose={onClose}>
  <div class={stylex.attrs(ui.dialogPanel, styles.div).class}>
    {#if pendingPosition}
      <div class={stylex.attrs(styles.div2).class}>
        <div class={stylex.attrs(styles.div3).class}>
          <Plus size={20} class={stylex.attrs(styles.Plus).class} />
        </div>
        <h3 class={stylex.attrs(styles.h3).class}>Nouveau tag PEMD</h3>
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
        <p class={stylex.attrs(styles.p).class}>
          Les champs marqués d'un <span class={stylex.attrs(styles.span).class}>*</span> sont obligatoires
        </p>

        <div class={stylex.attrs(styles.div4).class}>
          <!-- Section: Identification du matériau -->
          <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
            <h4 class={stylex.attrs(styles.h4).class}>
              <span class={stylex.attrs(styles.span2).class}></span>
              Identification du matériau <span class={stylex.attrs(styles.span3).class}>*</span>
            </h4>

            <!-- Étape 1: Groupe -->
            <div class={stylex.attrs(styles.div6).class}>
              <label for="pemd-groupe" class={stylex.attrs(styles.label).class}>
                <span class={stylex.attrs(styles.span4).class}>1</span>
                Groupe
              </label>
              <select
                id="pemd-groupe"
                bind:value={groupId}
                onchange={handleGroupChange}
                class={stylex.attrs(ui.select).class}
              >
                <option value="">-- Sélectionner un groupe --</option>
                {#each groups as group (group.id)}
                  <option value={group.id}>{group.name}</option>
                {/each}
              </select>
              {#if !groupId}
                <p class={stylex.attrs(styles.p2).class}>Commencez par sélectionner un groupe</p>
              {/if}
            </div>

            <!-- Étape 2: Catégorie -->
            <div class={stylex.attrs(styles.div6).class}>
              <label for="pemd-categorie" class={stylex.attrs(styles.label).class}>
                <span class={stylex.attrs(styles.span5, groupId ? ui.bgPurple100 : false).class}
                  >2</span
                >
                Catégorie
              </label>
              <select
                id="pemd-categorie"
                bind:value={categoryId}
                onchange={handleCategoryChange}
                disabled={!groupId || categoriesFiltered.length === 0}
                class={stylex.attrs(
                  ui.select,
                  groupId && !categoryId ? ui.borderPurple300 : ui.borderGray300,
                ).class}
              >
                <option value="">-- Sélectionner une catégorie --</option>
                {#each categoriesFiltered as categorie (categorie.id)}
                  <option value={categorie.id}>{categorie.name}</option>
                {/each}
              </select>
              {#if !groupId}
                <p class={stylex.attrs(styles.p2).class}>Sélectionnez d'abord un groupe</p>
              {:else if categoriesFiltered.length === 0}
                <p class={stylex.attrs(styles.p3).class}>
                  Aucune catégorie disponible pour ce groupe
                </p>
              {:else if !categoryId}
                <p class={stylex.attrs(styles.p2).class}>
                  Sélectionnez une catégorie ({categoriesFiltered.length} disponible{categoriesFiltered.length >
                  1
                    ? "s"
                    : ""})
                </p>
              {/if}
            </div>

            <!-- Étape 3: Objet (OBLIGATOIRE) -->
            <div>
              <label for="pemd-objet" class={stylex.attrs(styles.label).class}>
                <span class={stylex.attrs(styles.span5, categoryId ? ui.bgPurple100 : false).class}
                  >3</span
                >
                Objet <span class={stylex.attrs(styles.span3).class}>*</span>
              </label>
              <select
                id="pemd-objet"
                bind:value={objetId}
                name="objetId"
                required
                disabled={!categoryId || objectsFiltered.length === 0}
                class={stylex.attrs(
                  ui.select,
                  categoryId && !objetId ? ui.borderRed300 : ui.borderGray300,
                ).class}
              >
                <option value="">-- Sélectionner un objet --</option>
                {#each objectsFiltered as object (object.id)}
                  <option value={object.id}>{object.name}</option>
                {/each}
              </select>
              {#if !categoryId}
                <p class={stylex.attrs(styles.p2).class}>Sélectionnez d'abord une catégorie</p>
              {:else if objectsFiltered.length === 0}
                <p class={stylex.attrs(styles.p3).class}>
                  Aucun objet disponible pour cette catégorie
                </p>
              {:else if !objetId}
                <p class={stylex.attrs(styles.p2).class}>
                  Sélectionnez un objet ({objectsFiltered.length} disponible{objectsFiltered.length >
                  1
                    ? "s"
                    : ""})
                </p>
              {:else}
                <p class={stylex.attrs(styles.p2).class}>Objet sélectionné</p>
              {/if}
            </div>
          </div>

          <!-- Section: Informations complémentaires (optionnel) -->
          <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
            <h4 class={stylex.attrs(styles.h4).class}>
              <span class={stylex.attrs(styles.span6).class}></span>
              Informations complémentaires
              <span class={stylex.attrs(styles.span7).class}>(optionnel)</span>
            </h4>

            <!-- Description -->
            <div class={stylex.attrs(styles.div6).class}>
              <label for="pemd-description" class={stylex.attrs(styles.label).class}
                >Description</label
              >
              <textarea
                id="pemd-description"
                bind:value={description}
                name="description"
                rows="2"
                class={stylex.attrs(ui.input).class}
                placeholder="Description du matériau..."></textarea>
            </div>

            <!-- Row: Quantité, Étage, État -->
            <div class={stylex.attrs(styles.div7).class}>
              <div>
                <label for="pemd-quantite" class={stylex.attrs(styles.label).class}>Quantité</label>
                <input
                  id="pemd-quantite"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={quantite}
                  name="quantite"
                  class={stylex.attrs(ui.input).class}
                  placeholder="0"
                />
              </div>
              <div>
                <label for="pemd-etage" class={stylex.attrs(styles.label).class}>Étage</label>
                <input
                  id="pemd-etage"
                  type="text"
                  bind:value={etage}
                  name="etage"
                  class={stylex.attrs(ui.input).class}
                  placeholder="RDC, 1, 2..."
                />
              </div>
              <div>
                <label for="pemd-etat" class={stylex.attrs(styles.label).class}>État</label>
                <select
                  id="pemd-etat"
                  bind:value={etat}
                  name="etat"
                  class={stylex.attrs(ui.select).class}
                >
                  <option value="">--</option>
                  <option value="Bon">Bon</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Mauvais">Mauvais</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Section: Dimensions (optionnel) -->
          <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
            <h4 class={stylex.attrs(styles.h4).class}>
              <span class={stylex.attrs(styles.span6).class}></span>
              Dimensions <span class={stylex.attrs(styles.span7).class}>(optionnel)</span>
            </h4>

            <div class={stylex.attrs(styles.div7).class}>
              <div>
                <label for="pemd-longueur" class={stylex.attrs(styles.label).class}
                  >Longueur (m)</label
                >
                <input
                  id="pemd-longueur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={longueur}
                  name="longueur"
                  class={stylex.attrs(ui.input).class}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label for="pemd-largeur" class={stylex.attrs(styles.label).class}
                  >Largeur (m)</label
                >
                <input
                  id="pemd-largeur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={largeur}
                  name="largeur"
                  class={stylex.attrs(ui.input).class}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label for="pemd-epaisseur" class={stylex.attrs(styles.label).class}
                  >Épaisseur (m)</label
                >
                <input
                  id="pemd-epaisseur"
                  type="number"
                  step="0.01"
                  min="0"
                  bind:value={epaisseur}
                  name="epaisseur"
                  class={stylex.attrs(ui.input).class}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <!-- Section: Potentiel Réemploi (optionnel) -->
          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="pemd-potentiel" class={stylex.attrs(styles.label).class}>
              Potentiel de réemploi <span class={stylex.attrs(styles.span7).class}>(optionnel)</span
              >
            </label>
            <select
              id="pemd-potentiel"
              bind:value={potentielReemploi}
              name="potentielReemploi"
              class={stylex.attrs(ui.select).class}
            >
              <option value="">-- Non défini --</option>
              <option value="Fort">Fort</option>
              <option value="Moyen">Moyen</option>
              <option value="Faible">Faible</option>
              <option value="Nul">Nul</option>
            </select>
          </div>

          <!-- Position info (readonly) -->
          <div class={stylex.attrs(styles.stackSpacing1, styles.div8).class}>
            <p class={stylex.attrs(styles.p4).class}>
              <MapPin class={stylex.attrs(styles.MapPin).class} />
              Position sur le modèle 3D
            </p>
            <p class={stylex.attrs(styles.p5).class}>
              X: {pendingPosition.anchorPosition.x.toFixed(3)} | Y: {pendingPosition.anchorPosition.y.toFixed(
                3,
              )} | Z: {pendingPosition.anchorPosition.z.toFixed(3)}
            </p>
          </div>
        </div>

        <div class={stylex.attrs(ui.dialogActions).class}>
          <button type="button" onclick={onClose} class={stylex.attrs(ui.button).class}
            >Annuler</button
          >
          <button
            type="submit"
            disabled={isSaving || !objetId}
            class={stylex.attrs(ui.button, ui.buttonPrimary).class}
          >
            <Save size={16} />
            {isSaving ? "Enregistrement..." : "Enregistrer le tag"}
          </button>
        </div>
      </form>
    {/if}
  </div>
  <form method="dialog" class={stylex.attrs(ui.dialogBackdrop).class}>
    <button onclick={onClose}>close</button>
  </form>
</dialog>
