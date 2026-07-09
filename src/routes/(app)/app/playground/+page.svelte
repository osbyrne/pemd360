<script lang="ts">
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<div class="container mx-auto p-8">
  <h1 class="mb-6 text-3xl font-bold">Test Image S3</h1>

  {#if data.imageUrl}
    <div class="card max-w-2xl bg-base-100 shadow-xl">
      <figure class="px-4 pt-4">
        <img src={data.imageUrl} alt="Test" class="w-full rounded-xl" />
      </figure>
      <div class="card-body">
        <h2 class="card-title">Image chargée avec succès</h2>
        {#if data.imageKey}
          <p class="text-sm break-all">Objet: {data.imageKey}</p>
        {/if}
        <p class="text-sm break-all">{data.imageUrl}</p>
      </div>
    </div>
  {:else if data.error}
    <div class="alert alert-error">
      <span>Erreur: {data.error}</span>
    </div>
  {:else}
    <div class="alert alert-warning">
      <span>Aucune image disponible</span>
    </div>
  {/if}
</div>
