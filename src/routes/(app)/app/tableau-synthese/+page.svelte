<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Trash2, QrCode, Download, Search, X } from "lucide-svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  let isDeleteModalOpen = $state(false);
  let isQrModalOpen = $state(false);
  let currentItem = $state<any>(null);
  let qrItem = $state<any>(null);

  // Derived
  const displayedList = $derived(data?.list || []);
  const pagination = $derived(data.pagination);

  $effect(() => {
    query = data.q || "";
  });

  function updateUrl(params: Record<string, string | null>) {
    const url = new URL($pageStore.url);

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    }

    goto(url, { keepFocus: true, noScroll: true });
  }

  function handleProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    updateUrl({
      projectId: value || null,
      page: null,
    });
  }

  function handleSearchInput(event: Event) {
    query = (event.target as HTMLInputElement).value;

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(() => {
      updateUrl({
        q: query.trim() || null,
        page: null,
      });
    }, 300);
  }

  function goToPage(nextPage: number) {
    updateUrl({
      page: String(nextPage),
    });
  }

  function openDeleteModal(item: any) {
    currentItem = item;
    isDeleteModalOpen = true;
  }

  function openQrModal(item: any) {
    qrItem = item;
    isQrModalOpen = true;
  }

  function closeModal() {
    isDeleteModalOpen = false;
    isQrModalOpen = false;
    currentItem = null;
    qrItem = null;
  }

  function handleFormResult() {
    return async ({ result, update }: any) => {
      if (result.type === "success") {
        closeModal();
        await update();
      }
    };
  }

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
  }

  // Calcul du coefficient de réemploi (pourcentage)
  function getCoefficientReemploi(item: any): string {
    if (item.reemploi) {
      return "100%";
    } else if (item.potentielReemploi) {
      // Vous pouvez ajuster la logique selon vos besoins
      return item.potentielReemploi;
    }
    return "0%";
  }

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
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      alignItems: {
        default: "flex-start",
        "@media (min-width: 640px)": "center",
      },
      justifyContent: "space-between",
      gap: "1rem",
    },
    h1: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: 700,
    },
    p: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div3: {
      marginBottom: "1.5rem",
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      gap: "1rem",
    },
    div4: {
      width: {
        default: "100%",
        "@media (min-width: 640px)": "16rem",
      },
    },
    label: {
      position: "relative",
    },
    div5: {
      overflow: "hidden",
    },
    div6: {
      overflowX: "auto",
    },
    thead: {
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 600,
      textTransform: "uppercase",
    },
    th: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    th2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      textAlign: "center",
    },
    th3: {
      width: "8rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      textAlign: "center",
    },
    tbody: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.7% 0.003 264.542)",
    },
    td: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      textAlign: "center",
    },
    tr: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    td2: {
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontWeight: 500,
    },
    span: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.2% 0.032 255.585)",
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(42.4% 0.199 265.638)",
    },
    span2: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(96.2% 0.044 156.743)",
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
      color: "oklch(44.8% 0.119 151.328)",
    },
    span3: {
      fontWeight: 500,
    },
    img: {
      height: "4rem",
      width: "4rem",
      borderRadius: ".25rem",
      objectFit: "cover",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    span4: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    button: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      borderRadius: ".5rem",
      paddingInlineStart: "0.75rem",
      paddingInlineEnd: "0.75rem",
      paddingTop: "0.375rem",
      paddingBottom: "0.375rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    QrCode: {
      height: "1rem",
      width: "1rem",
    },
    span5: {
      display: {
        default: "none",
        "@media (min-width: 640px)": "inline",
      },
    },
    div7: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    button2: {
      borderRadius: ".5rem",
      paddingTop: "0.375rem",
      paddingRight: "0.375rem",
      paddingBottom: "0.375rem",
      paddingLeft: "0.375rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: {
        ":hover": "oklch(97.1% 0.013 17.38)",
      },
      color: {
        ":hover": "oklch(57.7% 0.245 27.325)",
      },
    },
    div8: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingRight: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingBottom: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
      paddingLeft: {
        default: "1rem",
        "@media (min-width: 640px)": "1.5rem",
      },
    },
    div9: {
      position: "fixed",
      inset: 0,
      backdropFilter: "blur(8px)",
      transitionProperty: "opacity",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div10: {
      position: "relative",
      width: "100%",
      maxWidth: "28rem",
      overflow: "hidden",
      borderRadius: ".75rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div11: {
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    h3: {
      marginBottom: "0.5rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p2: {
      marginBottom: "1.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div12: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
    },
    div13: {
      position: "relative",
      width: "100%",
      maxWidth: "28rem",
      overflow: "hidden",
      borderRadius: ".75rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div14: {
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    h32: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    X: {
      height: "1.5rem",
      width: "1.5rem",
    },
    div15: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    div16: {
      borderRadius: ".5rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div17: {
      display: "flex",
      height: "12rem",
      width: "12rem",
      alignItems: "center",
      justifyContent: "center",
    },
    span6: {
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p3: {
      marginTop: "1rem",
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    p4: {
      marginTop: "0.25rem",
      textAlign: "center",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
  });
</script>

<svelte:head>
  <title>Tableaux Synthèse PEMD</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Tableaux Synthèse PEMD</h1>
      <p class={stylex.attrs(styles.p).class}>Vue de synthèse des éléments PEMD par projet.</p>
    </div>
    <a href="tableau-synthese/export{$pageStore.url.search}" class={stylex.attrs(ui.button).class}>
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters -->
  <div class={stylex.attrs(styles.div3).class}>
    <!-- Project Selector -->
    <div class={stylex.attrs(styles.div4).class}>
      <select
        class={stylex.attrs(ui.select).class}
        value={data.selectedProjectId || ""}
        onchange={handleProjectChange}
      >
        <option value="">Tous les projets</option>
        {#each data.projects as project}
          <option value={project.id}>{project.libelle}</option>
        {/each}
      </select>
    </div>

    <!-- Search Bar -->
    <label class={stylex.attrs(ui.input, styles.label).class}>
      <Search />
      <input type="search" value={query} oninput={handleSearchInput} placeholder="Rechercher..." />
    </label>
  </div>

  <div class={stylex.attrs(styles.div5).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <table class={stylex.attrs(ui.table).class}>
        <thead class={stylex.attrs(styles.thead).class}>
          <tr>
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >PEMD</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Description</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >État</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Étage</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Potentiel réemploi</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Coefficient réemploi</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >Miniature</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
              >QR code</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th3).class}
              >Actions</th
            >
          </tr>
        </thead>
        <tbody class={stylex.attrs(styles.tbody).class}>
          {#if displayedList.length === 0}
            <tr class={stylex.attrs(ui.divideChild).class}>
              <td colspan="9" class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td).class}>
                {#if query}
                  Aucun résultat pour "{query}".
                {:else}
                  Aucun élément PEMD enregistré.
                {/if}
              </td>
            </tr>
          {:else}
            {#each displayedList as item}
              <tr class={stylex.attrs(ui.divideChild, styles.tr).class}>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.td2).class}
                  >{item.objet || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                  >{item.description || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  {#if item.etat}
                    <span class={stylex.attrs(styles.span).class}>
                      {item.etat}
                    </span>
                  {:else}
                    <span>-</span>
                  {/if}
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                  >{item.etage || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  {#if item.potentielReemploi}
                    <span class={stylex.attrs(styles.span2).class}>
                      {item.potentielReemploi}
                    </span>
                  {:else}
                    <span>-</span>
                  {/if}
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  <span
                    class={stylex.attrs(styles.span3, item.reemploi ? ui.textGreen600 : false)
                      .class}
                  >
                    {getCoefficientReemploi(item)}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  {#if item.imageHash}
                    <img
                      src={imageUrl(item.imageHash)}
                      alt="Miniature"
                      loading="lazy"
                      class={stylex.attrs(styles.img).class}
                    />
                  {:else}
                    <span class={stylex.attrs(styles.span4).class}>N/A</span>
                  {/if}
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th2).class}>
                  <button
                    onclick={() => openQrModal(item)}
                    class={stylex.attrs(styles.button).class}
                    title="Afficher QR Code"
                  >
                    <QrCode class={stylex.attrs(styles.QrCode).class} />
                    <span class={stylex.attrs(styles.span5).class}>Voir</span>
                  </button>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  <div class={stylex.attrs(styles.div7).class}>
                    <button
                      onclick={() => openDeleteModal(item)}
                      class={stylex.attrs(styles.button2).class}
                      title="Supprimer"
                    >
                      <Trash2 class={stylex.attrs(styles.QrCode).class} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      perPage={pagination.perPage}
      onPageChange={goToPage}
    />
  </div>
</div>

<!-- Delete Modal -->
{#if isDeleteModalOpen}
  <div class={stylex.attrs(styles.div8).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(styles.div9).class}
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="-1"
    ></div>
    <div class={stylex.attrs(styles.div10).class}>
      <div class={stylex.attrs(styles.div11).class}>
        <h3 class={stylex.attrs(styles.h3).class}>Confirmer la suppression</h3>
        <p class={stylex.attrs(styles.p2).class}>
          Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
        </p>
        <form method="POST" action="?/delete" use:enhance={handleFormResult()}>
          <input type="hidden" name="id" value={currentItem?.id} />
          <div class={stylex.attrs(styles.div12).class}>
            <button type="button" onclick={closeModal} class={stylex.attrs(ui.button).class}>
              Annuler
            </button>
            <button type="submit" class={stylex.attrs(ui.button, ui.buttonWarning).class}>
              Supprimer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- QR Code Modal -->
{#if isQrModalOpen}
  <div class={stylex.attrs(styles.div8).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(styles.div9).class}
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="-1"
    ></div>
    <div class={stylex.attrs(styles.div13).class}>
      <div class={stylex.attrs(styles.div14).class}>
        <h3 class={stylex.attrs(styles.h32).class}>QR Code</h3>
        <button onclick={closeModal} class={stylex.attrs(ui.button).class} aria-label="Fermer">
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>
      <div class={stylex.attrs(styles.div15).class}>
        <div class={stylex.attrs(styles.div16).class}>
          <!-- Placeholder pour le QR Code - à remplacer par une vraie bibliothèque QR -->
          <div class={stylex.attrs(styles.div17).class}>
            <span class={stylex.attrs(styles.span6).class}>QR Code<br />{qrItem?.id}</span>
          </div>
        </div>
        <p class={stylex.attrs(styles.p3).class}>{qrItem?.objet}</p>
        {#if qrItem?.description}
          <p class={stylex.attrs(styles.p4).class}>{qrItem.description}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}
