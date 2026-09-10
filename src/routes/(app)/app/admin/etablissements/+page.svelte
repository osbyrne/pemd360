<script lang="ts">
  import { theme } from "../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import type { PageData, ActionData } from "./$types";
  import { enhance } from "$app/forms";
  import {
    Plus,
    Download,
    Search,
    Building2,
    Eye,
    Pencil,
    Trash2,
    LoaderCircle,
  } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  // State
  let etablissements = $derived(data.etablissements);
  let loading = $state(false);
  let deleteLoading = $state(false);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Modals State
  let isDeleteModalOpen = $state(false);

  // Toast
  let toast: { message: string; type: "success" | "error" } | null = $state(null);

  // Active item
  let selectedEtab: (typeof etablissements)[0] | null = $state(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    toast = { message, type };
    setTimeout(() => (toast = null), 3000);
  }

  // Réagir aux changements du form (résultats des actions)
  $effect(() => {
    if (form?.message) {
      showToast(form.message, form.success ? "success" : "error");
    }
  });

  // Derived
  const filteredEtabs = $derived(
    etablissements.filter((e) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        e.nom?.toLowerCase().includes(q) ||
        e.ville?.toLowerCase().includes(q) ||
        e.siret?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredEtabs.length / perPage));
  const displayedEtabs = $derived(filteredEtabs.slice((page - 1) * perPage, page * perPage));

  // Actions
  function openDeleteModal(etab: (typeof etablissements)[0]) {
    selectedEtab = etab;
    isDeleteModalOpen = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    selectedEtab = null;
    deleteLoading = false;
  }

  // CSV Export
  function downloadCSV() {
    if (!etablissements.length) return;
    const cols = ["id", "nom", "siret", "email", "rue", "cp", "ville"];
    const lines = [cols.join(",")];

    for (const e of filteredEtabs) {
      const row = [
        e.id,
        `"${(e.nom || "").replace(/"/g, '""')}"`,
        `"${(e.siret || "").replace(/"/g, '""')}"`,
        `"${(e.email || "").replace(/"/g, '""')}"`,
        `"${(e.rue || "").replace(/"/g, '""')}"`,
        e.cp || "",
        `"${(e.ville || "").replace(/"/g, '""')}"`,
      ];
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etablissements_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });
  const pulse = stylex.keyframes({ "50%": { opacity: 0.5 } });

  const styles = stylex.create({
    main: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "80rem",
    },
    div: {
      marginBottom: "2rem",
    },
    div2: {
      display: {
        "@media (min-width: 640px)": "flex",
      },
      alignItems: {
        "@media (min-width: 640px)": "center",
      },
      justifyContent: {
        "@media (min-width: 640px)": "space-between",
      },
    },
    h1: {
      fontSize: {
        default: "1.5rem",
        "@media (min-width: 640px)": "1.875rem",
      },
      lineHeight: {
        default: "2rem",
        "@media (min-width: 640px)": "2.25rem",
      },
      fontWeight: 700,
      letterSpacing: "-.025em",
    },
    p: {
      marginTop: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div3: {
      marginTop: {
        default: "1rem",
        "@media (min-width: 640px)": "0rem",
      },
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div4: {
      borderRadius: ".5rem",
      backgroundColor: theme.base100,
      boxShadow: "0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a",
    },
    div5: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.8% 0.007 247.896)",
    },
    div6: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div7: {
      height: "3rem",
      width: "3rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: "9999px",
    },
    div8: {
      flex: "1 1 0%",
      "--stack-gap": "0.5rem",
    },
    div9: {
      height: "1rem",
      width: "8rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: ".25rem",
    },
    div10: {
      height: "0.75rem",
      width: "12rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: ".25rem",
    },
    div11: {
      height: "1.5rem",
      width: "4rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: "9999px",
    },
    div12: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
    Building2: {
      marginBottom: "1rem",
    },
    p2: {
      fontWeight: 500,
    },
    p3: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    li: {
      display: "flex",
    },
    div13: {
      minWidth: "0rem",
      flex: "1 1 0%",
    },
    div14: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    p4: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 600,
    },
    p5: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div15: {
      display: {
        default: "none",
        "@media (min-width: 640px)": "flex",
      },
      width: "8rem",
      flexDirection: {
        "@media (min-width: 640px)": "column",
      },
      alignItems: {
        "@media (min-width: 640px)": "flex-start",
      },
    },
    p6: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    p7: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div16: {
      marginRight: "1rem",
      display: {
        default: "none",
        "@media (min-width: 768px)": "flex",
      },
      width: "9rem",
      flexDirection: {
        "@media (min-width: 768px)": "column",
      },
      alignItems: {
        "@media (min-width: 768px)": "flex-end",
      },
    },
    p8: {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div17: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(92.9% 0.013 255.508)",
      paddingLeft: "0.5rem",
    },
    div18: {
      position: "relative",
      zIndex: 50,
    },
    div19: {
      position: "fixed",
      inset: 0,
      backdropFilter: "blur(8px)",
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div20: {
      position: "fixed",
      inset: 0,
      zIndex: 10,
      width: "100vw",
      overflowY: "auto",
    },
    div21: {
      display: "flex",
      minHeight: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div22: {
      position: "relative",
      width: "100%",
      maxWidth: "28rem",
      transform: "none",
      overflow: "hidden",
      borderRadius: "1rem",
      boxShadow: "0 25px 50px -12px #0004",
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div23: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1.25rem",
      paddingBottom: "1.25rem",
    },
    div24: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div25: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.6% 0.032 17.717)",
    },
    Trash2: {
      color: "oklch(57.7% 0.245 27.325)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p9: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div26: {
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
    p10: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: "oklch(44.4% 0.177 26.899)",
    },
    div27: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(96.8% 0.007 247.896)",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    LoaderCircle: {
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
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Établissements</title>
</svelte:head>

<main class={stylex.attrs(styles.main).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div).class}>
    <div class={stylex.attrs(styles.div2).class}>
      <div>
        <h1 class={stylex.attrs(styles.h1).class}>Gestion des établissements</h1>
        <p class={stylex.attrs(styles.p).class}>Gérez les établissements de votre organisation.</p>
      </div>
      <div class={stylex.attrs(styles.div3).class}>
        <a href="/app/admin/etablissements/nouveau" class={stylex.attrs(ui.button).class}>
          <Plus size={18} />
          Nouvel établissement
        </a>
        <button onclick={downloadCSV} class={stylex.attrs(ui.button).class}>
          <Download size={16} />
          Exporter CSV
        </button>
      </div>
    </div>
  </div>

  <!-- Search Bar -->
  <label class={stylex.attrs(ui.input, styles.label).class}>
    <Search />
    <input type="search" bind:value={query} placeholder="Rechercher par nom, ville ou SIRET..." />
  </label>
  <br />
  <br />

  <!-- List -->
  <div class={stylex.attrs(ui.list, styles.div4).class}>
    {#if loading}
      <div class={stylex.attrs(styles.div5).class}>
        {#each Array(5) as _}
          <div class={stylex.attrs(ui.divideChild, styles.div6).class}>
            <div class={stylex.attrs(styles.div7).class}></div>
            <div class={stylex.attrs(styles.div8).class}>
              <div class={stylex.attrs(styles.stackSpacing05, styles.div9).class}></div>
              <div class={stylex.attrs(styles.stackSpacing05, styles.div10).class}></div>
            </div>
            <div class={stylex.attrs(styles.div11).class}></div>
          </div>
        {/each}
      </div>
    {:else if displayedEtabs.length === 0}
      <div class={stylex.attrs(styles.div12).class}>
        <Building2 size={48} strokeWidth={1.5} class={stylex.attrs(styles.Building2).class} />
        <p class={stylex.attrs(styles.p2).class}>Aucun établissement trouvé</p>
        <p class={stylex.attrs(styles.p3).class}>Essayez de modifier vos critères de recherche</p>
      </div>
    {:else}
      {#each displayedEtabs as etab (etab.id)}
        <li class={stylex.attrs(ui.listRow, styles.li).class}>
          <!-- Info -->
          <div class={stylex.attrs(styles.div13).class}>
            <div class={stylex.attrs(styles.div14).class}>
              <p class={stylex.attrs(styles.p4).class}>{etab.nom}</p>
            </div>
            <p class={stylex.attrs(styles.p5).class}>{etab.email || "Pas d'email"}</p>
          </div>

          <!-- Location -->
          <div class={stylex.attrs(styles.div15).class}>
            <p class={stylex.attrs(styles.p6).class}>{etab.ville || "-"}</p>
            <p class={stylex.attrs(styles.p7).class}>{etab.cp || "-"}</p>
          </div>

          <!-- SIRET -->
          <div class={stylex.attrs(styles.div16).class}>
            <p class={stylex.attrs(styles.p7).class}>SIRET</p>
            <p class={stylex.attrs(styles.p8).class}>{etab.siret || "-"}</p>
          </div>

          <!-- Actions -->
          <div class={stylex.attrs(styles.div17).class}>
            <a
              href="/app/admin/etablissements/{etab.id}"
              class={stylex.attrs(ui.button, ui.buttonGhost).class}
              title="Voir les détails"
            >
              <Eye size={18} />
            </a>

            <a
              href="/app/admin/etablissements/{etab.id}/modifier"
              class={stylex.attrs(ui.button, ui.buttonGhost).class}
              title="Modifier"
            >
              <Pencil size={18} />
            </a>

            <button
              onclick={() => openDeleteModal(etab)}
              class={stylex.attrs(ui.button, ui.buttonGhost).class}
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </li>
      {/each}
    {/if}

    <!-- Pagination -->
    {#if !loading}
      <Pagination
        {page}
        {totalPages}
        totalItems={filteredEtabs.length}
        {perPage}
        onPageChange={(p) => (page = p)}
      />
    {/if}
  </div>
</main>

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedEtab}
  <div class={stylex.attrs(styles.div18).class} role="dialog" aria-modal="true">
    <div class={stylex.attrs(styles.div19).class}></div>
    <div class={stylex.attrs(styles.div20).class}>
      <div class={stylex.attrs(styles.div21).class}>
        <div class={stylex.attrs(styles.div22).class}>
          <div class={stylex.attrs(styles.div23).class}>
            <div class={stylex.attrs(styles.div24).class}>
              <div class={stylex.attrs(styles.div25).class}>
                <Trash2 size={20} class={stylex.attrs(styles.Trash2).class} />
              </div>
              <div>
                <h3 class={stylex.attrs(styles.h3).class}>Supprimer l'établissement</h3>
                <p class={stylex.attrs(styles.p9).class}>{selectedEtab.nom}</p>
              </div>
            </div>
            <div class={stylex.attrs(styles.div26).class}>
              <p class={stylex.attrs(styles.p10).class}>
                <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
                à cet établissement seront définitivement supprimées.
              </p>
            </div>
          </div>
          <div class={stylex.attrs(styles.div27).class}>
            <button
              type="button"
              class={stylex.attrs(ui.button).class}
              onclick={closeDeleteModal}
              disabled={deleteLoading}
            >
              Annuler
            </button>
            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                deleteLoading = true;
                return async ({ result, update }) => {
                  if (result.type === "success") {
                    closeDeleteModal();
                    showToast("Établissement supprimé avec succès", "success");
                  } else if (result.type === "failure") {
                    const errorMessage =
                      (result.data as { message?: string })?.message ||
                      "Erreur lors de la suppression";
                    showToast(errorMessage, "error");
                    deleteLoading = false;
                  }
                  await update();
                };
              }}
            >
              <input type="hidden" name="id" value={selectedEtab.id} />
              <button
                type="submit"
                class={stylex.attrs(ui.button, ui.buttonWarning).class}
                disabled={deleteLoading}
              >
                {#if deleteLoading}
                  <span class={stylex.attrs(styles.div14).class}>
                    <LoaderCircle class={stylex.attrs(styles.LoaderCircle).class} />
                    Suppression...
                  </span>
                {:else}
                  Supprimer définitivement
                {/if}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if toast}
  <div class={stylex.attrs(ui.toast).class}>
    <div class={stylex.attrs(ui.alert, ui.alertInfo).class}>
      <span class={stylex.attrs(styles.p6).class}>{toast.message}</span>
    </div>
  </div>
{/if}
