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

  const storedDocuments: string[] = JSON.parse(data.diagnostic?.documentsConsultes || "[]");

  let desordres = $derived(!!data.diagnostic?.desordres);
  let precaution = $derived(!!data.diagnostic?.precaution);
  let documentsConsultes = $state([...storedDocuments]);

  const documentsList = [
    "Dossier des Ouvrages Exécutés (DOE) des bâtiments existants",
    "Plans",
    "Diagnostic amiante",
    "Diagnostic plomb",
    "Diagnostic termites",
    "Autre",
  ];

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "48rem",
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
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "oklch(95.3% 0.051 180.801)",
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
    label: {
      marginBottom: "0.5rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div6: {
      display: "flex",
      gap: "1rem",
    },
    label2: {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      gap: "0.5rem",
    },
    div7: {
      "--stack-gap": "0.5rem",
    },
    label3: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div8: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1rem",
    },
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>CERFA · Le diagnostic</title>
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
      <h1 class={stylex.attrs(styles.h1).class}>Le diagnostic</h1>
    </div>
    <div class={stylex.attrs(styles.div5).class}>
      <form method="POST" use:enhance class={stylex.attrs(styles.form).class}>
        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="derniereVisite" class={stylex.attrs(styles.label).class}
            >Date de la dernière visite de l'opération</label
          >
          <input
            id="derniereVisite"
            name="derniereVisite"
            type="date"
            value={toDateInput(data.diagnostic?.derniereVisite)}
            class={stylex.attrs(ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="batVisite" class={stylex.attrs(styles.label).class}
            >Les bâtiments ou parties de bâtiments visitées par le diagnostiqueur</label
          >
          <textarea
            id="batVisite"
            name="batVisite"
            rows="3"
            placeholder="parties de bâtiments visitées"
            class={stylex.attrs(ui.input).class}>{data.diagnostic?.batVisite || ""}</textarea
          >
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="batNonVisite" class={stylex.attrs(styles.label).class}
            >Les bâtiments ou parties de bâtiments non visitées par le diagnostiqueur</label
          >
          <textarea
            id="batNonVisite"
            name="batNonVisite"
            rows="3"
            placeholder="parties de bâtiments non visitées"
            class={stylex.attrs(ui.input).class}>{data.diagnostic?.batNonVisite || ""}</textarea
          >
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="raisonsNePasVisite" class={stylex.attrs(styles.label).class}
            >Raisons pour n'avoir pas visité ces parties</label
          >
          <textarea
            id="raisonsNePasVisite"
            name="raisonsNePasVisite"
            rows="3"
            placeholder="Raisons"
            class={stylex.attrs(ui.input).class}
            >{data.diagnostic?.raisonsNePasVisite || ""}</textarea
          >
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <div class={stylex.attrs(styles.label).class}>
            Le diagnostic a-t-il identifié des vices ou des désordres apparents dans des composants
            des bâtiments ?
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label for="desordres-oui" class={stylex.attrs(styles.label2).class}>
              <input
                id="desordres-oui"
                type="radio"
                name="desordres"
                value="true"
                checked={desordres}
                onchange={() => (desordres = true)}
                class={stylex.attrs(ui.radio).class}
              />
              <span>Oui</span>
            </label>
            <label for="desordres-non" class={stylex.attrs(styles.label2).class}>
              <input
                id="desordres-non"
                type="radio"
                name="desordres"
                value="false"
                checked={!desordres}
                onchange={() => (desordres = false)}
                class={stylex.attrs(ui.radio).class}
              />
              <span>Non</span>
            </label>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <div class={stylex.attrs(styles.label).class}>
            Le rapport de diagnostic fournit-il des indications sur les précautions de démolition ou
            de rénovation ?
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label for="precaution-oui" class={stylex.attrs(styles.label2).class}>
              <input
                id="precaution-oui"
                type="radio"
                name="precaution"
                value="true"
                checked={precaution}
                onchange={() => (precaution = true)}
                class={stylex.attrs(ui.radio).class}
              />
              <span>Oui</span>
            </label>
            <label for="precaution-non" class={stylex.attrs(styles.label2).class}>
              <input
                id="precaution-non"
                type="radio"
                name="precaution"
                value="false"
                checked={!precaution}
                onchange={() => (precaution = false)}
                class={stylex.attrs(ui.radio).class}
              />
              <span>Non</span>
            </label>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <div class={stylex.attrs(styles.label).class}>Documents consultés</div>
          <div class={stylex.attrs(styles.div7).class}>
            {#each documentsList as doc}
              <label
                for={`doc-${doc.replace(/\s+/g, "-").toLowerCase()}`}
                class={stylex.attrs(styles.stackSpacing05, styles.label3).class}
              >
                <input
                  id={`doc-${doc.replace(/\s+/g, "-").toLowerCase()}`}
                  type="checkbox"
                  name="documentsConsultes"
                  value={doc}
                  checked={documentsConsultes.includes(doc)}
                  onchange={(e) => {
                    if (e.currentTarget.checked) {
                      documentsConsultes = [...documentsConsultes, doc];
                    } else {
                      documentsConsultes = documentsConsultes.filter((d) => d !== doc);
                    }
                  }}
                  class={stylex.attrs(ui.checkbox).class}
                />
                <span class={stylex.attrs(styles.span).class}>{doc}</span>
              </label>
            {/each}
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div8).class}>
          <a href="/app/cerfa/informations?projetId={id}" class={stylex.attrs(ui.button).class}
            >Annuler</a
          >
          <button type="submit" class={stylex.attrs(ui.button).class}>Valider</button>
        </div>
      </form>
    </div>
  </div>
</div>
