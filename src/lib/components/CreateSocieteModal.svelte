<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Plus } from 'lucide-svelte';

	const dispatch = createEventDispatcher<{
		toast: { message: string; type: 'success' | 'error' };
	}>();

	let createModal: HTMLDialogElement;
	let loading = false;

	let createForm = {
		nom: '',
		raisonSocial: '',
		rue: '',
		cp: '',
		ville: '',
		tel: '',
		fax: '',
		email: '',
		siren: '',
		type: 0
	};

	function openCreateModal() {
		createForm = {
			nom: '',
			raisonSocial: '',
			rue: '',
			cp: '',
			ville: '',
			tel: '',
			fax: '',
			email: '',
			siren: '',
			type: 0
		};
		createModal?.showModal();
	}

	function closeCreateModal() {
		createModal?.close();
	}
</script>

<button onclick={openCreateModal} class="btn">
	<Plus size={18} />
	Nouvelle société
</button>

<dialog bind:this={createModal} class="modal">
	<div class="modal-box max-w-lg">
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				loading = true;
				return async ({ result }) => {
					loading = false;
					if (result.type === 'success') {
						dispatch('toast', { message: 'Société créée avec succès', type: 'success' });
						closeCreateModal();
						await invalidateAll();
					} else {
						dispatch('toast', { message: 'Erreur lors de la création', type: 'error' });
					}
				};
			}}
		>
			<div class="mb-6 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
					<Plus size={20} class="text-emerald-600" />
				</div>
				<div>
					<h3 class="text-lg font-semibold">Nouvelle société</h3>
					<p class="text-sm">Remplissez les informations ci-dessous</p>
				</div>
			</div>
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="create-nom" class="text-sm font-medium">Nom</label>
						<input
							type="text"
							id="create-nom"
							name="nom"
							bind:value={createForm.nom}
							class="input"
							placeholder="Ex: Dépollution Conseil"
							required
						/>
					</div>
					<div class="space-y-1.5">
						<label for="create-tel" class="text-sm font-medium">Téléphone</label>
						<input
							type="tel"
							id="create-tel"
							name="tel"
							bind:value={createForm.tel}
							class="input"
						/>
					</div>
				</div>
				<div class="space-y-1.5">
					<label for="create-raison" class="text-sm font-medium">Raison sociale</label>
					<input
						type="text"
						id="create-raison"
						name="raisonSocial"
						bind:value={createForm.raisonSocial}
						class="input"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="create-rue" class="text-sm font-medium">Adresse</label>
					<input
						type="text"
						id="create-rue"
						name="rue"
						bind:value={createForm.rue}
						class="input"
						placeholder="Numéro et rue"
					/>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="create-cp" class="text-sm font-medium">Code postal</label>
						<input type="text" id="create-cp" name="cp" bind:value={createForm.cp} class="input" />
					</div>
					<div class="space-y-1.5">
						<label for="create-ville" class="text-sm font-medium">Ville</label>
						<input
							type="text"
							id="create-ville"
							name="ville"
							bind:value={createForm.ville}
							class="input"
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="create-email" class="text-sm font-medium">Email</label>
						<input
							type="email"
							id="create-email"
							name="email"
							bind:value={createForm.email}
							class="input"
						/>
					</div>
					<div class="space-y-1.5">
						<label for="create-fax" class="text-sm font-medium">Fax</label>
						<input
							type="tel"
							id="create-fax"
							name="fax"
							bind:value={createForm.fax}
							class="input"
						/>
					</div>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-1.5">
						<label for="create-siren" class="text-sm font-medium">SIREN</label>
						<input
							type="text"
							id="create-siren"
							name="siren"
							bind:value={createForm.siren}
							class="input"
						/>
					</div>
					<div class="space-y-1.5">
						<label for="create-type" class="text-sm font-medium">Type</label>
						<input
							type="number"
							id="create-type"
							name="type"
							bind:value={createForm.type}
							class="input"
						/>
					</div>
				</div>
			</div>
			<div class="modal-action">
				<button type="button" class="btn" onclick={closeCreateModal}>Annuler</button>
				<button type="submit" disabled={loading} class="btn">
					{loading ? 'Création...' : 'Créer la société'}
				</button>
			</div>
		</form>
	</div>
</dialog>
