<script lang="ts">
	interface Props {
		show: boolean;
		groups: { id: number | null; name: string | null }[];
		categoriesV2: App.CategoriesV2[];
		allPemdObjects: { id: number | null; name: string | null; categorieId: number | null }[];
		hasTags: boolean;
		onApply: (allowedIds: number[]) => void;
		onRemove: () => void;
	}

	let {
		show = $bindable(),
		groups,
		categoriesV2,
		allPemdObjects,
		hasTags,
		onApply,
		onRemove
	}: Props = $props();

	let selectedGroup = $state('');
	let selectedCategory = $state('');
	let selectedObject = $state('');
	let categoriesFiltered: App.CategoriesV2[] = $state([]);
	let objectsFiltered = $state(
		[] as { id: number | null; name: string | null; categorieId: number | null }[]
	);

	function handleGroupChange() {
		if (selectedGroup && selectedGroup.trim() !== '') {
			const group = groups.find((g) => g.name === selectedGroup || String(g.id) === selectedGroup);
			if (group) {
				categoriesFiltered = categoriesV2.filter((c) => c.groupeId === group.id);
			} else {
				categoriesFiltered = [];
			}
			selectedCategory = '';
			selectedObject = '';
		} else {
			categoriesFiltered = categoriesV2;
			objectsFiltered = allPemdObjects;
			selectedCategory = '';
			selectedObject = '';
		}
	}

	function handleCategoryChange() {
		if (selectedCategory && selectedCategory.trim() !== '') {
			const cat = categoriesV2.find(
				(c) => c.name === selectedCategory || String(c.id) === selectedCategory
			);
			if (cat) {
				objectsFiltered = allPemdObjects.filter((o) => o.categorieId === cat.id);
			} else {
				objectsFiltered = [];
			}
			selectedObject = '';
		} else {
			objectsFiltered = allPemdObjects;
			selectedObject = '';
		}
	}

	function getAllowedObjetIds(): number[] {
		const allowed = new Set<number>();

		if (selectedObject.trim() !== '') {
			for (const o of allPemdObjects) {
				if (o.name === selectedObject && o.id != null) allowed.add(o.id);
			}
			return Array.from(allowed);
		}

		if (selectedCategory.trim() !== '') {
			const cat = categoriesV2.find(
				(c) => c.id === Number(selectedCategory) || c.name === selectedCategory
			);
			if (cat) {
				for (const o of allPemdObjects) {
					if (o.categorieId === cat.id && o.id != null) allowed.add(o.id);
				}
			}
			return Array.from(allowed);
		}

		if (selectedGroup.trim() !== '') {
			const group = groups.find((g) => g.name === selectedGroup || String(g.id) === selectedGroup);
			if (group) {
				const allowedCatIds = categoriesV2.filter((c) => c.groupeId === group.id).map((c) => c.id);
				for (const o of allPemdObjects) {
					if (o.categorieId != null && allowedCatIds.includes(o.categorieId) && o.id != null) {
						allowed.add(o.id);
					}
				}
			}
			return Array.from(allowed);
		}

		// No filter — return all object IDs
		for (const o of allPemdObjects) {
			if (o.id != null) allowed.add(o.id);
		}
		return Array.from(allowed);
	}
</script>

{#if show}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div
			class="absolute inset-0 bg-black/40"
			role="button"
			tabindex="0"
			aria-label="Fermer le modal"
			onclick={() => {
				show = false;
			}}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') show = false;
			}}
		></div>
		<div class="relative z-10 w-96 rounded-lg p-4 shadow-lg">
			<h3 class="mb-3 text-lg font-semibold">Filtrer PEMD</h3>
			<div class="mb-3 flex flex-col gap-2">
				<label class="flex flex-col">
					<span class="text-sm ">Groupe</span>
					<select bind:value={selectedGroup} onchange={handleGroupChange} class="select">
						<option value="">Tous groupes</option>
						{#each groups as group (group.id)}
							<option value={group.name}>{group.name}</option>
						{/each}
					</select>
				</label>
				<label class="flex flex-col">
					<span class="text-sm ">Catégorie</span>
					<select bind:value={selectedCategory} onchange={handleCategoryChange} class="select">
						<option value="">Toutes catégories</option>
						{#each categoriesFiltered as category (category.id)}
							<option value={category.name}>{category.name}</option>
						{/each}
					</select>
				</label>
				<label class="flex flex-col">
					<span class="text-sm ">Objet</span>
					<select bind:value={selectedObject} class="select">
						<option value="">Tous objets</option>
						{#each objectsFiltered as object (object.id)}
							<option value={object.name}>{object.name}</option>
						{/each}
					</select>
				</label>
			</div>
			<button
				class="btn"
				onclick={() => {
					show = false;
				}}>Fermer</button
			>
			<button class="btn btn-warning" onclick={onRemove} disabled={!hasTags}
				>Supprimer les tags PEMD</button
			>
			<button class="btn" onclick={() => onApply(getAllowedObjetIds())}
				>Ajouter dans le modèle</button
			>
		</div>
	</div>
{/if}
