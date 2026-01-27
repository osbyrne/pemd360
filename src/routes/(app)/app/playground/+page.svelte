<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="container mx-auto p-8">
	<h1 class="text-3xl font-bold mb-6">Test Image S3</h1>

	{#if data.imageUrl}
		<div class="card bg-base-100 shadow-xl max-w-2xl">
			<figure class="px-4 pt-4">
				<img src={data.imageUrl} alt="Test" class="rounded-xl w-full" />
			</figure>
			<div class="card-body">
				<h2 class="card-title">Image chargée avec succès</h2>
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
