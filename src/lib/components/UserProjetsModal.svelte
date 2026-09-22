<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Folder, Search } from "lucide-svelte";

  type User = {
    id: string;
    name: string;
  };

  type Projet = {
    id: string;
    libelle: string;
    reference: string;
  };

  export let user: User;
  export let projets: Projet[] = [];
  export let initialProjetIds: string[] = [];

  const dispatch = createEventDispatcher<{
    saved: { userId: string; projetIds: string[] };
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;
  let modalProjectSearch = "";
  let projetIds: string[] = [];

  $: filteredModalProjets = projets.filter((p) => {
    if (!modalProjectSearch) return true;
    const search = modalProjectSearch.toLowerCase();
    return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
  });

  function openModal() {
    projetIds = [...initialProjetIds];
    modalProjectSearch = "";
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  const styles = stylex.create({
    div: {
      maxWidth: "32rem",
    },
    div2: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div3: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93% 0.034 272.788)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div4: {
      marginBottom: "0.375rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div5: {
      maxHeight: "16rem",
      overflowY: "auto",
      borderRadius: ".5rem",
    },
    p2: {
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    label: {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      gap: "0.75rem",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    div6: {
      minWidth: "0rem",
      flex: "1 1 0%",
    },
    p3: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    p4: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    p5: {
      marginTop: "0.5rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
  });
</script>

<button
  type="button"
  on:click={openModal}
  class={stylex.attrs(ui.button, ui.buttonSmall, ui.buttonGhost).class}
  title="Gérer les projets"
  aria-label="Gérer les projets de {user.name}"
>
  <Folder size={18} />
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel, styles.div).class}>
    <form
      method="POST"
      action="?/setProjets"
      use:enhance={() => {
        return async ({ result }) => {
          if (result.type === "success") {
            await invalidateAll();
            dispatch("saved", { userId: user.id, projetIds });
            closeModal();
            dispatch("toast", { message: "Projets mis a jour avec succes", type: "success" });
          } else {
            dispatch("toast", { message: "Echec de la mise a jour", type: "error" });
          }
        };
      }}
    >
      <input type="hidden" name="userId" value={user.id} />
      <div class={stylex.attrs(styles.div2).class}>
        <div class={stylex.attrs(styles.div3).class}>
          <Folder />
        </div>
        <div>
          <h3 class={stylex.attrs(styles.h3).class}>Gerer les projets</h3>
          <p class={stylex.attrs(styles.p).class}>{user.name}</p>
        </div>
      </div>
      <div>
        <div class={stylex.attrs(styles.div4).class}>Projets assignes</div>
        <label class={stylex.attrs(ui.input).class}>
          <Search />
          <input
            type="search"
            bind:value={modalProjectSearch}
            placeholder="Rechercher un projet..."
          />
        </label>

        <div class={stylex.attrs(styles.div5).class}>
          {#if projets.length === 0}
            <p class={stylex.attrs(styles.p2).class}>Aucun projet disponible</p>
          {:else if filteredModalProjets.length === 0}
            <p class={stylex.attrs(styles.p2).class}>Aucun projet trouve</p>
          {:else}
            {#each filteredModalProjets as p, i (i)}
              <label class={stylex.attrs(styles.label).class}>
                <input
                  type="checkbox"
                  name="projetIds"
                  value={p.id}
                  checked={projetIds.includes(p.id)}
                  on:change={(e) => {
                    if (e.currentTarget.checked) {
                      projetIds = [...projetIds, p.id];
                    } else {
                      projetIds = projetIds.filter((id) => id !== p.id);
                    }
                  }}
                  class={stylex.attrs(ui.checkbox).class}
                />
                <div class={stylex.attrs(styles.div6).class}>
                  <p class={stylex.attrs(styles.p3).class}>{p.libelle}</p>
                  <p class={stylex.attrs(styles.p4).class}>Ref: {p.reference}</p>
                </div>
              </label>
            {/each}
          {/if}
        </div>
        <p class={stylex.attrs(styles.p5).class}>
          {projetIds.length} projet{projetIds.length > 1 ? "s" : ""} selectionne{projetIds.length >
          1
            ? "s"
            : ""}
        </p>
      </div>
      <div class={stylex.attrs(ui.dialogActions).class}>
        <button type="button" class={stylex.attrs(ui.button).class} on:click={closeModal}
          >Annuler</button
        >
        <button type="submit" class={stylex.attrs(ui.button).class}>Enregistrer</button>
      </div>
    </form>
  </div>
</dialog>
