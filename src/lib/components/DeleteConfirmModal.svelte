<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
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

  const styles = stylex.create({
    div: {
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
    div2: {
      position: "fixed",
      inset: 0,
    },
    div3: {
      position: "relative",
      width: "100%",
      maxWidth: "28rem",
      overflow: "hidden",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    div4: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    div5: {
      marginBottom: "1rem",
      display: "flex",
      height: "3rem",
      width: "3rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.6% 0.032 17.717)",
    },
    Trash2: {
      height: "1.5rem",
      width: "1.5rem",
    },
    h3: {
      marginBottom: "0.5rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p: {
      marginBottom: "1.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    span: {
      fontWeight: 500,
    },
    form: {
      display: "flex",
      width: "100%",
      gap: "0.75rem",
    },
  });
</script>

{#if isOpen}
  <div class={stylex.attrs(styles.div).class} role="dialog" aria-modal="true">
    <div
      class={stylex.attrs(ui.overlay, styles.div2).class}
      role="button"
      tabindex="-1"
      onclick={onClose}
      onkeydown={(e) => e.key === "Escape" && onClose()}
    ></div>
    <div class={stylex.attrs(ui.dialogPanel, styles.div3).class}>
      <div class={stylex.attrs(styles.div4).class}>
        <div class={stylex.attrs(styles.div5).class}>
          <Trash2 class={stylex.attrs(styles.Trash2).class} />
        </div>
        <h3 class={stylex.attrs(styles.h3).class}>Confirmer la suppression</h3>
        <p class={stylex.attrs(styles.p).class}>
          Êtes-vous sûr de vouloir supprimer <span class={stylex.attrs(styles.span).class}
            >"{itemLabel}"</span
          > ? Cette action est irréversible.
        </p>

        <form
          action="?/delete"
          method="POST"
          use:enhance={handleFormResult}
          class={stylex.attrs(styles.form).class}
        >
          <input type="hidden" name="id" value={itemId} />
          {#if riskType}
            <input type="hidden" name="riskType" value={riskType} />
          {/if}
          <button type="button" onclick={onClose} class={stylex.attrs(ui.button).class}>
            Annuler
          </button>
          <button type="submit" class={stylex.attrs(ui.button, ui.buttonWarning).class}>
            Supprimer
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}
