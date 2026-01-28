<script lang="ts">
	interface Props {
		value: string;
		placeholder?: string;
		onInput?: (value: string) => void;
	}

	let { value = $bindable(), placeholder = 'Rechercher...' }: Props = $props();
</script>

<div class="relative flex-1">
	<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
		<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
			<path
				fill-rule="evenodd"
				d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
				clip-rule="evenodd"
			/>
		</svg>
	</div>
	<input
		type="text"
		bind:value
		{placeholder}
		class="block w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
	/>
</div>
