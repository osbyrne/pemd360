<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { authClient } from "$lib/auth-client";
  import { KeyRound, Pencil } from "lucide-svelte";

  type User = {
    id: string;
    name: string;
  };

  export let user: User;

  const dispatch = createEventDispatcher<{
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;
  let newPassword = "";

  function openModal() {
    newPassword = "";
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  async function setPassword() {
    try {
      const res = await authClient.admin.setUserPassword({
        userId: user.id,
        newPassword,
      });
      if (res.error) {
        dispatch("toast", {
          message: "Echec de la mise a jour du mot de passe : " + res.error.message,
          type: "error",
        });
        return;
      }
      closeModal();
      dispatch("toast", { message: "Mot de passe mis a jour avec succes", type: "success" });
    } catch {
      dispatch("toast", { message: "Echec de la mise a jour du mot de passe", type: "error" });
    }
  }

  const styles = stylex.create({
    div: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div2: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(96.2% 0.059 95.617)",
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
    label: {
      marginBottom: "0.375rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    p2: {
      marginTop: "0.5rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
  });
</script>

<button
  on:click={openModal}
  class={stylex.attrs(ui.button, ui.buttonGhost).class}
  title="Changer le mot de passe"
>
  <KeyRound size={18} />
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <div class={stylex.attrs(styles.div).class}>
      <div class={stylex.attrs(styles.div2).class}>
        <Pencil />
      </div>
      <div>
        <h3 class={stylex.attrs(styles.h3).class}>Changer le mot de passe</h3>
        <p class={stylex.attrs(styles.p).class}>{user.name}</p>
      </div>
    </div>
    <div>
      <label for="new-password-{user.id}" class={stylex.attrs(styles.label).class}
        >Nouveau mot de passe</label
      >
      <input
        id="new-password-{user.id}"
        bind:value={newPassword}
        type="password"
        autocomplete="new-password"
        placeholder="Entrez le nouveau mot de passe"
        class={stylex.attrs(ui.input).class}
      />
      <p class={stylex.attrs(styles.p2).class}>
        Le mot de passe doit contenir au moins 8 caracteres.
      </p>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={closeModal}
        >Annuler</button
      >
      <button type="button" class={stylex.attrs(ui.button).class} on:click={setPassword}
        >Mettre a jour</button
      >
    </div>
  </div>
</dialog>
