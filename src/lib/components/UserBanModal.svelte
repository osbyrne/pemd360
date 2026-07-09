<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { authClient } from "$lib/auth-client";
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
    try {
      if (wasBanned) {
        const res = await authClient.admin.unbanUser({ userId: user.id });
        if (res.error) {
          dispatch("toast", {
            message: "Echec de la reactivation : " + res.error.message,
            type: "error",
          });
          return;
        }
        dispatch("statusChanged", { userId: user.id, banned: false });
        dispatch("toast", { message: "Compte reactive avec succes", type: "success" });
      } else {
        const res = await authClient.admin.banUser({
          userId: user.id,
          banReason: banReason || "Action administrative",
        });
        if (res.error) {
          dispatch("toast", {
            message: "Echec de la cloture : " + res.error.message,
            type: "error",
          });
          return;
        }
        dispatch("statusChanged", { userId: user.id, banned: true });
        dispatch("toast", { message: "Compte cloture avec succes", type: "success" });
      }
      closeModal();
    } catch {
      dispatch("toast", {
        message: wasBanned ? "Echec de la reactivation du compte" : "Echec de la cloture du compte",
        type: "error",
      });
    }
  }
</script>

<button
  on:click={openModal}
  class="btn btn-ghost transition-colors {user.banned
    ? 'text-green-500 hover:bg-green-50 hover:text-green-700'
    : ' hover:bg-amber-50 hover:text-amber-600'}"
  title={user.banned ? "Reactiver le compte" : "Cloturer le compte"}
>
  <Ban />
</button>

<dialog bind:this={modal} class="modal">
  <div class="modal-box">
    <div class="mb-6 flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full {user.banned
          ? 'bg-green-100'
          : 'bg-amber-100'}"
      >
        <X />
      </div>
      <div>
        <h3 class="text-lg font-semibold">
          {user.banned ? "Reactiver le compte" : "Cloturer le compte"}
        </h3>
        <p class="text-sm">{user.name}</p>
      </div>
    </div>
    {#if user.banned}
      <p class="text-sm">
        Etes-vous sur de vouloir reactiver ce compte ? Il pourra a nouveau acceder a la plateforme.
      </p>
    {:else}
      <div>
        <label for="ban-reason-{user.id}" class="mb-1.5 block text-sm font-medium"
          >Raison de la cloture (optionnel)</label
        >
        <textarea
          id="ban-reason-{user.id}"
          bind:value={banReason}
          rows="3"
          placeholder="Ex: Violation des conditions d'utilisation..."
          class="input"></textarea>
      </div>
    {/if}
    <div class="modal-action">
      <button type="button" class="btn" on:click={closeModal}>Annuler</button>
      <button
        type="button"
        class="btn transition-colors {user.banned
          ? 'bg-green-600 hover:bg-green-700'
          : 'bg-amber-600 hover:bg-amber-700'}"
        on:click={confirmBan}
      >
        {user.banned ? "Reactiver" : "Cloturer"}
      </button>
    </div>
  </div>
</dialog>
