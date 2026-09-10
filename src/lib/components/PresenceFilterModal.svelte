<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  interface Props {
    title: string;
    show: boolean;
    onApply: (selected: number[]) => void;
  }

  let { title, show = $bindable(), onApply }: Props = $props();

  let dialog: HTMLDialogElement;

  let present = $state(true);
  let absent = $state(true);
  let enCours = $state(true);

  $effect(() => {
    if (!dialog) return;
    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  });

  function close() {
    show = false;
  }

  function apply() {
    const selected: number[] = [];
    if (present) selected.push(1);
    if (absent) selected.push(0);
    if (enCours) selected.push(2);
    show = false;
    onApply(selected);
  }

  const styles = stylex.create({
    h3: {
      marginBottom: "0.75rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div: {
      marginBottom: "0.75rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
  });
</script>

<dialog bind:this={dialog} class={stylex.attrs(ui.dialog).class} onclose={() => (show = false)}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <h3 class={stylex.attrs(styles.h3).class}>{title}</h3>
    <div class={stylex.attrs(styles.div).class}>
      <label>
        <input type="checkbox" bind:checked={present} class={stylex.attrs(ui.checkbox).class} />
        <span>Présence</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={absent} class={stylex.attrs(ui.checkbox).class} />
        <span>Absence</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={enCours} class={stylex.attrs(ui.checkbox).class} />
        <span>En cours</span>
      </label>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button class={stylex.attrs(ui.button).class} onclick={close}>Annuler</button>
      <button class={stylex.attrs(ui.button).class} onclick={apply}>Appliquer</button>
    </div>
  </div>
  <form method="dialog" class={stylex.attrs(ui.dialogBackdrop).class}>
    <button onclick={close}>close</button>
  </form>
</dialog>
