<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Plus, Download, Search, ChartNoAxesCombined, Eye, Pencil, Trash2 } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";

  let { data }: { data: PageData } = $props();

  // State
  let projets = $derived(data.projets);
  let loading = $state(false);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Modals State
  let isDeleteModalOpen = $state(false);

  // Toast
  let toast: { message: string; type: "success" | "error" } | null = $state(null);

  // Active item
  let selectedProjet: (typeof projets)[0] | null = $state(null);

  // Dropdown menu state
  let openDropdownId: string | null = $state(null);

  function toggleDropdown(projetId: string) {
    openDropdownId = openDropdownId === projetId ? null : projetId;
  }

  function closeDropdown() {
    openDropdownId = null;
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    toast = { message, type };
    setTimeout(() => (toast = null), 3000);
  }

  // Derived
  const filteredProjets = $derived(
    projets.filter((p) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        p.id?.toLowerCase().includes(q) ||
        p.libelle?.toLowerCase().includes(q) ||
        p.reference?.toLowerCase().includes(q) ||
        p.ville?.toLowerCase().includes(q) ||
        p.etablissementNom?.toLowerCase().includes(q) ||
        p.societeNom?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredProjets.length / perPage));
  const displayedProjets = $derived(filteredProjets.slice((page - 1) * perPage, page * perPage));

  // Actions
  function openDeleteModal(proj: (typeof projets)[0]) {
    selectedProjet = proj;
    isDeleteModalOpen = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    selectedProjet = null;
  }

  function formatDate(date: Date | number | null): string {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR");
  }

  // CSV Export
  function downloadCSV() {
    if (!projets.length) return;
    const cols = [
      "id",
      "reference",
      "libelle",
      "ville",
      "etablissement",
      "societe",
      "date_demarrage",
    ];
    const lines = [cols.join(",")];

    for (const p of filteredProjets) {
      const row = [
        `"${(p.id || "").replace(/"/g, '""')}"`,
        `"${(p.reference || "").replace(/"/g, '""')}"`,
        `"${(p.libelle || "").replace(/"/g, '""')}"`,
        `"${(p.ville || "").replace(/"/g, '""')}"`,
        `"${(p.etablissementNom || "").replace(/"/g, '""')}"`,
        `"${(p.societeNom || "").replace(/"/g, '""')}"`,
        p.dateDemarrage ? formatDate(p.dateDemarrage) : "",
      ];
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projets_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

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
      overflow: "hidden",
    },
    div5: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
    ChartNoAxesCombined: {
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
    div6: {
      overflowX: "auto",
    },
    tbody: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.8% 0.007 247.896)",
    },
    tr: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    td: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    span: {
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
    span2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    span3: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span4: {
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
    div7: {
      position: "relative",
      zIndex: 50,
    },
    div8: {
      position: "fixed",
      inset: 0,
      zIndex: 10,
      width: "100vw",
      overflowY: "auto",
    },
    div9: {
      display: "flex",
      minHeight: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    div10: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1.25rem",
      paddingBottom: "1.25rem",
    },
    div11: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p4: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: "oklch(44.4% 0.177 26.899)",
    },
  });
</script>

<svelte:head>
  <title>Admin · Projets</title>
</svelte:head>

<main class={stylex.attrs(styles.main).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div).class}>
    <div class={stylex.attrs(styles.div2).class}>
      <div>
        <h1 class={stylex.attrs(styles.h1).class}>Gestion des projets</h1>
        <p class={stylex.attrs(styles.p).class}>Gérez tous les projets de la plateforme.</p>
      </div>
      <div class={stylex.attrs(styles.div3).class}>
        <a href="/app/admin/projets/nouveau" class={stylex.attrs(ui.button).class}>
          <Plus size={18} />
          Nouveau projet
        </a>
        <button onclick={downloadCSV} class={stylex.attrs(ui.button).class}>
          <Download size={16} />
          Export CSV
        </button>
      </div>
    </div>
  </div>

  <!-- Search Bar -->
  <label class={stylex.attrs(ui.input, styles.label).class}>
    <Search />
    <input
      type="search"
      bind:value={query}
      placeholder="Rechercher par ID Matterport, référence, libellé, ville, établissement..."
    />
  </label>
  <br />
  <br />

  <!-- Table -->
  <div class={stylex.attrs(styles.div4).class}>
    {#if displayedProjets.length === 0}
      <div class={stylex.attrs(styles.div5).class}>
        <ChartNoAxesCombined
          size={48}
          strokeWidth={1.5}
          class={stylex.attrs(styles.ChartNoAxesCombined).class}
        />
        <p class={stylex.attrs(styles.p2).class}>Aucun projet trouvé</p>
        <p class={stylex.attrs(styles.p3).class}>
          Créez un nouveau projet ou modifiez vos critères de recherche
        </p>
      </div>
    {:else}
      <div class={stylex.attrs(styles.div6).class}>
        <table class={stylex.attrs(ui.table).class}>
          <thead>
            <tr>
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >ID Matterport</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Référence</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Libellé</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}>Ville</th>
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Établissement</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Société</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Démarrage</th
              >
              <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading).class}
                >Actions</th
              >
            </tr>
          </thead>
          <tbody class={stylex.attrs(styles.tbody).class}>
            {#each displayedProjets as proj (proj.id)}
              <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span).class}>{proj.id}</span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span2).class}>{proj.reference}</span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span3).class}>{proj.libelle}</span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span3).class}>{proj.ville}</span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span3).class}
                    >{proj.etablissementNom || "-"}</span
                  >
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span4).class}>
                    {proj.societeNom || "-"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <span class={stylex.attrs(styles.span3).class}
                    >{formatDate(proj.dateDemarrage)}</span
                  >
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                  <a
                    href="/app/admin/projets/{proj.id}"
                    class={stylex.attrs(ui.button, ui.buttonGhost).class}
                    onclick={closeDropdown}
                  >
                    <Eye size={16} />
                    Voir
                  </a>
                  <a
                    href="/app/admin/projets/{proj.id}/modifier"
                    class={stylex.attrs(ui.button, ui.buttonGhost).class}
                    onclick={closeDropdown}
                  >
                    <Pencil size={16} />
                    Modifier
                  </a>
                  <button
                    onclick={() => {
                      openDeleteModal(proj);
                      closeDropdown();
                    }}
                    class={stylex.attrs(ui.button, ui.buttonGhost).class}
                  >
                    <Trash2 size={16} />
                    Supprimer
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- Pagination -->
    <Pagination
      {page}
      {totalPages}
      totalItems={filteredProjets.length}
      {perPage}
      onPageChange={(p) => (page = p)}
    />
  </div>
</main>

<!-- MODAL : Supprimer -->
{#if isDeleteModalOpen && selectedProjet}
  <div class={stylex.attrs(styles.div7).class} role="dialog" aria-modal="true">
    <div class={stylex.attrs(styles.div8).class}>
      <div class={stylex.attrs(styles.div9).class}>
        <form
          method="POST"
          action="?/delete"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === "success") {
                closeDeleteModal();
                showToast("Projet supprimé avec succès");
                await invalidateAll();
              } else {
                showToast("Échec de la suppression", "error");
              }
            };
          }}
        >
          <input type="hidden" name="projetId" value={selectedProjet.id} />
          <div class={stylex.attrs(styles.div10).class}>
            <div class={stylex.attrs(styles.div11).class}>
              <div>
                <h3 class={stylex.attrs(styles.h3).class}>Supprimer le projet</h3>
                <p class={stylex.attrs(styles.span3).class}>{selectedProjet.libelle}</p>
              </div>
            </div>
            <p class={stylex.attrs(styles.p4).class}>
              <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées
              à ce projet seront définitivement supprimées.
            </p>
          </div>
          <button type="button" class={stylex.attrs(ui.button).class} onclick={closeDeleteModal}>
            Annuler
          </button>
          <button type="submit" class={stylex.attrs(ui.button, ui.buttonWarning).class}>
            Supprimer définitivement
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

{#if toast}
  <div class={stylex.attrs(ui.toast).class}>
    <div class={stylex.attrs(ui.alert, ui.alertInfo).class}>
      <span class={stylex.attrs(styles.span2).class}>{toast.message}</span>
    </div>
  </div>
{/if}
