<script lang="ts">
	import { page } from '$app/stores';
	import { Home, AlertTriangle } from 'lucide-svelte';

	// SvelteKit automatically passes 'status' and 'message' in the 'page' store for error pages
	// or as props if using $props within the error boundary, but globally page store is reliable.
</script>

<svelte:head>
	<title>{$page.status} - Erreur</title>
</svelte:head>

<div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
		<div class="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
			<AlertTriangle class="h-12 w-12 text-red-600" />
		</div>

		<h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
			{$page.status}
		</h1>

		<h2 class="text-xl font-medium mb-8">
			{$page.error?.message || "Une erreur inattendue s'est produite."}
		</h2>

		<div class="flex justify-center gap-4">
			<a href="/" class="btn btn-primary flex items-center gap-2">
				<Home class="w-4 h-4" />
				Retour à l'accueil
			</a>
			<button onclick={() => history.back()} class="btn btn-outline"> Page précédente </button>
		</div>
	</div>

	<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
		<div class="py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
			<p class="text-sm">Si le problème persiste, veuillez contacter le support.</p>
		</div>
	</div>
</div>
