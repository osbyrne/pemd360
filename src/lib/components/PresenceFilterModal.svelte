<script lang="ts">
	interface Props {
		title: string;
		show: boolean;
		onApply: (selected: number[]) => void;
	}

	let { title, show = $bindable(), onApply }: Props = $props();

	let present = $state(true);
	let absent = $state(true);
	let enCours = $state(true);

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

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="absolute inset-0 bg-black/40"
			role="button"
			tabindex="0"
			aria-label="Fermer le modal"
			onclick={close}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') close();
			}}
		></div>
		<div class="relative z-10 w-80 rounded-lg bg-white p-4 shadow-lg">
			<h3 class="mb-3 text-lg font-semibold">{title}</h3>
			<div class="mb-3 flex flex-col gap-2">
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={present} />
					<span>Présence</span>
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={absent} />
					<span>Absence</span>
				</label>
				<label class="flex items-center gap-2">
					<input type="checkbox" bind:checked={enCours} />
					<span>En cours</span>
				</label>
			</div>
			<div class="flex justify-end gap-2">
				<button class="rounded px-3 py-1 text-sm" onclick={close}>Annuler</button>
				<button class="rounded bg-blue-600 px-3 py-1 text-sm text-white" onclick={apply}
					>Appliquer</button
				>
			</div>
		</div>
	</div>
{/if}
