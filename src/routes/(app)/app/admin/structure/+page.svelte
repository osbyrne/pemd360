<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { Trash2 } from 'lucide-svelte';
	import RiskTabs from '$lib/components/RiskTabs.svelte';

	let { data } = $props();

	let isDeleteModalOpen = $state(false);
	let currentItem = $state<any>(null);

	function openDeleteModal(item: any) {
		currentItem = item;
		isDeleteModalOpen = true;
	}

	function closeModal() {
		isDeleteModalOpen = false;
		currentItem = null;
	}

	function handleFormResult() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				closeModal();
				await update();
			}
		};
	}
</script>

<svelte:head>
	<title>Admin · Structure</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<RiskTabs />
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Inventaire Structure</h1>
			<p class="text-sm text-gray-500 mt-1">Liste des tags structure détectés.</p>
		</div>
	</div>

	<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm text-gray-600">
				<thead class="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
					<tr>
						<th class="px-6 py-4">Label</th>
						<th class="px-6 py-4">Projet</th>
						<th class="px-6 py-4">S. Screen</th>
                        <th class="px-6 py-4">S. Shape</th>
						<th class="px-6 py-4 text-center w-32">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100">
					{#if data.list.length === 0}
						<tr>
							<td colspan="5" class="px-6 py-12 text-center text-gray-400">
								Aucun tag structure enregistré.
							</td>
						</tr>
					{:else}
						{#each data.list as item}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="px-6 py-4 font-medium text-gray-900">
                                    {item.label}
                                    <div class="text-xs text-gray-400 font-normal">{item.description || ''}</div>
                                </td>
								<td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {item.projetNom || 'Projet inconnu'}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-gray-600">{item.screenSurface || '-'}</td>
                                <td class="px-6 py-4 text-gray-600">{item.shapeSurface || '-'}</td>
								<td class="px-6 py-4">
									<div class="flex items-center justify-center gap-2">
										<button
											onclick={() => openDeleteModal(item)}
											class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
											title="Supprimer"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>

{#if isDeleteModalOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
		<div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" transition:fade onclick={closeModal}></div>
		<div
			class="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden p-6"
			transition:scale={{ start: 0.95 }}
		>
			<div class="flex flex-col items-center text-center">
				<div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
					<Trash2 class="w-6 h-6 text-red-600" />
				</div>
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Confirmer la suppression</h3>
				<p class="text-sm text-gray-500 mb-6">
					Êtes-vous sûr de vouloir supprimer ce tag <span class="font-medium text-gray-900">"{currentItem?.label}"</span> ?
					Cette action est irréversible.
				</p>
				
				<form action="?/delete" method="POST" use:enhance={handleFormResult} class="w-full flex gap-3">
					<input type="hidden" name="id" value={currentItem?.id} />
					<button
						type="button"
						onclick={closeModal}
						class="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
					>
						Annuler
					</button>
					<button
						type="submit"
						class="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
					>
						Supprimer
					</button>
				</form>
			</div>
		</div>
	</div>
{/if}
