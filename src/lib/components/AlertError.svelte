<script lang="ts">
	import { CircleAlert } from 'lucide-svelte';

	interface Props {
		message: string;
		class?: string;
	}

	let { message, class: className = '' }: Props = $props();
</script>

<div
	class="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-800 {className}"
	role="alert"
>
	<CircleAlert class="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
	<span class="text-sm">{message}</span>
</div>
