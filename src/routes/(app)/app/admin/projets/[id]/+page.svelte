<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { ArrowLeft, Edit, Trash2, Building2, MapPin, Calendar, FileText } from "lucide-svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: ({ projet } = data);

  function formatDate(date: Date | number | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

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
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    p: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p2: {
      marginTop: "0.5rem",
      display: "inline-block",
      borderRadius: ".25rem",
      backgroundColor: "oklch(97.9% 0.021 166.113)",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: ".75rem",
      lineHeight: "1rem",
      color: "oklch(59.6% 0.145 163.225)",
    },
    div4: {
      display: "flex",
      gap: "0.75rem",
    },
    div5: {
      marginBottom: "1.5rem",
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
    div6: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div7: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(97% 0.014 254.604)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    FileText: {
      height: "1.5rem",
      width: "1.5rem",
      color: "oklch(54.6% 0.245 262.881)",
    },
    h2: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    dl: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "1.5rem",
    },
    dt: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div8: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(97.7% 0.014 308.299)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    Building2: {
      height: "1.5rem",
      width: "1.5rem",
      color: "oklch(55.8% 0.288 302.321)",
    },
    dd: {
      marginTop: "0.25rem",
    },
    span: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(97% 0.014 254.604)",
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(48.8% 0.243 264.376)",
    },
    span2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div9: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(97.9% 0.021 166.113)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    MapPin: {
      height: "1.5rem",
      width: "1.5rem",
      color: "oklch(59.6% 0.145 163.225)",
    },
    div10: {
      gridColumn: {
        "@media (min-width: 768px)": "span 2 / span 2",
      },
    },
    div11: {
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
    div12: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(98.7% 0.022 95.277)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    Calendar: {
      height: "1.5rem",
      width: "1.5rem",
      color: "oklch(66.6% 0.179 58.318)",
    },
  });
</script>

<svelte:head>
  <title>Projet · {projet.libelle}</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <!-- Fil d'ariane / Retour -->
  <div class={stylex.attrs(styles.div2).class}>
    <a href="/app/admin/projets" class={stylex.attrs(ui.button, ui.buttonGhost).class}>
      <ArrowLeft class={stylex.attrs(styles.ArrowLeft).class} />
      Retour à la liste
    </a>
  </div>

  <!-- Header -->
  <div class={stylex.attrs(styles.div3).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>{projet.libelle}</h1>
      <p class={stylex.attrs(styles.p).class}>Référence: {projet.reference}</p>
      <p class={stylex.attrs(styles.p2).class}>
        ID Matterport: {projet.id}
      </p>
    </div>
    <div class={stylex.attrs(styles.div4).class}>
      <a href="/app/admin/projets/{projet.id}/modifier" class={stylex.attrs(ui.button).class}>
        <Edit class={stylex.attrs(styles.ArrowLeft).class} />
        Modifier
      </a>
    </div>
  </div>

  <!-- Informations générales -->
  <div class={stylex.attrs(styles.div5).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div7).class}>
        <FileText class={stylex.attrs(styles.FileText).class} />
      </div>
      <h2 class={stylex.attrs(styles.h2).class}>Informations générales</h2>
    </div>

    <dl class={stylex.attrs(styles.dl).class}>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Référence</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.reference}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Libellé</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.libelle}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Type d'opération</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.typeOperation || "-"}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Maître d'ouvrage</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.maitreDOuvrage || "-"}</dd>
      </div>
    </dl>
  </div>

  <!-- Établissement & Société -->
  <div class={stylex.attrs(styles.div5).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div8).class}>
        <Building2 class={stylex.attrs(styles.Building2).class} />
      </div>
      <h2 class={stylex.attrs(styles.h2).class}>Établissement & Société</h2>
    </div>

    <dl class={stylex.attrs(styles.dl).class}>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Établissement</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.etablissementNom || "-"}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Ville de l'établissement</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.etablissementVille || "-"}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Société</dt>
        <dd class={stylex.attrs(styles.dd).class}>
          {#if projet.societeNom}
            <span class={stylex.attrs(styles.span).class}>
              {projet.societeNom}
            </span>
          {:else}
            <span class={stylex.attrs(styles.span2).class}>-</span>
          {/if}
        </dd>
      </div>
    </dl>
  </div>

  <!-- Localisation -->
  <div class={stylex.attrs(styles.div5).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div9).class}>
        <MapPin class={stylex.attrs(styles.MapPin).class} />
      </div>
      <h2 class={stylex.attrs(styles.h2).class}>Localisation</h2>
    </div>

    <dl class={stylex.attrs(styles.dl).class}>
      <div class={stylex.attrs(styles.div10).class}>
        <dt class={stylex.attrs(styles.dt).class}>Adresse</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.rue}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Code Postal</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.cp}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Ville</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.ville}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Code INSEE</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.codeInsee || "-"}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Section cadastrale</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.section}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Parcelle</dt>
        <dd class={stylex.attrs(styles.p).class}>{projet.parcelle}</dd>
      </div>
    </dl>
  </div>

  <!-- Dates -->
  <div class={stylex.attrs(styles.div11).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <div class={stylex.attrs(styles.div12).class}>
        <Calendar class={stylex.attrs(styles.Calendar).class} />
      </div>
      <h2 class={stylex.attrs(styles.h2).class}>Planning</h2>
    </div>

    <dl class={stylex.attrs(styles.dl).class}>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Date de démarrage</dt>
        <dd class={stylex.attrs(styles.p).class}>{formatDate(projet.dateDemarrage)}</dd>
      </div>
      <div>
        <dt class={stylex.attrs(styles.dt).class}>Date de fin</dt>
        <dd class={stylex.attrs(styles.p).class}>{formatDate(projet.dateDeFin)}</dd>
      </div>
    </dl>
  </div>
</div>
