<script lang="ts">
  import { theme } from "../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import CerfaTabs from "$lib/components/CerfaTabs.svelte";
  import { Building2, UserCircle, MapPin, CalendarDays, Edit2 } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const projetId = $derived($page.url.searchParams.get("projetId") || "");

  const projectData = $derived(
    data.list.find((item) => item.projetId === projetId) || data.list[0],
  );

  const styles = stylex.create({
    div: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "80rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    div2: {
      marginBottom: "2rem",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    h1: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    div3: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      borderRadius: ".75rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
      boxShadow: "0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a",
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 700,
    },
    div4: {
      display: "grid",
      gap: "1.5rem",
      gridTemplateColumns: {
        "@media (min-width: 1024px)": "repeat(2, minmax(0, 1fr))",
      },
    },
    div5: {
      "--stack-gap": "1.5rem",
    },
    div6: {
      backgroundColor: theme.base100,
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div7: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    div8: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    Building2: {
      height: "1.25rem",
      width: "1.25rem",
    },
    Edit2: {
      height: "1rem",
      width: "1rem",
    },
    div9: {
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    div10: {
      "--stack-gap": "0.75rem",
    },
    div11: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
    },
    UserCircle: {
      marginTop: "0.125rem",
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
      color: "oklch(54.6% 0.245 262.881)",
    },
    div12: {
      flex: "1 1 0%",
    },
    p2: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(54.6% 0.245 262.881)",
      textTransform: "uppercase",
    },
    p3: {
      fontWeight: 600,
    },
    p4: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div13: {
      paddingTop: "2rem",
      paddingBottom: "2rem",
      textAlign: "center",
    },
    UserCircle2: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      marginBottom: "0.75rem",
      height: "3rem",
      width: "3rem",
    },
    p5: {
      fontStyle: "italic",
    },
    p6: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div14: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(62.7% 0.265 303.9)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    UserCircle3: {
      height: "1.25rem",
      width: "1.25rem",
      color: "#fff",
    },
    UserCircle4: {
      marginTop: "0.125rem",
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
      color: "oklch(55.8% 0.288 302.321)",
    },
    p7: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(55.8% 0.288 302.321)",
      textTransform: "uppercase",
    },
    div15: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(70.4% 0.14 182.503)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    CalendarDays: {
      marginTop: "0.125rem",
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
      color: "oklch(60% 0.118 184.704)",
    },
    p8: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(60% 0.118 184.704)",
      textTransform: "uppercase",
    },
    div16: {
      marginTop: "1rem",
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "0.75rem",
    },
    div17: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(98.4% 0.014 180.72)",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    p9: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(51.1% 0.096 186.391)",
    },
    p10: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
      color: "oklch(38.6% 0.063 188.416)",
    },
    div18: {
      borderRadius: ".5rem",
      backgroundColor: "oklch(76.9% 0.188 70.08)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    div19: {
      "--stack-gap": "1rem",
    },
    MapPin: {
      marginTop: "0.125rem",
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
      color: "oklch(66.6% 0.179 58.318)",
    },
    p11: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      letterSpacing: ".025em",
      color: "oklch(66.6% 0.179 58.318)",
      textTransform: "uppercase",
    },
    div20: {
      marginTop: "1rem",
      borderRadius: ".5rem",
      backgroundColor: "oklch(98.7% 0.022 95.277)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    p12: {
      marginBottom: "0.5rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(55.5% 0.163 48.998)",
    },
    div21: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span: {
      fontWeight: 500,
    },
    div22: {
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "3rem",
      paddingRight: "3rem",
      paddingBottom: "3rem",
      paddingLeft: "3rem",
      textAlign: "center",
    },
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
    stackSpacing075: { marginBlockEnd: { default: "0.75rem", ":last-child": 0 } },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>CERFA · Informations</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <CerfaTabs />
  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Partie Informations</h1>
      <p>Informations administratives du projet : Maîtrise d'ouvrage, Opération, Diagnostiqueur</p>
    </div>
  </div>

  {#if projectData}
    <div class={stylex.attrs(styles.div3).class}>
      <div>
        <p class={stylex.attrs(styles.p).class}>Projet actuel</p>
        <h2 class={stylex.attrs(styles.h2).class}>{projectData.projetNom || "Projet sans nom"}</h2>
      </div>
    </div>

    <div class={stylex.attrs(styles.div4).class}>
      <!-- Left Column -->
      <div class={stylex.attrs(styles.div5).class}>
        <!-- Section: Maître d'Ouvrage -->
        <div class={stylex.attrs(styles.stackSpacing15, ui.card, styles.div6).class}>
          <div class={stylex.attrs(styles.div7).class}>
            <div class={stylex.attrs(styles.div8).class}>
              <Building2 class={stylex.attrs(styles.Building2).class} />
              <h2>Maître d'Ouvrage</h2>
            </div>
            <a
              href="/app/cerfa/informations/{projectData.projetId}/maitre"
              class={stylex.attrs(ui.button).class}
            >
              <Edit2 class={stylex.attrs(styles.Edit2).class} />
              <span class={stylex.attrs(styles.p).class}>Modifier</span>
            </a>
          </div>
          <div class={stylex.attrs(styles.div9).class}>
            {#if projectData.moaNom || projectData.moaNomPhy}
              <div class={stylex.attrs(styles.div10).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                  <UserCircle class={stylex.attrs(styles.UserCircle).class} />
                  <div class={stylex.attrs(styles.div12).class}>
                    <p class={stylex.attrs(styles.p2).class}>Identité</p>
                    <p class={stylex.attrs(styles.p3).class}>
                      {projectData.moaNom ||
                        `${projectData.moaPrenomPhy || ""} ${projectData.moaNomPhy || ""}`}
                    </p>
                  </div>
                </div>
                {#if projectData.moaAdresse}
                  <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                    <MapPin class={stylex.attrs(styles.UserCircle).class} />
                    <div class={stylex.attrs(styles.div12).class}>
                      <p class={stylex.attrs(styles.p2).class}>Adresse</p>
                      <p>{projectData.moaAdresse}</p>
                      <p class={stylex.attrs(styles.p4).class}>
                        {projectData.moaCp || ""}
                        {projectData.moaCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class={stylex.attrs(styles.div13).class}>
                <UserCircle class={stylex.attrs(styles.UserCircle2).class} />
                <p class={stylex.attrs(styles.p5).class}>Non renseigné</p>
                <p class={stylex.attrs(styles.p6).class}>
                  Cliquez sur "Modifier" pour ajouter les informations
                </p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section: Diagnostiqueur -->
        <div class={stylex.attrs(styles.stackSpacing15, ui.card, styles.div6).class}>
          <div class={stylex.attrs(styles.div7).class}>
            <div class={stylex.attrs(styles.div8).class}>
              <div class={stylex.attrs(styles.div14).class}>
                <UserCircle class={stylex.attrs(styles.UserCircle3).class} />
              </div>
              <h2>Diagnostiqueur</h2>
            </div>
            <a
              href="/app/cerfa/informations/{projectData.projetId}/diagnostiqueur"
              class={stylex.attrs(ui.button).class}
            >
              <Edit2 class={stylex.attrs(styles.Edit2).class} />
              <span class={stylex.attrs(styles.p).class}>Modifier</span>
            </a>
          </div>
          <div class={stylex.attrs(styles.div9).class}>
            {#if projectData.diagnostiqueurNom || projectData.diagnostiqueurNomPhy}
              <div class={stylex.attrs(styles.div10).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                  <UserCircle class={stylex.attrs(styles.UserCircle4).class} />
                  <div class={stylex.attrs(styles.div12).class}>
                    <p class={stylex.attrs(styles.p7).class}>Identité</p>
                    <p class={stylex.attrs(styles.p3).class}>
                      {projectData.diagnostiqueurNom ||
                        `${projectData.diagnostiqueurPrenomPhy || ""} ${projectData.diagnostiqueurNomPhy || ""}`}
                    </p>
                  </div>
                </div>
                {#if projectData.diagnostiqueurAdresse}
                  <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                    <MapPin class={stylex.attrs(styles.UserCircle4).class} />
                    <div class={stylex.attrs(styles.div12).class}>
                      <p class={stylex.attrs(styles.p7).class}>Adresse</p>
                      <p>{projectData.diagnostiqueurAdresse}</p>
                      <p class={stylex.attrs(styles.p4).class}>
                        {projectData.diagnostiqueurCp || ""}
                        {projectData.diagnostiqueurCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class={stylex.attrs(styles.div13).class}>
                <UserCircle class={stylex.attrs(styles.UserCircle2).class} />
                <p class={stylex.attrs(styles.p5).class}>Non renseigné</p>
                <p class={stylex.attrs(styles.p6).class}>
                  Cliquez sur "Modifier" pour ajouter les informations
                </p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class={stylex.attrs(styles.div5).class}>
        <!-- Section: Le diagnostic -->
        <div class={stylex.attrs(styles.stackSpacing15, ui.card, styles.div6).class}>
          <div class={stylex.attrs(styles.div7).class}>
            <div class={stylex.attrs(styles.div8).class}>
              <div class={stylex.attrs(styles.div15).class}>
                <CalendarDays class={stylex.attrs(styles.UserCircle3).class} />
              </div>
              <h2>Le diagnostic</h2>
            </div>
            <a
              href="/app/cerfa/informations/{projectData.projetId}/diagnostic"
              class={stylex.attrs(ui.button).class}
            >
              <Edit2 class={stylex.attrs(styles.Edit2).class} />
              <span class={stylex.attrs(styles.p).class}>Modifier</span>
            </a>
          </div>
          <div class={stylex.attrs(styles.div9).class}>
            {#if projectData.diagnosticDerniereVisite}
              <div class={stylex.attrs(styles.div10).class}>
                <div class={stylex.attrs(styles.stackSpacing075, styles.div11).class}>
                  <CalendarDays class={stylex.attrs(styles.CalendarDays).class} />
                  <div class={stylex.attrs(styles.div12).class}>
                    <p class={stylex.attrs(styles.p8).class}>Dernière visite</p>
                    <p class={stylex.attrs(styles.p3).class}>
                      {new Date(projectData.diagnosticDerniereVisite).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {#if projectData.diagnosticDesordres !== null}
                  <div class={stylex.attrs(styles.stackSpacing075, styles.div16).class}>
                    <div class={stylex.attrs(styles.div17).class}>
                      <p class={stylex.attrs(styles.p9).class}>Désordres constatés</p>
                      <p class={stylex.attrs(styles.p10).class}>
                        {projectData.diagnosticDesordres ? "Oui" : "Non"}
                      </p>
                    </div>
                    <div class={stylex.attrs(styles.div17).class}>
                      <p class={stylex.attrs(styles.p9).class}>Précautions</p>
                      <p class={stylex.attrs(styles.p10).class}>
                        {projectData.diagnosticPrecaution ? "Oui" : "Non"}
                      </p>
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class={stylex.attrs(styles.div13).class}>
                <CalendarDays class={stylex.attrs(styles.UserCircle2).class} />
                <p class={stylex.attrs(styles.p5).class}>Non renseigné</p>
                <p class={stylex.attrs(styles.p6).class}>
                  Cliquez sur "Modifier" pour ajouter les informations
                </p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Section: L'opération -->
        <div class={stylex.attrs(styles.stackSpacing15, ui.card, styles.div6).class}>
          <div class={stylex.attrs(styles.div7).class}>
            <div class={stylex.attrs(styles.div8).class}>
              <div class={stylex.attrs(styles.div18).class}>
                <MapPin class={stylex.attrs(styles.UserCircle3).class} />
              </div>
              <h2>L'opération</h2>
            </div>
            <a
              href="/app/cerfa/informations/{projectData.projetId}/operation"
              class={stylex.attrs(ui.button).class}
            >
              <Edit2 class={stylex.attrs(styles.Edit2).class} />
              <span class={stylex.attrs(styles.p).class}>Modifier</span>
            </a>
          </div>
          <div class={stylex.attrs(styles.div9).class}>
            {#if projectData.operationAdresse || projectData.datePermis}
              <div class={stylex.attrs(styles.div19).class}>
                {#if projectData.operationAdresse}
                  <div class={stylex.attrs(styles.stackSpacing1, styles.div11).class}>
                    <MapPin class={stylex.attrs(styles.MapPin).class} />
                    <div class={stylex.attrs(styles.div12).class}>
                      <p class={stylex.attrs(styles.p11).class}>Localisation</p>
                      <p class={stylex.attrs(styles.p3).class}>{projectData.operationAdresse}</p>
                      <p class={stylex.attrs(styles.p4).class}>
                        {projectData.operationCp || ""}
                        {projectData.operationCommune || ""}
                      </p>
                    </div>
                  </div>
                {/if}
                {#if projectData.operationType}
                  <div class={stylex.attrs(styles.stackSpacing1, styles.div11).class}>
                    <Building2 class={stylex.attrs(styles.MapPin).class} />
                    <div class={stylex.attrs(styles.div12).class}>
                      <p class={stylex.attrs(styles.p11).class}>Type d'opération</p>
                      <p>{projectData.operationType}</p>
                    </div>
                  </div>
                {/if}
                {#if projectData.datePermis}
                  <div class={stylex.attrs(styles.stackSpacing1, styles.div11).class}>
                    <CalendarDays class={stylex.attrs(styles.MapPin).class} />
                    <div class={stylex.attrs(styles.div12).class}>
                      <p class={stylex.attrs(styles.p11).class}>Permis de construire</p>
                      <p class={stylex.attrs(styles.p3).class}>
                        {new Date(projectData.datePermis).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                {/if}
                {#if projectData.operationDateDebut || projectData.operationDateFin}
                  <div class={stylex.attrs(styles.stackSpacing1, styles.div20).class}>
                    <p class={stylex.attrs(styles.p12).class}>Période d'opération</p>
                    <div class={stylex.attrs(styles.div21).class}>
                      {#if projectData.operationDateDebut}
                        <span class={stylex.attrs(styles.span).class}
                          >Du {new Date(projectData.operationDateDebut).toLocaleDateString(
                            "fr-FR",
                          )}</span
                        >
                      {/if}
                      {#if projectData.operationDateFin}
                        <span
                          >au {new Date(projectData.operationDateFin).toLocaleDateString(
                            "fr-FR",
                          )}</span
                        >
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {:else}
              <div class={stylex.attrs(styles.div13).class}>
                <MapPin class={stylex.attrs(styles.UserCircle2).class} />
                <p class={stylex.attrs(styles.p5).class}>Non renseigné</p>
                <p class={stylex.attrs(styles.p6).class}>
                  Cliquez sur "Modifier" pour ajouter les informations
                </p>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class={stylex.attrs(styles.div22).class}>
      <p>Aucune donnée disponible pour ce projet.</p>
    </div>
  {/if}
</div>
