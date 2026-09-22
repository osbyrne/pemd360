<script lang="ts">
  import { theme } from "../../../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import { enhance } from "$app/forms";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const id = $derived($page.params.id);

  let typePersonne = $derived(data.diagnostiqueur?.nomPerMorale ? "morale" : "physique");

  function toDateInput(ts: number | null | undefined): string {
    if (!ts) return "";
    return new Date(ts).toISOString().split("T")[0];
  }

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "42rem",
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
    fieldset: {
      borderWidth: 0,
      margin: 0,
      minWidth: 0,
      padding: 0,
    },
    legend: {
      padding: 0,
    },
    div7: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    div8: {
      display: "flex",
      gap: "1rem",
      borderRadius: ".5rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    label2: {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      gap: "0.5rem",
    },
    span: {
      fontWeight: 500,
    },
    div9: {
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
    div10: {
      "--stack-gap": "1rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1.5rem",
    },
    label3: {
      display: "flex",
      cursor: "pointer",
      alignItems: "flex-start",
      gap: "0.75rem",
    },
    span2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div11: {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1.5rem",
    },
    div12: {
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
  });
</script>

<svelte:head>
  <title>CERFA · Diagnostiqueur</title>
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
      <h1 class={stylex.attrs(styles.h1).class}>Le diagnostiqueur</h1>
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
              value={data.diagnostiqueur?.adresse || ""}
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
                value={data.diagnostiqueur?.cp || ""}
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
                value={data.diagnostiqueur?.commune || ""}
                placeholder="Commune"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div8).class}>
          <label for="personne-physique" class={stylex.attrs(styles.label2).class}>
            <input
              id="personne-physique"
              type="radio"
              name="typePersonne"
              value="physique"
              checked={typePersonne === "physique"}
              onchange={() => (typePersonne = "physique")}
              class={stylex.attrs(ui.radio).class}
            />
            <span class={stylex.attrs(styles.span).class}>Personne physique</span>
          </label>
          <label for="personne-morale" class={stylex.attrs(styles.label2).class}>
            <input
              id="personne-morale"
              type="radio"
              name="typePersonne"
              value="morale"
              checked={typePersonne === "morale"}
              onchange={() => (typePersonne = "morale")}
              class={stylex.attrs(ui.radio).class}
            />
            <span class={stylex.attrs(styles.span).class}>Personne morale</span>
          </label>
        </div>

        {#if typePersonne === "physique"}
          <div class={stylex.attrs(styles.stackSpacing15, styles.div9).class}>
            <h4 class={stylex.attrs(styles.stackSpacing1, styles.h4).class}>
              Si personne physique
            </h4>
            <div class={stylex.attrs(styles.stackSpacing1).class}>
              <label for="nom" class={stylex.attrs(styles.label).class}>Nom</label>
              <input
                id="nom"
                name="nom"
                type="text"
                value={data.diagnostiqueur?.nomPerPhy || ""}
                placeholder="Nom"
                class={stylex.attrs(ui.input).class}
              />
            </div>
            <div class={stylex.attrs(styles.stackSpacing1).class}>
              <label for="prenom" class={stylex.attrs(styles.label).class}>Prénom</label>
              <input
                id="prenom"
                name="prenom"
                type="text"
                value={data.diagnostiqueur?.prenomPerPhy || ""}
                placeholder="Prénom"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        {:else}
          <div class={stylex.attrs(styles.stackSpacing15, styles.div9).class}>
            <h4 class={stylex.attrs(styles.stackSpacing1, styles.h4).class}>Si personne morale</h4>
            <div class={stylex.attrs(styles.stackSpacing1).class}>
              <label for="raisonSociale" class={stylex.attrs(styles.label).class}
                >Raison sociale</label
              >
              <input
                id="raisonSociale"
                name="raisonSociale"
                type="text"
                value={data.diagnostiqueur?.nomPerMorale || ""}
                placeholder="Raison sociale"
                class={stylex.attrs(ui.input).class}
              />
            </div>
            <div class={stylex.attrs(styles.stackSpacing1).class}>
              <label for="siretSiren" class={stylex.attrs(styles.label).class}
                >Numéro de Siret ou Siren</label
              >
              <input
                id="siretSiren"
                name="siretSiren"
                type="text"
                value={data.diagnostiqueur?.siretSiren || ""}
                placeholder="Siret ou Siren"
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </div>
        {/if}

        <div class={stylex.attrs(styles.stackSpacing15, styles.div10).class}>
          <h4 class={stylex.attrs(styles.stackSpacing1, styles.h4).class}>
            Assurance souscrite par le diagnostiqueur
          </h4>
          <label
            for="engagementAssurance"
            class={stylex.attrs(styles.stackSpacing1, styles.label3).class}
          >
            <input
              id="engagementAssurance"
              name="engagementAssurance"
              type="checkbox"
              checked={!!data.diagnostiqueur?.engagementAssurance}
              class={stylex.attrs(ui.checkbox).class}
            />
            <span class={stylex.attrs(styles.span2).class}>
              Je déclare qu'en cas de sinistre l'assurance souscrite couvre les activités du
              diagnostiqueur et que le montant de la garantie est d'au moins 300 000 € par sinistre
              et 500 000 € par année d'assurance.
            </span>
          </label>
          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="nomAssurance" class={stylex.attrs(styles.label).class}
              >Nom de la compagnie d'assurance</label
            >
            <input
              id="nomAssurance"
              name="nomAssurance"
              type="text"
              value={data.diagnostiqueur?.nomAssurance || ""}
              placeholder="Nom de la compagnie d'assurance"
              class={stylex.attrs(ui.input).class}
            />
          </div>
          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <label for="numeroPolice" class={stylex.attrs(styles.label).class}
              >Numéro de police</label
            >
            <input
              id="numeroPolice"
              name="numeroPolice"
              type="text"
              value={data.diagnostiqueur?.numeroPolice || ""}
              placeholder="Numéro de police"
              class={stylex.attrs(ui.input).class}
            />
          </div>
          <fieldset class={stylex.attrs(styles.stackSpacing1, styles.fieldset).class}>
            <legend class={stylex.attrs(styles.label, styles.legend).class}>Date de validité</legend>
            <div class={stylex.attrs(styles.div7).class}>
              <input
                id="dateDebutAssurance"
                name="dateDebutAssurance"
                type="date"
                aria-label="Début de validité"
                value={toDateInput(data.diagnostiqueur?.dateDebutAssurance)}
                class={stylex.attrs(ui.input).class}
              />
              <input
                id="dateFinAssurance"
                name="dateFinAssurance"
                type="date"
                aria-label="Fin de validité"
                value={toDateInput(data.diagnostiqueur?.dateFinAssurance)}
                class={stylex.attrs(ui.input).class}
              />
            </div>
          </fieldset>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div11).class}>
          <label for="competences" class={stylex.attrs(styles.label3).class}>
            <input
              id="competences"
              name="competences"
              type="checkbox"
              checked={!!data.diagnostiqueur?.competences}
              class={stylex.attrs(ui.checkbox).class}
            />
            <span class={stylex.attrs(styles.span2).class}>
              Je déclare pouvoir justifier des compétences du diagnostiqueur à la demande de
              l'administration. (3)
            </span>
          </label>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15, styles.div12).class}>
          <a href="/app/cerfa/informations?projetId={id}" class={stylex.attrs(ui.button).class}
            >Annuler</a
          >
          <button type="submit" class={stylex.attrs(ui.button).class}>Valider</button>
        </div>
      </form>
    </div>
  </div>
</div>
