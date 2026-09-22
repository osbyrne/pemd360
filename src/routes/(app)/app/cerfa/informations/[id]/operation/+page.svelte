<script lang="ts">
  import { theme } from "../../../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const id = $derived($page.params.id);

  function toDateInput(ts: number | null | undefined): string {
    if (!ts) return "";
    return new Date(ts).toISOString().split("T")[0];
  }

  const storedTypologies = (): string[] => JSON.parse(data.operation?.typologieBat || "[]");
  const storedOperationsSoumis = (): string[] =>
    JSON.parse(data.operation?.operationSoumis || "[]");

  let typologies = $state([...storedTypologies()]);
  let operationsSoumis = $state([...storedOperationsSoumis()]);

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

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "56rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    div2: {
      marginBottom: "1.5rem",
    },
    div3: {
      backgroundColor: theme.base100,
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div4: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    h1: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div5: {
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    form: {
      "--stack-gap": "1.5rem",
    },
    div6: {
      display: "grid",
      gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
      gap: "1rem",
    },
    label: {
      marginBottom: "0.5rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div7: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    div8: {
      "--stack-gap": "1rem",
      borderRadius: ".5rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    h4: {
      fontWeight: 600,
    },
    div9: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "0.75rem",
    },
    label2: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div10: {
      "--stack-gap": "0.5rem",
    },
    div11: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1rem",
    },
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>CERFA · L'opération</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <a
      href="/app/cerfa/informations?projetId={id}"
      class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonSmall).class}>← Retour</a
    >
  </div>

  <div class={stylex.attrs(ui.card, styles.div3).class}>
    <div class={stylex.attrs(styles.div4).class}>
      <h1 class={stylex.attrs(styles.h1).class}>L'opération</h1>
    </div>
    <div class={stylex.attrs(styles.div5).class}>
      <form method="POST" use:enhance class={stylex.attrs(styles.form).class}>
        <div class={stylex.attrs(styles.stackSpacing15, styles.div6).class}>
          <div>
            <label for="adresse" class={stylex.attrs(styles.label).class}>Adresse</label>
            <input
              id="adresse"
              name="adresse"
              type="text"
              value={data.operation?.adresse || ""}
              placeholder="Adresse"
              class={stylex.attrs(ui.input).class}
            />
          </div>
          <div class={stylex.attrs(styles.div7).class}>
            <div>
              <label for="cp" class={stylex.attrs(styles.label).class}>Code postal</label>
              <input
                id="cp"
                name="cp"
                type="text"
                value={data.operation?.cp || ""}
                placeholder="Code postal"
                class={stylex.attrs(ui.input).class}
              />
            </div>
            <div>
              <label for="commune" class={stylex.attrs(styles.label).class}>Commune</label>
              <input
                id="commune"
                name="commune"
                type="text"
                value={data.operation?.commune || ""}
                placeholder="Commune"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div7).class}>
          <div>
            <label for="dateDebut" class={stylex.attrs(styles.label).class}>Date de début</label>
            <input
              id="dateDebut"
              name="dateDebut"
              type="date"
              value={toDateInput(data.operation?.dateDeDebut)}
              class={stylex.attrs(ui.input).class}
            />
          </div>
          <div>
            <label for="dateFin" class={stylex.attrs(styles.label).class}>Date de fin</label>
            <input
              id="dateFin"
              name="dateFin"
              type="date"
              value={toDateInput(data.operation?.dateDeFin)}
              class={stylex.attrs(ui.input).class}
            />
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="operation" class={stylex.attrs(styles.label).class}
            >L'opération est-elle</label
          >
          <select id="operation" name="operation" class={stylex.attrs(ui.select).class}>
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

        <div class={stylex.attrs(styles.stackSpacing15, styles.div8).class}>
          <h4 class={stylex.attrs(styles.stackSpacing1, styles.h4).class}>Démolition</h4>
          <div class={stylex.attrs(styles.stackSpacing1, styles.div7).class}>
            <div>
              <label for="nbBatDemolition" class={stylex.attrs(styles.label).class}
                >Nombre de bâtiments concernés</label
              >
              <input
                id="nbBatDemolition"
                name="nbBatDemolition"
                type="number"
                value={data.operation?.nbBatDemolition ?? 0}
                min="0"
                class={stylex.attrs(ui.input).class}
              />
            </div>
            <div>
              <label for="surfaceDemolir" class={stylex.attrs(styles.label).class}
                >Surface totale de plancher (m²)</label
              >
              <input
                id="surfaceDemolir"
                name="surfaceDemolir"
                type="number"
                value={data.operation?.surfaceADemolir ?? 0}
                min="0"
                step="0.01"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div8).class}>
          <h4 class={stylex.attrs(styles.stackSpacing1, styles.h4).class}>
            Rénovation significative
          </h4>
          <div class={stylex.attrs(styles.stackSpacing1, styles.div7).class}>
            <div>
              <label for="nbBatRenovation" class={stylex.attrs(styles.label).class}
                >Nombre de bâtiments concernés</label
              >
              <input
                id="nbBatRenovation"
                name="nbBatRenovation"
                type="number"
                value={data.operation?.nbBatRenovation ?? 0}
                min="0"
                class={stylex.attrs(ui.input).class}
              />
            </div>
            <div>
              <label for="surfaceRenover" class={stylex.attrs(styles.label).class}
                >Surface totale de plancher (m²)</label
              >
              <input
                id="surfaceRenover"
                name="surfaceRenover"
                type="number"
                value={data.operation?.surfaceARenover ?? 0}
                min="0"
                step="0.01"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <div class={stylex.attrs(styles.label).class}>Typologies principales des bâtiments</div>
          <div class={stylex.attrs(styles.div9).class}>
            {#each typologiesList as typologie}
              <label
                for={`typologie-${typologie.replace(/\s+/g, "-").toLowerCase()}`}
                class={stylex.attrs(styles.label2).class}
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
                  class={stylex.attrs(ui.checkbox).class}
                />
                <span class={stylex.attrs(styles.span).class}>{typologie}</span>
              </label>
            {/each}
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="datePermis" class={stylex.attrs(styles.label).class}
            >Date d'obtention du permis de construction du bâtiment le plus ancien</label
          >
          <input
            id="datePermis"
            name="datePermis"
            type="date"
            value={toDateInput(data.operation?.datePermisDeConstruire)}
            class={stylex.attrs(ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <div class={stylex.attrs(styles.label).class}>
            Cochez, s'il y en a eu, le(s) type(s) d'opération(s) auxquel(s) le bâtiment a été soumis
            depuis la date mentionnée ci-dessus :
          </div>
          <div class={stylex.attrs(styles.div10).class}>
            <label class={stylex.attrs(styles.stackSpacing05, styles.label2).class}>
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
                class={stylex.attrs(ui.checkbox).class}
              />
              <span class={stylex.attrs(styles.span).class}>Rénovation importante</span>
            </label>
            {#if operationsSoumis.includes("renovation")}
              <input
                type="month"
                name="dateRenovation"
                class={stylex.attrs(styles.stackSpacing05, ui.input).class}
              />
            {/if}
            <label class={stylex.attrs(styles.stackSpacing05, styles.label2).class}>
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
                class={stylex.attrs(ui.checkbox).class}
              />
              <span class={stylex.attrs(styles.span).class}
                >Opération de décontamination (ex: désamiantage)</span
              >
            </label>
            <label class={stylex.attrs(styles.stackSpacing05, styles.label2).class}>
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
                class={stylex.attrs(ui.checkbox).class}
              />
              <span class={stylex.attrs(styles.span).class}>Autre intervention importante</span>
            </label>
            <label class={stylex.attrs(styles.stackSpacing05, styles.label2).class}>
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
                class={stylex.attrs(ui.checkbox).class}
              />
              <span class={stylex.attrs(styles.span).class}>Aucune opération</span>
            </label>
            <label class={stylex.attrs(styles.stackSpacing05, styles.label2).class}>
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
                class={stylex.attrs(ui.checkbox).class}
              />
              <span class={stylex.attrs(styles.span).class}>Ne sait pas</span>
            </label>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div11).class}>
          <a href="/app/cerfa/informations?projetId={id}" class={stylex.attrs(ui.button).class}
            >Annuler</a
          >
          <button type="submit" class={stylex.attrs(ui.button).class}>Valider</button>
        </div>
      </form>
    </div>
  </div>
</div>
