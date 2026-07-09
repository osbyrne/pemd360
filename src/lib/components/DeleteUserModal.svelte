<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { authClient } from "$lib/auth-client";
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

  function openModal() {
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  async function confirmDelete() {
    try {
      const res = await authClient.admin.removeUser({
        userId: user.id,
      });
      if (res.error) {
        dispatch("toast", {
          message: "Echec de la suppression : " + res.error.message,
          type: "error",
        });
        return;
      }
      dispatch("deleted", { userId: user.id });
      closeModal();
      dispatch("toast", { message: "Utilisateur supprime avec succes", type: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Echec de la suppression";
      dispatch("toast", { message, type: "error" });
    }
  }
</script>

<button
  on:click={openModal}
  class="btn btn-ghost hover:bg-red-50 hover:text-red-500"
  title="Supprimer"
>
  <X size={18} />
</button>

<dialog bind:this={modal} class="modal">
  <div class="modal-box">
    <div class="mb-6 flex items-center gap-3">
      <div>
        <h3 class="text-lg font-semibold">Supprimer l'utilisateur</h3>
        <p class="text-sm">{user.name}</p>
      </div>
    </div>
    <div class="rounded-lg border border-red-200 bg-red-50 p-4">
      <p class="text-sm text-red-800">
        <strong>Attention :</strong> Cette action est irreversible. Toutes les donnees associees a cet
        utilisateur seront definitivement supprimees.
      </p>
    </div>
    <div class="modal-action">
      <button type="button" class="btn" on:click={closeModal}>Annuler</button>
      <button type="button" class="btn btn-warning" on:click={confirmDelete}
        >Supprimer definitivement</button
      >
    </div>
  </div>
</dialog>
