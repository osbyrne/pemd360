<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import { Plus } from "lucide-svelte";

  const dispatch = createEventDispatcher<{
    toast: { message: string; type: "success" | "error" };
  }>();

  let createModal: HTMLDialogElement;
  let loading = false;

  let createForm = {
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
  };

  function openCreateModal() {
    createForm = {
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
    };
    createModal?.showModal();
  }

  function closeCreateModal() {
    createModal?.close();
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
      backgroundColor: "oklch(95% 0.052 163.051)",
    },
    Plus: {
      color: "oklch(59.6% 0.145 163.225)",
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
      "--stack-gap": "1rem",
    },
    div5: {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "1rem",
    },
    div6: {
      "--stack-gap": "0.375rem",
    },
    label: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
    stackSpacing0375: { marginBlockEnd: { default: "0.375rem", ":last-child": 0 } },
  });
</script>

<button onclick={openCreateModal} class={stylex.attrs(ui.button).class}>
  <Plus size={18} />
  Nouvelle société
</button>

<dialog bind:this={createModal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel, styles.div).class}>
    <form
      method="POST"
      action="?/create"
      use:enhance={() => {
        loading = true;
        return async ({ result }) => {
          loading = false;
          if (result.type === "success") {
            dispatch("toast", { message: "Société créée avec succès", type: "success" });
            closeCreateModal();
            await invalidateAll();
          } else {
            dispatch("toast", { message: "Erreur lors de la création", type: "error" });
          }
        };
      }}
    >
      <div class={stylex.attrs(styles.div2).class}>
        <div class={stylex.attrs(styles.div3).class}>
          <Plus size={20} class={stylex.attrs(styles.Plus).class} />
        </div>
        <div>
          <h3 class={stylex.attrs(styles.h3).class}>Nouvelle société</h3>
          <p class={stylex.attrs(styles.p).class}>Remplissez les informations ci-dessous</p>
        </div>
      </div>
      <div class={stylex.attrs(styles.div4).class}>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-nom"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Nom</label
            >
            <input
              type="text"
              id="create-nom"
              name="nom"
              bind:value={createForm.nom}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
              placeholder="Ex: Dépollution Conseil"
              required
            />
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-tel"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Téléphone</label
            >
            <input
              type="tel"
              id="create-tel"
              name="tel"
              bind:value={createForm.tel}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div6).class}>
          <label
            for="create-raison"
            class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Raison sociale</label
          >
          <input
            type="text"
            id="create-raison"
            name="raisonSocial"
            bind:value={createForm.raisonSocial}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
          />
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div6).class}>
          <label for="create-rue" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
            >Adresse</label
          >
          <input
            type="text"
            id="create-rue"
            name="rue"
            bind:value={createForm.rue}
            class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            placeholder="Numéro et rue"
          />
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
          <div class={stylex.attrs(styles.div6).class}>
            <label for="create-cp" class={stylex.attrs(styles.stackSpacing0375, styles.label).class}
              >Code postal</label
            >
            <input
              type="text"
              id="create-cp"
              name="cp"
              bind:value={createForm.cp}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-ville"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Ville</label
            >
            <input
              type="text"
              id="create-ville"
              name="ville"
              bind:value={createForm.ville}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-email"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Email</label
            >
            <input
              type="email"
              id="create-email"
              name="email"
              bind:value={createForm.email}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-fax"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Fax</label
            >
            <input
              type="tel"
              id="create-fax"
              name="fax"
              bind:value={createForm.fax}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
        </div>
        <div class={stylex.attrs(styles.stackSpacing1, styles.div5).class}>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-siren"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>SIREN</label
            >
            <input
              type="text"
              id="create-siren"
              name="siren"
              bind:value={createForm.siren}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
          <div class={stylex.attrs(styles.div6).class}>
            <label
              for="create-type"
              class={stylex.attrs(styles.stackSpacing0375, styles.label).class}>Type</label
            >
            <input
              type="number"
              id="create-type"
              name="type"
              bind:value={createForm.type}
              class={stylex.attrs(styles.stackSpacing0375, ui.input).class}
            />
          </div>
        </div>
      </div>
      <div class={stylex.attrs(ui.dialogActions).class}>
        <button type="button" class={stylex.attrs(ui.button).class} onclick={closeCreateModal}
          >Annuler</button
        >
        <button type="submit" disabled={loading} class={stylex.attrs(ui.button).class}>
          {loading ? "Création..." : "Créer la société"}
        </button>
      </div>
    </form>
  </div>
</dialog>
