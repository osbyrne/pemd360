<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { ArrowLeft, MapPin, Globe, Plus } from "lucide-svelte";
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";

  export let data: PageData;
  export let form: ActionData;
  $: ({ societes } = data);

  let data_form = form?.data || {
    nom: "",
    societeId: "",
    raisonSocial: "",
    rue: "",
    cp: "",
    ville: "",
    tel: "",
    fax: "",
    email: "",
    siret: "",
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
    Globe: {
      height: "1.5rem",
      width: "1.5rem",
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
      href="/app/admin/etablissements"
      class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonPrimary).class}
    >
      <ArrowLeft class={stylex.attrs(styles.ArrowLeft).class} />
      Retour à la liste
    </a>
  </div>

  <!-- Titre -->
  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>Nouveau établissement</h1>
    <p class={stylex.attrs(styles.p).class}>
      Créez un nouvel établissement dans votre organisation.
    </p>
  </div>

  {#if form?.message}
    <div class={stylex.attrs(styles.div3).class}>
      {form.message}
    </div>
  {/if}

  <form method="POST" use:enhance class={stylex.attrs(styles.form).class}>
    <!-- Section Identifiants & Contact -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <Globe class={stylex.attrs(styles.Globe).class} />
        </div>
        <h2 class={stylex.attrs(styles.h2).class}>Identité & Contact</h2>
      </div>

      <div class={stylex.attrs(styles.div7).class}>
        <div class={stylex.attrs(styles.div8).class}>
          <label for="nom" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Nom de l'établissement</label
          >
          <input
            type="text"
            id="nom"
            name="nom"
            value={data_form.nom}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="Ex: Agence Paris"
          />
        </div>

        <div class={stylex.attrs(styles.div8).class}>
          <label for="societeId" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Société</label
          >
          <select
            id="societeId"
            name="societeId"
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.select).class}
          >
            <option value="" disabled selected={!data_form.societeId}
              >Sélectionnez une société</option
            >
            {#each societes as societe}
              <option value={societe.id} selected={societe.id === data_form.societeId}
                >{societe.nom}</option
              >
            {/each}
          </select>
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label
            for="raisonSocial"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Raison Sociale *</label
          >
          <input
            type="text"
            id="raisonSocial"
            name="raisonSocial"
            value={data_form.raisonSocial}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="siret" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >SIRET</label
          >
          <input
            type="text"
            id="siret"
            name="siret"
            value={data_form.siret}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="14 chiffres"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="email" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Email *</label
          >
          <input
            type="email"
            id="email"
            name="email"
            value={data_form.email}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="contact@etab.com"
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="tel" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Téléphone *</label
          >
          <input
            type="tel"
            id="tel"
            name="tel"
            value={data_form.tel}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
      </div>
    </div>

    <!-- Section Localisation -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <MapPin class={stylex.attrs(styles.Globe).class} />
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
        <div class={stylex.attrs(styles.div8).class}>
          <label for="fax" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Fax</label
          >
          <input
            type="text"
            id="fax"
            name="fax"
            value={data_form.fax}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div10).class}>
      <a href="/app/admin/etablissements" class={stylex.attrs(ui.button).class}> Annuler </a>
      <button type="submit" class={stylex.attrs(ui.button).class}>
        <Plus class={stylex.attrs(styles.Plus).class} />
        Créer l'établissement
      </button>
    </div>
  </form>
</div>
