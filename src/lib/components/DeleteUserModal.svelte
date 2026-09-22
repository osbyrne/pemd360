<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { onDestroy } from "svelte";
  import {
    createOperation,
    isOperationSuccess,
    operationErrorMessage,
  } from "$lib/client/effect/operation.svelte";
  import { removeUser } from "$lib/client/workflows/auth";
  import { X } from "lucide-svelte";

  type User = {
    id: string;
    name: string;
  };

  export let user: User;

  const dispatch = createEventDispatcher<{
    deleted: { userId: string };
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;
  const operation = createOperation<void, unknown>();

  function openModal() {
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  async function confirmDelete() {
    if (operation.state.pending) return;
    const result = await operation.execute(removeUser({ userId: user.id }));
    if (!isOperationSuccess(result)) {
      dispatch("toast", {
        message:
          "Echec de la suppression : " + operationErrorMessage(result, "Echec de la suppression"),
        type: "error",
      });
      return;
    }
    dispatch("deleted", { userId: user.id });
    closeModal();
    dispatch("toast", { message: "Utilisateur supprime avec succes", type: "success" });
  }

  onDestroy(() => operation.dispose());

  const styles = stylex.create({
    button: {
      backgroundColor: {
        ":hover": "oklch(97.1% 0.013 17.38)",
      },
      color: {
        ":hover": "oklch(63.7% 0.237 25.331)",
      },
    },
    div: {
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
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div2: {
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
    p2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: "oklch(44.4% 0.177 26.899)",
    },
  });
</script>

<button
  type="button"
  on:click={openModal}
  class={stylex.attrs(ui.button, ui.buttonSmall, ui.buttonGhost, styles.button).class}
  title="Supprimer"
  aria-label="Supprimer {user.name}"
>
  <X size={18} />
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <div class={stylex.attrs(styles.div).class}>
      <div>
        <h3 class={stylex.attrs(styles.h3).class}>Supprimer l'utilisateur</h3>
        <p class={stylex.attrs(styles.p).class}>{user.name}</p>
      </div>
    </div>
    <div class={stylex.attrs(styles.div2).class}>
      <p class={stylex.attrs(styles.p2).class}>
        <strong>Attention :</strong> Cette action est irreversible. Toutes les donnees associees a cet
        utilisateur seront definitivement supprimees.
      </p>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={closeModal}
        >Annuler</button
      >
      <button
        type="button"
        class={stylex.attrs(ui.button, ui.buttonWarning).class}
        on:click={confirmDelete}>Supprimer definitivement</button
      >
    </div>
  </div>
</dialog>
