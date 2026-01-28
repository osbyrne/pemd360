<script lang="ts">
	import { Eye, EyeOff } from 'lucide-svelte';

	interface Props {
		id: string;
		name: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		minlength?: number;
		disabled?: boolean;
		autocomplete?: 'current-password' | 'new-password' | 'off';
		class?: string;
	}

	let {
		id,
		name,
		value = $bindable(''),
		placeholder = 'Mot de passe',
		required = false,
		minlength,
		disabled = false,
		autocomplete = 'current-password',
		class: className = ''
	}: Props = $props();

	let showPassword = $state(false);
</script>

<div class="relative">
	<input
		{id}
		{name}
		type={showPassword ? 'text' : 'password'}
		{placeholder}
		{required}
		{minlength}
		{disabled}
		{autocomplete}
		bind:value
		class="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none {className}"
	/>
	<button
		type="button"
		class="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
		onclick={() => (showPassword = !showPassword)}
		tabindex={-1}
		aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
	>
		{#if showPassword}
			<EyeOff class="h-5 w-5" />
		{:else}
			<Eye class="h-5 w-5" />
		{/if}
	</button>
</div>
