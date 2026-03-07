<script lang="ts">
	import { enhance } from '$app/forms';
	import { Plus, X, Save, MapPin } from 'lucide-svelte';

	interface Props {
		show: boolean;
		pendingPosition: {
			anchorPosition: { x: number; y: number; z: number };
			normal: { x: number; y: number; z: number };
		} | null;
		groups: { id: number | null; name: string | null }[];
		categoriesV2: App.CategoriesV2[];
		allPemdObjects: { id: number | null; name: string | null; categorieId: number | null }[];
		onClose: () => void;
	}

	let { show, pendingPosition, groups, categoriesV2, allPemdObjects, onClose }: Props = $props();

	// Form field state — reset each time the modal opens
	let objetId = $state('');
	let description = $state('');
	let quantite = $state('');
	let etage = $state('');
	let etat = $state('');
	let longueur = $state('');
	let largeur = $state('');
	let epaisseur = $state('');
	let potentielReemploi = $state('');

	// Cascade selection state
	let groupId: string | number = $state('');
	let categoryId: string | number = $state('');
	let categoriesFiltered: App.CategoriesV2[] = $state([]);
	let objectsFiltered = $state(
		[] as { id: number | null; name: string | null; categorieId: number | null }[]
	);

	let isSaving = $state(false);

	// Reset all fields when the modal opens
	$effect(() => {
		if (show) {
			objetId = '';
			description = '';
			quantite = '';
			etage = '';
			etat = '';
			longueur = '';
			largeur = '';
			epaisseur = '';
			potentielReemploi = '';
			groupId = '';
			categoryId = '';
			categoriesFiltered = [];
			objectsFiltered = [];
		}
	});

	function handleGroupChange() {
		if (groupId !== '' && groupId !== null && groupId !== undefined) {
			const gId = typeof groupId === 'string' ? Number(groupId) : groupId;
			const group = groups.find((g) => g.id === gId);
			if (group) {
				categoriesFiltered = categoriesV2.filter((c) => c.groupeId === group.id);
			} else {
				categoriesFiltered = [];
			}
			categoryId = '';
			objetId = '';
			objectsFiltered = [];
		} else {
			categoriesFiltered = [];
			objectsFiltered = [];
			categoryId = '';
			objetId = '';
		}
	}

	function handleCategoryChange() {
		if (categoryId !== '' && categoryId !== null && categoryId !== undefined) {
			const cId = typeof categoryId === 'string' ? Number(categoryId) : categoryId;
			const cat = categoriesV2.find((c) => c.id === cId);
			if (cat) {
				objectsFiltered = allPemdObjects.filter((o) => o.categorieId === cat.id);
			} else {
				objectsFiltered = [];
			}
			objetId = '';
		} else {
			objectsFiltered = [];
			objetId = '';
		}
	}
</script>

{#if show && pendingPosition}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="absolute inset-0 bg-black/40"
			role="button"
			tabindex="0"
			aria-label="Fermer le modal"
			onclick={onClose}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') onClose();
			}}
		></div>
		<div class="relative z-10 w-125 max-h-[90vh] overflow-y-auto rounded-lg p-6 shadow-lg">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold flex items-center gap-2">
					<Plus size={20} />
					Nouveau tag PEMD
				</h3>
				<button type="button" onclick={onClose} class=" hover:">
					<X size={24} />
				</button>
			</div>

			<form
				method="POST"
				action="?/createPemdTag"
				use:enhance={() => {
					isSaving = true;
					return async ({ result, update }) => {
						isSaving = false;
						await update();
					};
				}}
			>
				<!-- Hidden fields for position -->
				<input
					type="hidden"
					name="anchorPosition"
					value={JSON.stringify(pendingPosition.anchorPosition)}
				/>
				<input type="hidden" name="stemVector" value={JSON.stringify(pendingPosition.normal)} />

				<!-- Legend for required fields -->
				<p class="text-xs mb-4">
					Les champs marqués d'un <span class="text-red-500 font-medium">*</span> sont obligatoires
				</p>

				<div class="space-y-4">
					<!-- Section: Identification du matériau -->
					<div class="border-b border-gray-200 pb-4">
						<h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
							<span class="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
							Identification du matériau <span class="text-red-500">*</span>
						</h4>

						<!-- Étape 1: Groupe -->
						<div class="mb-3">
							<label for="pemd-groupe" class="block text-sm font-medium mb-1">
								<span
									class="inline-flex items-center justify-center w-5 h-5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold mr-1"
									>1</span
								>
								Groupe
							</label>
							<select
								id="pemd-groupe"
								bind:value={groupId}
								onchange={handleGroupChange}
								class="select"
							>
								<option value="">-- Sélectionner un groupe --</option>
								{#each groups as group (group.id)}
									<option value={group.id}>{group.name}</option>
								{/each}
							</select>
							{#if !groupId}
								<p class="text-xs text-purple-600 mt-1">Commencez par sélectionner un groupe</p>
							{/if}
						</div>

						<!-- Étape 2: Catégorie -->
						<div class="mb-3">
							<label for="pemd-categorie" class="block text-sm font-medium mb-1">
								<span
									class="inline-flex items-center justify-center w-5 h-5 {groupId
										? 'bg-purple-100 text-purple-700'
										: ' '} rounded-full text-xs font-bold mr-1">2</span
								>
								Catégorie
							</label>
							<select
								id="pemd-categorie"
								bind:value={categoryId}
								onchange={handleCategoryChange}
								disabled={!groupId || categoriesFiltered.length === 0}
								class="select {groupId && !categoryId ? 'border-purple-300' : 'border-gray-300'}"
							>
								<option value="">-- Sélectionner une catégorie --</option>
								{#each categoriesFiltered as categorie (categorie.id)}
									<option value={categorie.id}>{categorie.name}</option>
								{/each}
							</select>
							{#if !groupId}
								<p class="text-xs mt-1">Sélectionnez d'abord un groupe</p>
							{:else if categoriesFiltered.length === 0}
								<p class="text-xs text-amber-600 mt-1">
									Aucune catégorie disponible pour ce groupe
								</p>
							{:else if !categoryId}
								<p class="text-xs text-purple-600 mt-1">
									Sélectionnez une catégorie ({categoriesFiltered.length} disponible{categoriesFiltered.length >
									1
										? 's'
										: ''})
								</p>
							{/if}
						</div>

						<!-- Étape 3: Objet (OBLIGATOIRE) -->
						<div>
							<label for="pemd-objet" class="block text-sm font-medium mb-1">
								<span
									class="inline-flex items-center justify-center w-5 h-5 {categoryId
										? 'bg-purple-100 text-purple-700'
										: ''} rounded-full text-xs font-bold mr-1">3</span
								>
								Objet <span class="text-red-500">*</span>
							</label>
							<select
								id="pemd-objet"
								bind:value={objetId}
								name="objetId"
								required
								disabled={!categoryId || objectsFiltered.length === 0}
								class="btn {categoryId && !objetId ? 'border-red-300' : 'border-gray-300'}"
							>
								<option value="">-- Sélectionner un objet --</option>
								{#each objectsFiltered as object (object.id)}
									<option value={object.id}>{object.name}</option>
								{/each}
							</select>
							{#if !categoryId}
								<p class="text-xs mt-1">Sélectionnez d'abord une catégorie</p>
							{:else if objectsFiltered.length === 0}
								<p class="text-xs text-amber-600 mt-1">
									Aucun objet disponible pour cette catégorie
								</p>
							{:else if !objetId}
								<p class="text-xs text-red-500 mt-1">
									Sélectionnez un objet ({objectsFiltered.length} disponible{objectsFiltered.length >
									1
										? 's'
										: ''})
								</p>
							{:else}
								<p class="text-xs text-green-600 mt-1">Objet sélectionné</p>
							{/if}
						</div>
					</div>

					<!-- Section: Informations complémentaires (optionnel) -->
					<div class="border-b border-gray-200 pb-4">
						<h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
							<span class="w-1.5 h-1.5 rounded-full"></span>
							Informations complémentaires
							<span class=" text-xs font-normal">(optionnel)</span>
						</h4>

						<!-- Description -->
						<div class="mb-3">
							<label for="pemd-description" class="block text-sm font-medium mb-1"
								>Description</label
							>
							<textarea
								id="pemd-description"
								bind:value={description}
								name="description"
								rows="2"
								class="input"
								placeholder="Description du matériau..."
							></textarea>
						</div>

						<!-- Row: Quantité, Étage, État -->
						<div class="grid grid-cols-3 gap-3">
							<div>
								<label for="pemd-quantite" class="block text-sm font-medium mb-1">Quantité</label>
								<input
									id="pemd-quantite"
									type="number"
									step="0.01"
									min="0"
									bind:value={quantite}
									name="quantite"
									class="input"
									placeholder="0"
								/>
							</div>
							<div>
								<label for="pemd-etage" class="block text-sm font-medium mb-1">Étage</label>
								<input
									id="pemd-etage"
									type="text"
									bind:value={etage}
									name="etage"
									class="input"
									placeholder="RDC, 1, 2..."
								/>
							</div>
							<div>
								<label for="pemd-etat" class="block text-sm font-medium mb-1">État</label>
								<select id="pemd-etat" bind:value={etat} name="etat" class="selection:">
									<option value="">--</option>
									<option value="Bon">Bon</option>
									<option value="Moyen">Moyen</option>
									<option value="Mauvais">Mauvais</option>
								</select>
							</div>
						</div>
					</div>

					<!-- Section: Dimensions (optionnel) -->
					<div class="border-b border-gray-200 pb-4">
						<h4 class="text-sm font-semibold mb-3 flex items-center gap-2">
							<span class="w-1.5 h-1.5 rounded-full"></span>
							Dimensions <span class=" text-xs font-normal">(optionnel)</span>
						</h4>

						<div class="grid grid-cols-3 gap-3">
							<div>
								<label for="pemd-longueur" class="block text-sm font-medium mb-1"
									>Longueur (m)</label
								>
								<input
									id="pemd-longueur"
									type="number"
									step="0.01"
									min="0"
									bind:value={longueur}
									name="longueur"
									class="input"
									placeholder="0.00"
								/>
							</div>
							<div>
								<label for="pemd-largeur" class="block text-sm font-medium mb-1">Largeur (m)</label>
								<input
									id="pemd-largeur"
									type="number"
									step="0.01"
									min="0"
									bind:value={largeur}
									name="largeur"
									class="input"
									placeholder="0.00"
								/>
							</div>
							<div>
								<label for="pemd-epaisseur" class="block text-sm font-medium mb-1"
									>Épaisseur (m)</label
								>
								<input
									id="pemd-epaisseur"
									type="number"
									step="0.01"
									min="0"
									bind:value={epaisseur}
									name="epaisseur"
									class="input"
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>

					<!-- Section: Potentiel Réemploi (optionnel) -->
					<div>
						<label for="pemd-potentiel" class="block text-sm font-medium mb-1">
							Potentiel de réemploi <span class=" text-xs font-normal">(optionnel)</span>
						</label>
						<select
							id="pemd-potentiel"
							bind:value={potentielReemploi}
							name="potentielReemploi"
							class="select"
						>
							<option value="">-- Non défini --</option>
							<option value="Fort">Fort</option>
							<option value="Moyen">Moyen</option>
							<option value="Faible">Faible</option>
							<option value="Nul">Nul</option>
						</select>
					</div>

					<!-- Position info (readonly) -->
					<div class="bg-purple-50 rounded-lg p-3 text-sm text-purple-700 border border-purple-200">
						<p class="font-medium mb-1 flex items-center gap-2">
							<MapPin class="w-4 h-4" />
							Position sur le modèle 3D
						</p>
						<p class="text-xs font-mono">
							X: {pendingPosition.anchorPosition.x.toFixed(3)} | Y: {pendingPosition.anchorPosition.y.toFixed(
								3
							)} | Z: {pendingPosition.anchorPosition.z.toFixed(3)}
						</p>
					</div>
				</div>

				<div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
					<button type="button" onclick={onClose} class="btn"> Annuler </button>
					<button type="submit" disabled={isSaving || !objetId} class="btn btn-primary">
						<Save size={16} />
						{isSaving ? 'Enregistrement...' : 'Enregistrer le tag'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
