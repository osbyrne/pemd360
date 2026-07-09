<script lang="ts">
  import { page } from "$app/stores";
  import { Home, AlertTriangle } from "lucide-svelte";

  // SvelteKit automatically passes 'status' and 'message' in the 'page' store for error pages
  // or as props if using $props within the error boundary, but globally page store is reliable.
</script>

<svelte:head>
  <title>{$page.status} - Erreur</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="text-center sm:mx-auto sm:w-full sm:max-w-md">
    <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
      <AlertTriangle class="h-12 w-12 text-red-600" />
    </div>

    <h1 class="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
      {$page.status}
    </h1>

    <h2 class="mb-8 text-xl font-medium">
      {$page.error?.message || "Une erreur inattendue s'est produite."}
    </h2>

    <div class="flex justify-center gap-4">
      <a href="/" class="btn flex items-center gap-2 btn-primary">
        <Home class="h-4 w-4" />
        Retour à l'accueil
      </a>
      <button onclick={() => history.back()} class="btn btn-outline"> Page précédente </button>
    </div>
  </div>

  <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div class="px-4 py-8 text-center shadow sm:rounded-lg sm:px-10">
      <p class="text-sm">Si le problème persiste, veuillez contacter le support.</p>
    </div>
  </div>
</div>
