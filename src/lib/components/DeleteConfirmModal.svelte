<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, scale } from 'svelte/transition';
	import { Trash2 } from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		itemLabel: string;
		itemId: string | number | null;
		onClose: () => void;
		onSuccess?: () => void;
	}

	let { isOpen, itemLabel, itemId, onClose, onSuccess }: Props = $props();

	function handleFormResult() {
		return async ({ result, update }: any) => {
			if (result.type === 'success') {
				onClose();
				onSuccess?.();
				await update();
			}
		};
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
			transition:fade
			role="button"
			tabindex="-1"
			onclick={onClose}
			onkeydown={(e) => e.key === 'Escape' && onClose()}
		></div>
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
					Êtes-vous sûr de vouloir supprimer <span class="font-medium text-gray-900"
						>"{itemLabel}"</span
					> ? Cette action est irréversible.
				</p>

				<form
					action="?/delete"
					method="POST"
					use:enhance={handleFormResult}
					class="w-full flex gap-3"
				>
					<input type="hidden" name="id" value={itemId} />
					<button type="button" onclick={onClose} class="btn"> Annuler </button>
					<button type="submit" class="btn btn-warning"> Supprimer </button>
				</form>
			</div>
		</div>
	</div>
{/if}
