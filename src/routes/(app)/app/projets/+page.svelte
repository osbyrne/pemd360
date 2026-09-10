<script lang="ts">
  import { theme } from "../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { Info, Search, MapPin, Calendar, Building2, ChevronRight, Box } from "lucide-svelte";
  import type { PageData } from "./$types";
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  let { data }: { data: PageData } = $props();

  let mounted = $state(false);
  let searchQuery = $state("");
  let sortBy = $state<"date" | "name" | "ville">("date");
  let sortOrder = $state<"asc" | "desc">("desc");

  onMount(() => {
    mounted = true;
  });

  function formatDate(date: Date | number): string {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  let filteredProjets = $derived(
    data.projets
      .filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.libelle.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.ville.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === "date") {
          comparison = new Date(a.dateDemarrage).getTime() - new Date(b.dateDemarrage).getTime();
        } else if (sortBy === "name") {
          comparison = a.libelle.localeCompare(b.libelle);
        } else if (sortBy === "ville") {
          comparison = a.ville.localeCompare(b.ville);
        }
        return sortOrder === "asc" ? comparison : -comparison;
      }),
  );

  function toggleSort(field: "date" | "name" | "ville") {
    if (sortBy === field) {
      sortOrder = sortOrder === "asc" ? "desc" : "asc";
    } else {
      sortBy = field;
      sortOrder = "desc";
    }
  }

  const styles = stylex.create({
    div: {
      minHeight: "100vh",
    },
    div2: {
      position: "relative",
      zIndex: 10,
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      marginTop: "1.5rem",
      maxWidth: "80rem",
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
    },
    div3: {
      borderRadius: "1rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(92.9% 0.013 255.508)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div4: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      gap: "1rem",
    },
    label: {
      position: "relative",
      flex: "1 1 0%",
    },
    div5: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    div6: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "80rem",
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
      paddingTop: "2rem",
      paddingBottom: "2rem",
    },
    div7: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "5rem",
      paddingBottom: "5rem",
      textAlign: "center",
    },
    h3: {
      marginBottom: "0.5rem",
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p: {
      maxWidth: "28rem",
    },
    ul: {
      borderRadius: ".5rem",
      backgroundColor: theme.base100,
      boxShadow: "0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a",
    },
    li: {
      display: "flex",
    },
    div8: {
      minWidth: "0rem",
      flex: "1 1 0%",
    },
    h32: {
      marginBottom: "0.25rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 600,
    },
    div9: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "1rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    span2: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      fontWeight: 500,
      color: "oklch(55.1% 0.027 264.364)",
    },
    Building2: {
      height: "0.875rem",
      width: "0.875rem",
    },
    span3: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
    },
    span4: {
      display: {
        default: "none",
        "@media (min-width: 768px)": "flex",
      },
      alignItems: "center",
      gap: "0.25rem",
    },
    Info: {
      height: "1.25rem",
      width: "1.25rem",
    },
    span5: {
      display: {
        default: "none",
        "@media (min-width: 640px)": "inline",
      },
    },
    p2: {
      marginTop: "1.5rem",
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
  });
</script>

<svelte:head>
  <title>Projets</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  {#if mounted}
    <!-- Search & Filters Bar -->
    <div class={stylex.attrs(styles.div2).class}>
      <div class={stylex.attrs(styles.div3).class}>
        <div class={stylex.attrs(styles.div4).class}>
          <!-- Search -->
          <label class={stylex.attrs(ui.input, styles.label).class}>
            <Search />
            <input
              type="search"
              bind:value={searchQuery}
              placeholder="Rechercher un projet par nom, référence ou ville..."
            />
          </label>
          <br />

          <!-- View Toggle & Sort -->
          <div class={stylex.attrs(styles.div5).class}>
            <!-- Sort Buttons -->
            <button
              onclick={() => toggleSort("date")}
              class={stylex.attrs(ui.button, sortBy === "date" ? ui.textEmerald600 : false).class}
            >
              Date
            </button>
            <button
              onclick={() => toggleSort("name")}
              class={stylex.attrs(ui.button, sortBy === "name" ? ui.textEmerald600 : false).class}
            >
              Nom
            </button>
            <button
              onclick={() => toggleSort("ville")}
              class={stylex.attrs(ui.button, sortBy === "ville" ? ui.textEmerald600 : false).class}
            >
              Ville
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Projects Content -->
    <div class={stylex.attrs(styles.div6).class}>
      {#if filteredProjets.length === 0}
        <!-- Empty State -->
        <div class={stylex.attrs(styles.div7).class}>
          <h3 class={stylex.attrs(styles.h3).class}>
            {searchQuery ? "Aucun résultat" : "Aucun projet disponible"}
          </h3>
          <p class={stylex.attrs(styles.p).class}>
            {searchQuery
              ? `Aucun projet ne correspond à "${searchQuery}". Essayez une autre recherche.`
              : "Vous n'avez pas encore de projets assignés. Contactez votre administrateur."}
          </p>
        </div>
      {:else}
        <!-- List View -->
        <ul class={stylex.attrs(ui.list, styles.ul).class}>
          {#each filteredProjets as projet, i (projet.id)}
            <li
              class={stylex.attrs(ui.listRow, styles.li).class}
              in:fly={{ x: -20, duration: 300, delay: 300 + i * 30 }}
              animate:flip={{ duration: 300 }}
            >
              <!-- Info -->
              <div class={stylex.attrs(styles.div8).class}>
                <h3 class={stylex.attrs(styles.h32).class}>
                  {projet.libelle}
                </h3>
                <div class={stylex.attrs(styles.div9).class}>
                  <span class={stylex.attrs(styles.span).class}>{projet.reference}</span>
                  {#if projet.societeNom}
                    <span class={stylex.attrs(styles.span2).class}>
                      <Building2 class={stylex.attrs(styles.Building2).class} />
                      {projet.societeNom}
                    </span>
                  {/if}
                  <span class={stylex.attrs(styles.span3).class}>
                    <MapPin class={stylex.attrs(styles.Building2).class} />
                    {projet.ville}
                  </span>
                  <span class={stylex.attrs(styles.span4).class}>
                    <Calendar class={stylex.attrs(styles.Building2).class} />
                    {formatDate(projet.dateDemarrage)}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class={stylex.attrs(styles.div5).class}>
                <a
                  href="/app/details/{projet.id}"
                  class={stylex.attrs(ui.button, ui.buttonGhost).class}
                  title="Voir les détails"
                >
                  <Info class={stylex.attrs(styles.Info).class} />
                </a>
                <a
                  href="/app/projets/{projet.id}"
                  class={stylex.attrs(ui.button, ui.buttonGhost).class}
                >
                  <span class={stylex.attrs(styles.span5).class}>Modèle 3D</span>
                </a>
                <a
                  href="/app/cerfa/informations?projetId={projet.id}"
                  class={stylex.attrs(ui.button, ui.buttonGhost).class}>Cerfa</a
                >
              </div>
            </li>
          {/each}
        </ul>
      {/if}

      <!-- Results count -->
      {#if filteredProjets.length > 0 && searchQuery}
        <p class={stylex.attrs(styles.p2).class}>
          {filteredProjets.length} résultat{filteredProjets.length > 1 ? "s" : ""} pour "{searchQuery}"
        </p>
      {/if}
    </div>
  {/if}
</div>
