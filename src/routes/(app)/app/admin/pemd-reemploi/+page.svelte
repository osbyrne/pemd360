<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";
  import { Trash2, Download, X, Search } from "lucide-svelte";
  import PemdTabs from "$lib/components/PemdTabs.svelte";
  import DeleteConfirmModal from "$lib/components/DeleteConfirmModal.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import ProjectFilter from "$lib/components/ProjectFilter.svelte";

  let { data } = $props();

  // Pagination & Search
  let query = $state("");
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  let isDeleteModalOpen = $state(false);
  let currentItem = $state<any>(null);
  let isQrModalOpen = $state(false);
  let isCardModalOpen = $state(false);
  let qrItem = $state<any>(null);
  let cardItem = $state<any>(null);

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

  function openDeleteModal(item: any) {
    currentItem = item;
    isDeleteModalOpen = true;
  }

  function openQrModal(item: any) {
    qrItem = item;
    isQrModalOpen = true;
  }

  function openCardModal(item: any) {
    cardItem = item;
    isCardModalOpen = true;
  }

  function closeDeleteModal() {
    isDeleteModalOpen = false;
    currentItem = null;
  }

  function closeModal() {
    isQrModalOpen = false;
    isCardModalOpen = false;
    qrItem = null;
    cardItem = null;
  }

  function imageUrl(hash: string) {
    return `/api/images/${encodeURIComponent(hash)}`;
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
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div4: {
      overflow: "hidden",
    },
    div5: {
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
      paddingInlineStart: "0.625rem",
      paddingInlineEnd: "0.625rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      fontWeight: 500,
    },
    img: {
      height: "3rem",
      width: "3rem",
      borderRadius: ".25rem",
      objectFit: "cover",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    span2: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div6: {
      display: "flex",
      gap: "0.5rem",
    },
    button: {
      borderRadius: ".25rem",
      backgroundColor: {
        default: "oklch(93.2% 0.032 255.585)",
        ":hover": "oklch(88.2% 0.059 254.128)",
      },
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      color: "oklch(48.8% 0.243 264.376)",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    button2: {
      borderRadius: ".25rem",
      backgroundColor: {
        default: "oklch(95% 0.052 163.051)",
        ":hover": "oklch(90.5% 0.093 164.15)",
      },
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      color: "oklch(50.8% 0.118 165.612)",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div7: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    button3: {
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
    Trash2: {
      height: "1rem",
      width: "1rem",
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
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div11: {
      marginBottom: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    X: {
      height: "1.5rem",
      width: "1.5rem",
    },
    div12: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    div13: {
      borderRadius: ".5rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div14: {
      display: "flex",
      height: "12rem",
      width: "12rem",
      alignItems: "center",
      justifyContent: "center",
    },
    span3: {
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p2: {
      marginTop: "1rem",
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div15: {
      position: "relative",
      width: "100%",
      maxWidth: "42rem",
      overflow: "hidden",
      borderRadius: ".75rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div16: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    h32: {
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div17: {
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    h4: {
      marginBottom: "0.5rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 500,
    },
    p3: {
      marginBottom: "1.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div18: {
      marginBottom: "1.5rem",
    },
    img2: {
      height: "16rem",
      width: "100%",
      borderRadius: ".5rem",
      objectFit: "cover",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px -1px #0000001a",
    },
    div19: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    div20: {
      borderRadius: ".5rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    p4: {
      marginBottom: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
      textTransform: "uppercase",
    },
    p5: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div21: {
      marginTop: "1.5rem",
      display: "flex",
      justifyContent: "flex-end",
    },
  });
</script>

<svelte:head>
  <title>Admin · PEMD - Réemploi</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <PemdTabs />

  <div class={stylex.attrs(styles.div2).class}>
    <div>
      <h1 class={stylex.attrs(styles.h1).class}>Inventaire PEMD - Réemploi</h1>
      <p class={stylex.attrs(styles.p).class}>
        Gestion des éléments destinés au réemploi par projet.
      </p>
    </div>
    <a href="pemd-reemploi/export{$pageStore.url.search}" class={stylex.attrs(ui.button).class}>
      <Download />
      Exporter en Excel
    </a>
  </div>

  <!-- Filters -->
  <div class={stylex.attrs(styles.div3).class}>
    <ProjectFilter projects={data.projects} selectedProjectId={data.selectedProjectId} />
    <label class={stylex.attrs(ui.input, styles.label).class}>
      <Search />
      <input
        type="search"
        value={query}
        oninput={handleSearchInput}
        placeholder="Rechercher par macro-catégorie, catégorie, objet ou projet..."
      />
    </label>
  </div>

  <div class={stylex.attrs(styles.div4).class}>
    <div class={stylex.attrs(styles.div5).class}>
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
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th).class}
              >QR code</th
            >
            <th class={stylex.attrs(ui.tableCell, ui.tableRule, ui.tableHeading, styles.th2).class}
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
                  Aucun élément PEMD réemploi enregistré.
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
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                  >{item.etat || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                  >{item.etage || "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  <span
                    class={stylex.attrs(
                      styles.span,
                      item.potentielReemploi
                        ? [ui.bgGreen100, ui.textGreen800]
                        : [ui.bgRed100, ui.textRed800],
                    ).class}
                  >
                    {item.potentielReemploi ? "Oui" : "Non"}
                  </span>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}
                  >{item.reemploi ?? "-"}</td
                >
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  {#if item.imageHash}
                    <img
                      src={imageUrl(item.imageHash)}
                      alt="Miniature"
                      loading="lazy"
                      class={stylex.attrs(styles.img).class}
                    />
                  {:else}
                    <span class={stylex.attrs(styles.span2).class}>N/A</span>
                  {/if}
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  <div class={stylex.attrs(styles.div6).class}>
                    <button
                      onclick={() => openQrModal(item)}
                      class={stylex.attrs(styles.button).class}
                      title="Afficher QR Code"
                    >
                      QR Code
                    </button>
                    <button
                      onclick={() => openCardModal(item)}
                      class={stylex.attrs(styles.button2).class}
                      title="Voir la carte"
                    >
                      Voir la carte
                    </button>
                  </div>
                </td>
                <td class={stylex.attrs(ui.tableCell, ui.tableRule, styles.th).class}>
                  <div class={stylex.attrs(styles.div7).class}>
                    <button
                      onclick={() => openDeleteModal(item)}
                      class={stylex.attrs(styles.button3).class}
                      title="Supprimer"
                    >
                      <Trash2 class={stylex.attrs(styles.Trash2).class} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <Pagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      perPage={pagination.perPage}
      onPageChange={(page) => updateUrl({ page: String(page) })}
    />
  </div>
</div>

<DeleteConfirmModal
  isOpen={isDeleteModalOpen}
  itemLabel={currentItem?.objet || currentItem?.description || ""}
  itemId={currentItem?.id}
  onClose={closeDeleteModal}
/>

{#if isQrModalOpen}
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
        <h3 class={stylex.attrs(styles.h3).class}>QR Code</h3>
        <button onclick={closeModal} class={stylex.attrs(styles.tr).class} aria-label="Fermer">
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>
      <div class={stylex.attrs(styles.div12).class}>
        <div class={stylex.attrs(styles.div13).class}>
          <!-- Placeholder pour le QR Code - à remplacer par une vraie bibliothèque QR -->
          <div class={stylex.attrs(styles.div14).class}>
            <span class={stylex.attrs(styles.span3).class}>QR Code<br />{qrItem?.id}</span>
          </div>
        </div>
        <p class={stylex.attrs(styles.p2).class}>{qrItem?.objet}</p>
      </div>
    </div>
  </div>
{/if}

{#if isCardModalOpen}
  <div class={stylex.attrs(styles.div8).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(styles.div9).class}
      onclick={closeModal}
      onkeydown={(e) => e.key === "Escape" && closeModal()}
      role="button"
      tabindex="-1"
    ></div>
    <div class={stylex.attrs(styles.div15).class}>
      <div class={stylex.attrs(styles.div16).class}>
        <h3 class={stylex.attrs(styles.h32).class}>Carte PEMD</h3>
        <button onclick={closeModal} class={stylex.attrs(styles.tr).class} aria-label="Fermer">
          <X class={stylex.attrs(styles.X).class} />
        </button>
      </div>

      <div class={stylex.attrs(styles.div17).class}>
        <h4 class={stylex.attrs(styles.h4).class}>{cardItem?.objet}</h4>
        <p class={stylex.attrs(styles.p3).class}>{cardItem?.description || "Aucune description"}</p>

        {#if cardItem?.imageHash}
          <div class={stylex.attrs(styles.div18).class}>
            <img
              src={imageUrl(cardItem.imageHash)}
              alt={cardItem.objet}
              loading="lazy"
              class={stylex.attrs(styles.img2).class}
            />
          </div>
        {/if}

        <div class={stylex.attrs(styles.div19).class}>
          <div class={stylex.attrs(styles.div20).class}>
            <p class={stylex.attrs(styles.p4).class}>Localisation</p>
            <p class={stylex.attrs(styles.p5).class}>Étage {cardItem?.etage || "N/A"}</p>
          </div>

          <div class={stylex.attrs(styles.div20).class}>
            <p class={stylex.attrs(styles.p4).class}>État</p>
            <p class={stylex.attrs(styles.p5).class}>{cardItem?.etat || "N/A"}</p>
          </div>

          <div class={stylex.attrs(styles.div20).class}>
            <p class={stylex.attrs(styles.p4).class}>Coefficient de réemploi</p>
            <p class={stylex.attrs(styles.p5).class}>{cardItem?.reemploi ?? "N/A"}</p>
          </div>

          <div class={stylex.attrs(styles.div20).class}>
            <p class={stylex.attrs(styles.p4).class}>Masse</p>
            <p class={stylex.attrs(styles.p5).class}>
              {cardItem?.masse ? `${cardItem.masse} Kg` : "N/A"}
            </p>
          </div>
        </div>

        <div class={stylex.attrs(styles.div21).class}>
          <button onclick={closeModal} class={stylex.attrs(ui.button).class}> Fermer </button>
        </div>
      </div>
    </div>
  </div>
{/if}
