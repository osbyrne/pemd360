<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { ArrowLeft, Plus, ChartNoAxesCombined, MapPin } from "lucide-svelte";
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";

  export let data: PageData;
  export let form: ActionData;

  $: ({ etablissements } = data);

  let data_form = form?.data || {
    id: "",
    libelle: "",
    reference: "",
    etablissementId: "",
    codeInsee: "",
    rue: "",
    cp: "",
    ville: "",
    dateDemarrage: "",
    section: "",
    parcelle: "",
    typeOperation: "",
    maitreDOuvrage: "",
    dateDeFin: "",
  };

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "56rem",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "2rem",
      paddingBottom: "2rem",
    },
    div2: {
      marginBottom: "2rem",
    },
    ArrowLeft: {
      height: "1rem",
      width: "1rem",
    },
    h1: {
      marginBottom: "0.5rem",
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div3: {
      marginBottom: "1.5rem",
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(88.5% 0.062 18.334)",
      backgroundColor: "oklch(97.1% 0.013 17.38)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
      color: "oklch(50.5% 0.213 27.518)",
    },
    form: {
      "--stack-gap": "2rem",
    },
    div4: {
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div5: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div6: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(97.9% 0.021 166.113)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    ChartNoAxesCombined: {
      color: "oklch(59.6% 0.145 163.225)",
    },
    h2: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div7: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "1.5rem",
    },
    div8: {
      "--stack-gap": "0.375rem",
      gridColumn: {
        "@media (min-width: 768px)": "span 2 / span 2",
      },
    },
    label: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    p2: {
      marginTop: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div9: {
      "--stack-gap": "0.375rem",
    },
    div10: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      paddingTop: "1rem",
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    Plus: {
      marginRight: "0.5rem",
      height: "1rem",
      width: "1rem",
    },
    stackSpacing2: { marginBlockEnd: { default: "2rem", ":last-child": 0 } },
    stackSpacing0375: { marginBlockEnd: { default: "0.375rem", ":last-child": 0 } },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <!-- Fil d'ariane / Retour -->
  <div class={stylex.attrs(styles.div2).class}>
    <a
      href="/app/admin/projets"
      class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonPrimary).class}
    >
      <ArrowLeft class={stylex.attrs(styles.ArrowLeft).class} />
      Retour à la liste
    </a>
  </div>

  <!-- Titre -->
  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>Nouveau projet</h1>
    <p class={stylex.attrs(styles.p).class}>Créez un nouveau projet dans la plateforme.</p>
  </div>

  {#if form?.message}
    <div class={stylex.attrs(styles.div3).class}>
      {form.message}
    </div>
  {/if}

  <form method="POST" use:enhance class={stylex.attrs(styles.form).class}>
    <!-- Section Identité -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <ChartNoAxesCombined class={stylex.attrs(styles.ChartNoAxesCombined).class} />
        </div>
        <h2 class={stylex.attrs(styles.h2).class}>Informations du projet</h2>
      </div>

      <div class={stylex.attrs(styles.div7).class}>
        <div class={stylex.attrs(styles.div8).class}>
          <label for="id" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >ID Matterport *</label
          >
          <input
            type="text"
            id="id"
            name="id"
            value={data_form.id}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="ex: SxQL3iGy1rE (ID de la visite Matterport)"
          />
          <p class={stylex.attrs(styles.stackSpacing0375, styles.p2).class}>
            L'identifiant unique de la visite Matterport (visible dans l'URL de la visite)
          </p>
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="reference" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Référence *</label
          >
          <input
            type="text"
            id="reference"
            name="reference"
            value={data_form.reference}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="REF-2024-001"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="libelle" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Libellé *</label
          >
          <input
            type="text"
            id="libelle"
            name="libelle"
            value={data_form.libelle}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="Nom du projet"
          />
        </div>

        <div class={stylex.attrs(styles.div8).class}>
          <label
            for="etablissementId"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Établissement *</label
          >
          <select
            id="etablissementId"
            name="etablissementId"
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.select).class}
          >
            <option value="" disabled selected={!data_form.etablissementId}
              >Sélectionnez un établissement</option
            >
            {#each etablissements as etab}
              <option value={etab.id} selected={etab.id.toString() === data_form.etablissementId}>
                {etab.nom} ({etab.societeNom || "Sans société"})
              </option>
            {/each}
          </select>
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label
            for="typeOperation"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Type d'opération</label
          >
          <input
            type="text"
            id="typeOperation"
            name="typeOperation"
            value={data_form.typeOperation}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="Démolition, Rénovation..."
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label
            for="maitreDOuvrage"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Maître d'ouvrage</label
          >
          <input
            type="text"
            id="maitreDOuvrage"
            name="maitreDOuvrage"
            value={data_form.maitreDOuvrage}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label
            for="dateDemarrage"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Date de démarrage *</label
          >
          <input
            type="date"
            id="dateDemarrage"
            name="dateDemarrage"
            value={data_form.dateDemarrage}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="dateDeFin" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Date de fin</label
          >
          <input
            type="date"
            id="dateDeFin"
            name="dateDeFin"
            value={data_form.dateDeFin}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
      </div>
    </div>

    <!-- Section Localisation -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <MapPin class={stylex.attrs(styles.ChartNoAxesCombined).class} />
        </div>
        <h2 class={stylex.attrs(styles.h2).class}>Localisation</h2>
      </div>

      <div class={stylex.attrs(styles.div7).class}>
        <div class={stylex.attrs(styles.div8).class}>
          <label for="rue" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Adresse *</label
          >
          <input
            type="text"
            id="rue"
            name="rue"
            value={data_form.rue}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="123 rue de la Paix"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="cp" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Code Postal *</label
          >
          <input
            type="text"
            id="cp"
            name="cp"
            value={data_form.cp}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="75000"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="ville" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Ville *</label
          >
          <input
            type="text"
            id="ville"
            name="ville"
            value={data_form.ville}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="Paris"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="codeInsee" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Code INSEE</label
          >
          <input
            type="text"
            id="codeInsee"
            name="codeInsee"
            value={data_form.codeInsee}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="75056"
            maxlength="5"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="section" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Section cadastrale *</label
          >
          <input
            type="text"
            id="section"
            name="section"
            value={data_form.section}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="AB"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="parcelle" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Parcelle *</label
          >
          <input
            type="text"
            id="parcelle"
            name="parcelle"
            value={data_form.parcelle}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="0123"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div10).class}>
      <a href="/app/admin/projets" class={stylex.attrs(ui.button).class}> Annuler </a>
      <button type="submit" class={stylex.attrs(ui.button).class}>
        <Plus class={stylex.attrs(styles.Plus).class} />
        Créer le projet
      </button>
    </div>
  </form>
</div>
