<script lang="ts">
	import CerfaTabs from '$lib/components/CerfaTabs.svelte';
	import { Box } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>CERFA · Caractérisation PEM</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<CerfaTabs />

	<div class="mb-8">
		<h1 class="text-2xl font-bold">Caractérisation PEM</h1>
		<p class="text-sm mt-1">
			Inventaire des Produits, Équipements et Matériaux (Réemploi/Réutilisation).
		</p>
	</div>

	<div class="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class=" text-xs uppercase font-semibold border-b border-gray-200">
					<tr>
						<th class="px-6 py-4">Famille (Macro)</th>
						<th class="px-6 py-4">Matériau (Catégorie)</th>
						<th class="px-6 py-4">Nature (Objet)</th>
						<th class="px-6 py-4">Quantité / Unité</th>
						<th class="px-6 py-4">Destination</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#each data.items as item}
						<tr class="hover: transition-colors">
							<td class="px-6 py-4 font-medium">{item.groupe}</td>
							<td class="px-6 py-4">{item.categorie}</td>
							<td class="px-6 py-4 flex items-center gap-2">
								<Box class="w-4 h-4 text-amber-600" />
								{item.objet}
							</td>
							<td class="px-6 py-4">
								{item.masseUnitaire || '?'}
								{item.unite || ''}
							</td>
							<td class="px-6 py-4">
								<span
									class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
								>
									{item.etat || 'Réemploi'}
								</span>
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="5" class="px-6 py-12 text-center">
								Aucun élément caractérisé PEM (Réemploi) trouvé.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
