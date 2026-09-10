<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import type { PageData } from "./$types";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Download, Search, Building2, Pencil, Trash2 } from "lucide-svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import CreateSocieteModal from "$lib/components/CreateSocieteModal.svelte";

  let { data }: { data: PageData } = $props();

  // State
  let societes = $derived(data.societes);
  let loading = $state(false);

  // Pagination & Search
  let query = $state("");
  let perPage = 25;
  let page = $state(1);

  // Modals
  let editModal = $state<HTMLDialogElement>();
  let deleteModal = $state<HTMLDialogElement>();

  // Toast
  let toast: { message: string; type: "success" | "error" } | null = $state(null);

  // Active item
  let selectedCompany: (typeof societes)[0] | null = $state(null);

  // Forms
  let editForm = $state({
    nom: "",
    raisonSocial: "",
    rue: "",
    cp: "",
    ville: "",
    tel: "",
    fax: "",
    email: "",
    siren: "",
    type: 0,
  });

  function showToast(message: string, type: "success" | "error" = "success") {
    toast = { message, type };
    setTimeout(() => (toast = null), 3000);
  }

  // Derived
  const filteredCompanies = $derived(
    societes.filter((c) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        c.nom?.toLowerCase().includes(q) ||
        c.ville?.toLowerCase().includes(q) ||
        c.raisonSocial?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    }),
  );

  const totalPages = $derived(Math.ceil(filteredCompanies.length / perPage));
  const displayedCompanies = $derived(
    filteredCompanies.slice((page - 1) * perPage, page * perPage),
  );

  // Actions
  function openEditModal(company: (typeof societes)[0]) {
    selectedCompany = company;
    editForm = {
      nom: company.nom || "",
      raisonSocial: company.raisonSocial || "",
      rue: company.rue || "",
      cp: company.cp || "",
      ville: company.ville || "",
      tel: company.tel || "",
      fax: company.fax || "",
      email: company.email || "",
      siren: company.siren || "",
      type: company.type || 0,
    };
    editModal?.showModal();
  }

  function closeEditModal() {
    editModal?.close();
    selectedCompany = null;
  }

  function openDeleteModal(company: (typeof societes)[0]) {
    selectedCompany = company;
    deleteModal?.showModal();
  }

  function closeDeleteModal() {
    deleteModal?.close();
    selectedCompany = null;
  }

  // CSV Export
  function downloadCSV() {
    if (!societes.length) return;
    const cols = ["id", "nom", "raisonSocial", "rue", "cp", "ville", "tel", "email", "siren"];
    const lines = [cols.join(",")];

    for (const c of filteredCompanies) {
      const row = [
        c.id,
        `"${(c.nom || "").replace(/"/g, '""')}"`,
        `"${(c.raisonSocial || "").replace(/"/g, '""')}"`,
        `"${(c.rue || "").replace(/"/g, '""')}"`,
        c.cp || "",
        `"${(c.ville || "").replace(/"/g, '""')}"`,
        `"${(c.tel || "").replace(/"/g, '""')}"`,
        `"${(c.email || "").replace(/"/g, '""')}"`,
        `"${(c.siren || "").replace(/"/g, '""')}"`,
      ];
      lines.push(row.join(","));
    }

    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "societes_export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
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
      overflow: "hidden",
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(92.9% 0.013 255.508)",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
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
    div13: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div14: {
      minWidth: "0rem",
      flex: "1 1 0%",
    },
    p4: {
      fontWeight: 600,
    },
    p5: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div15: {
      display: {
        default: "none",
        "@media (min-width: 640px)": "flex",
      },
      flexShrink: 0,
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
      flexShrink: 0,
      flexDirection: {
        "@media (min-width: 768px)": "column",
      },
      alignItems: {
        "@media (min-width: 768px)": "flex-end",
      },
    },
    div17: {
      display: "flex",
      flexShrink: 0,
      alignItems: "center",
      gap: "0.25rem",
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(92.9% 0.013 255.508)",
      paddingLeft: "0.5rem",
    },
    div18: {
      maxWidth: "32rem",
    },
    div19: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div20: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.2% 0.032 255.585)",
    },
    Pencil: {
      color: "oklch(54.6% 0.245 262.881)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div21: {
      "--stack-gap": "1rem",
    },
    div22: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    div23: {
      "--stack-gap": "0.375rem",
    },
    div24: {
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
    div25: {
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
    p8: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: "oklch(44.4% 0.177 26.899)",
    },
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
    stackSpacing0375: { marginBlockEnd: { default: "0.375rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Sociétés</title>
</svelte:head>

<main class={stylex.attrs(styles.main).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div).class}>
    <div class={stylex.attrs(styles.div2).class}>
      <div>
        <h1 class={stylex.attrs(styles.h1).class}>Gestion des sociétés</h1>
        <p class={stylex.attrs(styles.p).class}>
          Gérez la liste des sociétés et leurs établissements rattachés.
        </p>
      </div>
      <div class={stylex.attrs(styles.div3).class}>
        <CreateSocieteModal on:toast={(e) => showToast(e.detail.message, e.detail.type)} />
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
    <input type="search" bind:value={query} placeholder="nom, ville ou raison sociale..." />
  </label>
  <br />
  <br />

  <!-- List -->
  <div class={stylex.attrs(styles.div4).class}>
    {#if loading}
      <div class={stylex.attrs(styles.div5).class}>
        {#each Array(5) as i (i)}
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
    {:else if displayedCompanies.length === 0}
      <div class={stylex.attrs(styles.div12).class}>
        <Building2 size={48} strokeWidth={1.5} class={stylex.attrs(styles.Building2).class} />
        <p class={stylex.attrs(styles.p2).class}>Aucune société trouvée</p>
        <p class={stylex.attrs(styles.p3).class}>Essayez de modifier vos critères de recherche</p>
      </div>
    {:else}
      <div class={stylex.attrs(styles.div5).class}>
        {#each displayedCompanies as company (company.id)}
          <div class={stylex.attrs(ui.divideChild, styles.div13).class}>
            <!-- Info -->
            <div class={stylex.attrs(styles.div14).class}>
              <p class={stylex.attrs(styles.p4).class}>{company.nom}</p>
              <p class={stylex.attrs(styles.p5).class}>{company.raisonSocial || "-"}</p>
            </div>

            <!-- Location -->
            <div class={stylex.attrs(styles.div15).class}>
              <p class={stylex.attrs(styles.p6).class}>{company.ville || "-"}</p>
              <p class={stylex.attrs(styles.p7).class}>{company.cp || "-"}</p>
            </div>

            <!-- Email / Tel -->
            <div class={stylex.attrs(styles.div16).class}>
              <p class={stylex.attrs(styles.p5).class}>{company.email || "-"}</p>
              <p class={stylex.attrs(styles.p7).class}>{company.tel || "-"}</p>
            </div>

            <!-- Actions -->
            <div class={stylex.attrs(styles.div17).class}>
              <button
                onclick={() => openEditModal(company)}
                class={stylex.attrs(ui.button, ui.buttonGhost).class}
                title="Modifier"
              >
                <Pencil size={18} />
              </button>
              <dialog bind:this={editModal} class={stylex.attrs(ui.dialog).class}>
                <div class={stylex.attrs(ui.dialogPanel, styles.div18).class}>
                  {#if selectedCompany}
                    <form
                      method="POST"
                      action="?/update"
                      use:enhance={() => {
                        loading = true;
                        return async ({ result }) => {
                          loading = false;
                          if (result.type === "success") {
                            showToast("Société mise à jour avec succès");
                            closeEditModal();
                            await invalidateAll();
                          } else {
                            showToast("Erreur lors de la mise à jour", "error");
                          }
                        };
                      }}
                    >
                      <input
                        class={stylex.attrs(ui.input).class}
                        type="hidden"
                        name="id"
                        value={selectedCompany.id}
                      />
                      <div class={stylex.attrs(styles.div19).class}>
                        <div class={stylex.attrs(styles.div20).class}>
                          <Pencil size={20} class={stylex.attrs(styles.Pencil).class} />
                        </div>
                        <div>
                          <h3 class={stylex.attrs(styles.h3).class}>Modifier la société</h3>
                          <p class={stylex.attrs(styles.p5).class}>{selectedCompany.nom}</p>
                        </div>
                      </div>
                      <div class={stylex.attrs(styles.div21).class}>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div22).class}>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-nom"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Nom</label
                            >
                            <input
                              type="text"
                              id="edit-nom"
                              name="nom"
                              bind:value={editForm.nom}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                              required
                            />
                          </div>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-tel"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Téléphone</label
                            >
                            <input
                              type="tel"
                              id="edit-tel"
                              name="tel"
                              bind:value={editForm.tel}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                        </div>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div23).class}>
                          <label
                            for="edit-raison"
                            class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                            >Raison sociale</label
                          >
                          <input
                            type="text"
                            id="edit-raison"
                            name="raisonSocial"
                            bind:value={editForm.raisonSocial}
                            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                          />
                        </div>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div23).class}>
                          <label
                            for="edit-rue"
                            class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                            >Adresse</label
                          >
                          <input
                            type="text"
                            id="edit-rue"
                            name="rue"
                            bind:value={editForm.rue}
                            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                          />
                        </div>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div22).class}>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-cp"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Code postal</label
                            >
                            <input
                              type="text"
                              id="edit-cp"
                              name="cp"
                              bind:value={editForm.cp}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-ville"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Ville</label
                            >
                            <input
                              type="text"
                              id="edit-ville"
                              name="ville"
                              bind:value={editForm.ville}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                        </div>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div22).class}>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-email"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Email</label
                            >
                            <input
                              type="email"
                              id="edit-email"
                              name="email"
                              bind:value={editForm.email}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-fax"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Fax</label
                            >
                            <input
                              type="tel"
                              id="edit-fax"
                              name="fax"
                              bind:value={editForm.fax}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                        </div>
                        <div class={stylex.attrs(styles.stackSpacing1, styles.div22).class}>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-siren"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >SIREN</label
                            >
                            <input
                              type="text"
                              id="edit-siren"
                              name="siren"
                              bind:value={editForm.siren}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                          <div class={stylex.attrs(styles.div23).class}>
                            <label
                              for="edit-type"
                              class={stylex.attrs(styles.stackSpacing0375, styles.p6).class}
                              >Type</label
                            >
                            <input
                              type="number"
                              id="edit-type"
                              name="type"
                              bind:value={editForm.type}
                              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
                            />
                          </div>
                        </div>
                      </div>
                      <div class={stylex.attrs(ui.dialogActions).class}>
                        <button
                          type="button"
                          class={stylex.attrs(ui.button).class}
                          onclick={closeEditModal}>Annuler</button
                        >
                        <button
                          type="submit"
                          disabled={loading}
                          class={stylex.attrs(ui.button).class}
                        >
                          {loading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                      </div>
                    </form>
                  {/if}
                </div>
              </dialog>

              <button
                onclick={() => openDeleteModal(company)}
                class={stylex.attrs(ui.button, ui.buttonGhost, ui.buttonWarning).class}
                title="Supprimer"
              >
                <Trash2 size={18} />
              </button>
              <dialog bind:this={deleteModal} class={stylex.attrs(ui.dialog).class}>
                <div class={stylex.attrs(ui.dialogPanel).class}>
                  {#if selectedCompany}
                    <form
                      method="POST"
                      action="?/delete"
                      use:enhance={() => {
                        loading = true;
                        return async ({ result }) => {
                          loading = false;
                          if (result.type === "success") {
                            showToast("Société supprimée avec succès");
                            closeDeleteModal();
                            await invalidateAll();
                          } else {
                            showToast("Erreur lors de la suppression", "error");
                          }
                        };
                      }}
                    >
                      <input
                        class={stylex.attrs(ui.input).class}
                        type="hidden"
                        name="id"
                        value={selectedCompany.id}
                      />
                      <div class={stylex.attrs(styles.div19).class}>
                        <div class={stylex.attrs(styles.div24).class}>
                          <Trash2 size={20} class={stylex.attrs(styles.Trash2).class} />
                        </div>
                        <div>
                          <h3 class={stylex.attrs(styles.h3).class}>Supprimer la société</h3>
                          <p class={stylex.attrs(styles.p5).class}>{selectedCompany.nom}</p>
                        </div>
                      </div>
                      <div class={stylex.attrs(styles.div25).class}>
                        <p class={stylex.attrs(styles.p8).class}>
                          <strong>Attention :</strong> Cette action est irréversible. Toutes les données
                          associées à cette société seront définitivement supprimées.
                        </p>
                      </div>
                      <div class={stylex.attrs(ui.dialogActions).class}>
                        <button
                          type="button"
                          class={stylex.attrs(ui.button).class}
                          onclick={closeDeleteModal}>Annuler</button
                        >
                        <button
                          type="submit"
                          disabled={loading}
                          class={stylex.attrs(ui.button).class}
                        >
                          {loading ? "Suppression..." : "Supprimer définitivement"}
                        </button>
                      </div>
                    </form>
                  {/if}
                </div>
              </dialog>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if !loading}
      <Pagination
        {page}
        {totalPages}
        totalItems={filteredCompanies.length}
        {perPage}
        onPageChange={(p) => (page = p)}
      />
    {/if}
  </div>
</main>

{#if toast}
  <div class={stylex.attrs(ui.toast).class}>
    <div class={stylex.attrs(ui.alert, ui.alertInfo).class}>
      <span class={stylex.attrs(styles.p6).class}>{toast.message}</span>
    </div>
  </div>
{/if}
