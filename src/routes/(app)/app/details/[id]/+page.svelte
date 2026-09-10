<script lang="ts">
  import { theme } from "../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { MapPin, Building2, Hash, Target, Download } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });

  function formatDate(date: Date | number): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  const styles = stylex.create({
    div: {
      minHeight: "100vh",
    },
    div2: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "72rem",
      paddingInlineStart: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
        "@media (min-width: 1024px)": "2rem",
      },
      paddingInlineEnd: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
        "@media (min-width: 1024px)": "2rem",
      },
      paddingTop: "1.5rem",
      paddingBottom: "1.5rem",
    },
    div3: {
      marginBottom: "1.5rem",
      borderRadius: ".75rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    h1: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    Download: {
      height: "1rem",
      width: "1rem",
    },
    div4: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "0.75rem",
    },
    span: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      borderRadius: ".5rem",
      paddingInlineStart: "0.75rem",
      paddingInlineEnd: "0.75rem",
      paddingTop: "0.375rem",
      paddingBottom: "0.375rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      backdropFilter: "blur(8px)",
    },
    Hash: {
      height: "0.875rem",
      width: "0.875rem",
    },
    span2: {
      fontWeight: 500,
    },
    div5: {
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "1.25rem",
      flexDirection: {
        "@media (min-width: 640px)": "row",
      },
    },
    div6: {
      "--stack-gap": "1.25rem",
    },
    div7: {
      width: "24rem",
      backgroundColor: theme.base100,
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div8: {
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
    },
    h2: {
      fontSize: "1rem",
      lineHeight: "1.5rem",
      fontWeight: 600,
    },
    div9: {
      "--stack-gap": "0.75rem",
    },
    div10: {
      borderRadius: ".5rem",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    p: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      letterSpacing: ".025em",
      textTransform: "uppercase",
    },
    p2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div11: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "0.75rem",
    },
    div12: {
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(94.3% 0.029 294.588)",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    p3: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(54.1% 0.281 293.009)",
      textTransform: "uppercase",
    },
    p4: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
    },
    div13: {
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    p5: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(54.6% 0.245 262.881)",
      textTransform: "uppercase",
    },
    p6: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(55.8% 0.288 302.321)",
      textTransform: "uppercase",
    },
    div14: {
      borderRadius: ".75rem",
      paddingTop: "1.25rem",
      paddingRight: "1.25rem",
      paddingBottom: "1.25rem",
      paddingLeft: "1.25rem",
      color: "#fff",
    },
    div15: {
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
    },
    div16: {
      borderRadius: ".5rem",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
      backdropFilter: "blur(8px)",
    },
    p7: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 700,
    },
    stackSpacing125: { marginBlockEnd: { default: "1.25rem", ":last-child": 0 } },
    stackSpacing075: { marginBlockEnd: { default: "0.75rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>{data.projet.libelle} · Projet</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  {#if mounted}
    <div class={stylex.attrs(styles.div2).class}>
      <!-- Header compact -->
      <div class={stylex.attrs(styles.div3).class}>
        <h1 class={stylex.attrs(styles.h1).class}>{data.projet.libelle}</h1>

        <a
          href="/api/projects/{data.projet.id}/cerfa"
          download
          class={stylex.attrs(ui.button).class}
        >
          <Download class={stylex.attrs(styles.Download).class} />
          <span>Télécharger Cerfa</span>
        </a>

        <div class={stylex.attrs(styles.div4).class}>
          <span class={stylex.attrs(styles.span).class}>
            <Hash class={stylex.attrs(styles.Hash).class} />
            <span class={stylex.attrs(styles.span2).class}>{data.projet.reference}</span>
          </span>

          {#if data.projet.societeNom}
            <span class={stylex.attrs(styles.span).class}>
              <Building2 class={stylex.attrs(styles.Hash).class} />
              <span class={stylex.attrs(styles.span2).class}>{data.projet.societeNom}</span>
            </span>
          {/if}

          <span class={stylex.attrs(styles.span).class}>
            <MapPin class={stylex.attrs(styles.Hash).class} />
            <span class={stylex.attrs(styles.span2).class}>{data.projet.ville}</span>
          </span>
        </div>
      </div>

      <!-- Grid 2 colonnes plus compact -->
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <!-- Localisation -->
          <div class={stylex.attrs(styles.stackSpacing125, ui.card, styles.div7).class}>
            <div class={stylex.attrs(ui.cardBody).class}>
              <div class={stylex.attrs(styles.div8).class}>
                <h2 class={stylex.attrs(styles.h2).class}>Localisation</h2>
              </div>

              <div class={stylex.attrs(styles.div9).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div10).class}>
                  <p class={stylex.attrs(styles.p).class}>Adresse</p>
                  <p class={stylex.attrs(styles.p2).class}>{data.projet.rue}</p>
                </div>

                <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                  <div class={stylex.attrs(styles.div10).class}>
                    <p class={stylex.attrs(styles.p).class}>CP</p>
                    <p class={stylex.attrs(styles.p2).class}>{data.projet.cp}</p>
                  </div>
                  <div class={stylex.attrs(styles.div10).class}>
                    <p class={stylex.attrs(styles.p).class}>Ville</p>
                    <p class={stylex.attrs(styles.p2).class}>{data.projet.ville}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cadastre -->
          <div class={stylex.attrs(styles.stackSpacing125, ui.card, styles.div7).class}>
            <div class={stylex.attrs(ui.cardBody).class}>
              <div class={stylex.attrs(styles.div8).class}>
                <h2 class={stylex.attrs(styles.h2).class}>Cadastre</h2>
              </div>

              <div class={stylex.attrs(styles.div9).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div12).class}>
                  <p class={stylex.attrs(styles.p3).class}>Code INSEE</p>
                  <p class={stylex.attrs(styles.p4).class}>{data.projet.codeInsee}</p>
                </div>

                <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                  <div class={stylex.attrs(styles.div10).class}>
                    <p class={stylex.attrs(styles.p).class}>Section</p>
                    <p class={stylex.attrs(styles.p2).class}>{data.projet.section}</p>
                  </div>
                  <div class={stylex.attrs(styles.div10).class}>
                    <p class={stylex.attrs(styles.p).class}>Parcelle</p>
                    <p class={stylex.attrs(styles.p2).class}>{data.projet.parcelle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class={stylex.attrs(styles.div6).class}>
          <!-- Planning -->
          <div class={stylex.attrs(styles.stackSpacing125, ui.card, styles.div7).class}>
            <div class={stylex.attrs(ui.cardBody).class}>
              <div class={stylex.attrs(styles.div8).class}>
                <h2 class={stylex.attrs(styles.h2).class}>Planning</h2>
              </div>

              <div class={stylex.attrs(styles.div9).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div13).class}>
                  <p class={stylex.attrs(styles.p5).class}>Démarrage</p>
                  <p class={stylex.attrs(styles.p4).class}>
                    {formatDate(data.projet.dateDemarrage)}
                  </p>
                </div>

                {#if data.projet.dateDeFin}
                  <div class={stylex.attrs(styles.stackSpacing075, styles.div13).class}>
                    <p class={stylex.attrs(styles.p6).class}>Fin prévue</p>
                    <p class={stylex.attrs(styles.p4).class}>
                      {formatDate(data.projet.dateDeFin)}
                    </p>
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Intervenants -->
          <div class={stylex.attrs(styles.stackSpacing125, ui.card, styles.div7).class}>
            <div class={stylex.attrs(ui.cardBody).class}>
              <div class={stylex.attrs(styles.div8).class}>
                <h2 class={stylex.attrs(styles.h2).class}>Intervenants</h2>
              </div>

              <div class={stylex.attrs(styles.div9).class}>
                {#if data.projet.etablissementNom}
                  <div class={stylex.attrs(styles.stackSpacing075, styles.div10).class}>
                    <p>Établissement</p>
                    <p>
                      {data.projet.etablissementNom}
                    </p>
                  </div>
                {/if}

                <div class={stylex.attrs(styles.stackSpacing075, styles.div10).class}>
                  <p>Maître d'ouvrage</p>
                  <p>{data.projet.maitreDOuvrage}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Type opération -->
          {#if data.projet.typeOperation}
            <div class={stylex.attrs(styles.stackSpacing125, styles.div14).class}>
              <div class={stylex.attrs(styles.div15).class}>
                <div class={stylex.attrs(styles.div16).class}>
                  <Target class={stylex.attrs(styles.Download).class} />
                </div>
                <h2 class={stylex.attrs(styles.h2).class}>Type d'opération</h2>
              </div>
              <p class={stylex.attrs(styles.p7).class}>{data.projet.typeOperation}</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
