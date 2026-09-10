<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
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
  const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

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
    a: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      color: {
        default: "oklch(59.6% 0.145 163.225)",
        ":hover": "oklch(50.8% 0.118 165.612)",
      },
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
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
    LoaderCircle: {
      marginRight: "0.5rem",
      height: "1rem",
      width: "1rem",
      animationName: spin,
      animationDuration: "1s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
    },
    Save: {
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
    <a href="/app/admin/etablissements/{etablissement.id}" class={stylex.attrs(styles.a).class}>
      <ArrowLeft class={stylex.attrs(styles.ArrowLeft).class} />
      Retour aux détails
    </a>
  </div>

  <!-- Titre -->
  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>Modifier l'établissement</h1>
    <p class={stylex.attrs(styles.p).class}>
      Mettez à jour les informations de {etablissement.nom}.
    </p>
  </div>

  {#if form?.message}
    <div
      class={stylex.attrs(
        styles.div3,
        form.success === false
          ? [ui.border, ui.borderRed200, ui.bgRed50, ui.textRed700]
          : [ui.border, ui.borderEmerald200, ui.bgEmerald50, ui.textEmerald700],
      ).class}
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
    class={stylex.attrs(styles.form).class}
  >
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
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="nom"
            name="nom"
            value={etablissement.nom}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div8).class}>
          <label for="societeId" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Société</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <select
            id="societeId"
            name="societeId"
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.select).class}
          >
            {#each societes as societe}
              <option value={societe.id} selected={societe.id === etablissement.societeId}
                >{societe.nom}</option
              >
            {/each}
          </select>
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label
            for="raisonSocial"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Raison Sociale</label
          >
          <input
            type="text"
            id="raisonSocial"
            name="raisonSocial"
            value={etablissement.raisonSocial}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="siret" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >SIRET</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="siret"
            name="siret"
            value={etablissement.siret}
            required
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="email" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Email</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="email"
            id="email"
            name="email"
            value={etablissement.email}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>

        <div class={stylex.attrs(styles.div9).class}>
          <label for="tel" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Téléphone</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="tel"
            id="tel"
            name="tel"
            value={etablissement.tel}
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
            >Adresse</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="rue"
            name="rue"
            value={etablissement.rue}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
        <div class={stylex.attrs(styles.div9).class}>
          <label for="cp" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Code Postal</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="cp"
            name="cp"
            value={etablissement.cp}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
        <div class={stylex.attrs(styles.div9).class}>
          <label for="ville" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Ville</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="ville"
            name="ville"
            value={etablissement.ville}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
        <div class={stylex.attrs(styles.div8).class}>
          <label for="fax" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Fax</label
          >
          <br class={stylex.attrs(styles.stackSpacing0375).class} />
          <input
            type="text"
            id="fax"
            name="fax"
            value={etablissement.fax}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class={stylex.attrs(styles.stackSpacing2, styles.div10).class}>
      <a href="/app/admin/etablissements/{etablissement.id}" class={stylex.attrs(ui.button).class}>
        Annuler
      </a>
      <button
        type="submit"
        disabled={saving}
        class={stylex.attrs(ui.button, ui.buttonSecondary).class}
      >
        {#if saving}
          <LoaderCircle class={stylex.attrs(styles.LoaderCircle).class} />
          Enregistrement...
        {:else}
          <Save class={stylex.attrs(styles.Save).class} />
          Enregistrer les modifications
        {/if}
      </button>
    </div>
  </form>
</div>
