<script lang="ts">
  import { enhance } from "$app/forms";
  import { Trash2 } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    itemLabel: string;
    itemId: string | number | null;
    riskType?: string | null;
    onClose: () => void;
    onSuccess?: () => void;
  }

  let { isOpen, itemLabel, itemId, riskType = null, onClose, onSuccess }: Props = $props();

  function handleFormResult() {
    return async ({ result, update }: any) => {
      if (result.type === "success") {
        onClose();
        onSuccess?.();
        await update();
      }
    };
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="modal fixed inset-0"
      role="button"
      tabindex="-1"
      onclick={onClose}
      onkeydown={(e) => e.key === "Escape" && onClose()}
    ></div>
    <div class="relative w-full max-w-md overflow-hidden p-6">
      <div class="flex flex-col items-center text-center">
        <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Trash2 class="h-6 w-6 " />
        </div>
        <h3 class="mb-2 text-lg font-semibold">Confirmer la suppression</h3>
        <p class="mb-6 text-sm">
          Êtes-vous sûr de vouloir supprimer <span class="font-medium">"{itemLabel}"</span> ? Cette action
          est irréversible.
        </p>

        <form
          action="?/delete"
          method="POST"
          use:enhance={handleFormResult}
          class="flex w-full gap-3"
        >
          <input type="hidden" name="id" value={itemId} />
          {#if riskType}
            <input type="hidden" name="riskType" value={riskType} />
          {/if}
          <button type="button" onclick={onClose} class="btn"> Annuler </button>
          <button type="submit" class="btn btn-warning"> Supprimer </button>
        </form>
      </div>
    </div>
  </div>
{/if}
