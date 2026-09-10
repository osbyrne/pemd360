<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { ArrowLeft, Building2, MapPin, Phone, Mail, Hash, Pencil, Globe } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
  $: ({ etablissement, societe } = data);

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
    div3: {
      marginBottom: "2rem",
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      gap: "1rem",
      alignItems: {
        "@media (min-width: 640px)": "center",
      },
      justifyContent: {
        "@media (min-width: 640px)": "space-between",
      },
    },
    h1: {
      marginBottom: "0.5rem",
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    div4: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
    },
    Pencil: {
      marginRight: "0.5rem",
      height: "1rem",
      width: "1rem",
    },
    div5: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "2rem",
    },
    div6: {
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
    div7: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div8: {
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
    div9: {
      "--stack-gap": "1rem",
    },
    p: {
      marginBottom: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p2: {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 500,
    },
    p3: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 500,
    },
    div10: {
      display: "grid",
      gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
      gap: "1rem",
    },
    p4: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 500,
    },
    div11: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <!-- Fil d'ariane / Retour -->
  <div class={stylex.attrs(styles.div2).class}>
    <a href="/app/admin/etablissements" class={stylex.attrs(styles.a).class}>
      <ArrowLeft class={stylex.attrs(styles.ArrowLeft).class} />
      Retour à la liste des établissements
    </a>
  </div>

  <!-- Titre et Actions -->
  <div class={stylex.attrs(styles.div3).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>{etablissement.nom}</h1>
      <div class={stylex.attrs(styles.div4).class}>
        <span class={stylex.attrs(styles.span).class}>
          <Hash class={stylex.attrs(styles.ArrowLeft).class} />
          ID: #{etablissement.id}
        </span>
        <span class={stylex.attrs(styles.span).class}>
          <Building2 class={stylex.attrs(styles.ArrowLeft).class} />
          Société: {societe?.nom || "N/A"}
        </span>
      </div>
    </div>
    <a
      href="/app/admin/etablissements/{etablissement.id}/modifier"
      class={stylex.attrs(ui.button).class}
    >
      <Pencil class={stylex.attrs(styles.Pencil).class} />
      Modifier
    </a>
  </div>

  <!-- Informations détaillées -->
  <div class={stylex.attrs(styles.div5).class}>
    <!-- Section Identifiants & Contact -->
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div7).class}>
        <div class={stylex.attrs(styles.div8).class}>
          <Globe class={stylex.attrs(styles.Globe).class} />
        </div>
        <h2 class={stylex.attrs(styles.h2).class}>Identité & Contact</h2>
      </div>

      <div class={stylex.attrs(styles.div9).class}>
        <div class={stylex.attrs(styles.stackSpacing1).class}>
          <p class={stylex.attrs(styles.p).class}>Raison Sociale</p>
          <p class={stylex.attrs(styles.p2).class}>{etablissement.raisonSocial}</p>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1).class}>
          <p class={stylex.attrs(styles.p).class}>SIRET</p>
          <p class={stylex.attrs(styles.p3).class}>{etablissement.siret}</p>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div10).class}>
          <div>
            <p class={stylex.attrs(styles.p).class}>Email</p>
            <p class={stylex.attrs(styles.p4).class}>
              <Mail class={stylex.attrs(styles.ArrowLeft).class} />
              {etablissement.email}
            </p>
          </div>
          <div>
            <p class={stylex.attrs(styles.p).class}>Téléphone</p>
            <p class={stylex.attrs(styles.p4).class}>
              <Phone class={stylex.attrs(styles.ArrowLeft).class} />
              {etablissement.tel}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Localisation -->
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div7).class}>
        <div class={stylex.attrs(styles.div8).class}>
          <MapPin class={stylex.attrs(styles.Globe).class} />
        </div>
        <h2 class={stylex.attrs(styles.h2).class}>Localisation</h2>
      </div>

      <div class={stylex.attrs(styles.div9).class}>
        <div class={stylex.attrs(styles.stackSpacing1).class}>
          <p class={stylex.attrs(styles.p).class}>Adresse</p>
          <p class={stylex.attrs(styles.p2).class}>{etablissement.rue}</p>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div11).class}>
          <div>
            <p class={stylex.attrs(styles.p).class}>Code Postal</p>
            <p class={stylex.attrs(styles.p2).class}>{etablissement.cp}</p>
          </div>
          <div>
            <p class={stylex.attrs(styles.p).class}>Ville</p>
            <p class={stylex.attrs(styles.p2).class}>{etablissement.ville}</p>
          </div>
        </div>
        {#if etablissement.fax}
          <div class={stylex.attrs(styles.stackSpacing1).class}>
            <p class={stylex.attrs(styles.p).class}>Fax</p>
            <p class={stylex.attrs(styles.p2).class}>{etablissement.fax}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
