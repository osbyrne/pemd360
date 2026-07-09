<script lang="ts">
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
</script>

<dialog bind:this={dialog} class="modal" onclose={() => (show = false)}>
  <div class="modal-box">
    <h3 class="mb-3 text-lg font-semibold">{title}</h3>
    <div class="mb-3 flex flex-col gap-2">
      <label>
        <input type="checkbox" bind:checked={present} class="checkbox" />
        <span>Présence</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={absent} class="checkbox" />
        <span>Absence</span>
      </label>
      <label>
        <input type="checkbox" bind:checked={enCours} class="checkbox" />
        <span>En cours</span>
      </label>
    </div>
    <div class="modal-action">
      <button class="btn" onclick={close}>Annuler</button>
      <button class="btn" onclick={apply}>Appliquer</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={close}>close</button>
  </form>
</dialog>
