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
  import { banUser, unbanUser } from "$lib/client/workflows/auth";
  import { Ban, X } from "lucide-svelte";

  type User = {
    id: string;
    name: string;
    banned: boolean;
  };

  export let user: User;

  const dispatch = createEventDispatcher<{
    statusChanged: { userId: string; banned: boolean };
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;
  const operation = createOperation<void, unknown>();
  let banReason = "";

  function openModal() {
    banReason = "";
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  async function confirmBan() {
    const wasBanned = user.banned;
    if (operation.state.pending) return;
    const result = await operation.execute(
      wasBanned
        ? unbanUser({ userId: user.id })
        : banUser({ userId: user.id, banReason: banReason || "Action administrative" }),
    );
    if (!isOperationSuccess(result)) {
      dispatch("toast", {
        message:
          (wasBanned ? "Echec de la reactivation : " : "Echec de la cloture : ") +
          operationErrorMessage(
            result,
            wasBanned ? "Echec de la reactivation" : "Echec de la cloture",
          ),
        type: "error",
      });
      return;
    }
    if (wasBanned) {
      dispatch("statusChanged", { userId: user.id, banned: false });
      dispatch("toast", { message: "Compte reactive avec succes", type: "success" });
    } else {
      dispatch("statusChanged", { userId: user.id, banned: true });
      dispatch("toast", { message: "Compte cloture avec succes", type: "success" });
    }
    closeModal();
  }

  onDestroy(() => operation.dispose());

  const styles = stylex.create({
    button: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
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
  });
</script>

<button
  on:click={openModal}
  class={stylex.attrs(
    ui.button,
    ui.buttonGhost,
    styles.button,
    user.banned
      ? [ui.textGreen500, ui.hoverBgGreen50, ui.hoverTextGreen700]
      : [ui.hoverBgAmber50, ui.hoverTextAmber600],
  ).class}
  title={user.banned ? "Reactiver le compte" : "Cloturer le compte"}
>
  <Ban />
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <div class={stylex.attrs(styles.div).class}>
      <div class={stylex.attrs(styles.div2, user.banned ? ui.bgGreen100 : ui.bgAmber100).class}>
        <X />
      </div>
      <div>
        <h3 class={stylex.attrs(styles.h3).class}>
          {user.banned ? "Reactiver le compte" : "Cloturer le compte"}
        </h3>
        <p class={stylex.attrs(styles.p).class}>{user.name}</p>
      </div>
    </div>
    {#if user.banned}
      <p class={stylex.attrs(styles.p).class}>
        Etes-vous sur de vouloir reactiver ce compte ? Il pourra a nouveau acceder a la plateforme.
      </p>
    {:else}
      <div>
        <label for="ban-reason-{user.id}" class={stylex.attrs(styles.label).class}
          >Raison de la cloture (optionnel)</label
        >
        <textarea
          id="ban-reason-{user.id}"
          bind:value={banReason}
          rows="3"
          placeholder="Ex: Violation des conditions d'utilisation..."
          class={stylex.attrs(ui.input).class}></textarea>
      </div>
    {/if}
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={closeModal}
        >Annuler</button
      >
      <button
        type="button"
        class={stylex.attrs(
          ui.button,
          styles.button,
          user.banned ? [ui.bgGreen600, ui.hoverBgGreen700] : [ui.bgAmber600, ui.hoverBgAmber700],
        ).class}
        on:click={confirmBan}
      >
        {user.banned ? "Reactiver" : "Cloturer"}
      </button>
    </div>
  </div>
</dialog>
