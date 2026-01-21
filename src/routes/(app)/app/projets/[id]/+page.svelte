<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { MpSdk } from '@matterport/sdk';
	import tagAmianteImg from '$lib/assets/img/tagamiante.gif';
	import tagPlombImg from '$lib/assets/img/tagplomb.gif';
	import tagTermiteImg from '$lib/assets/img/tagtermite.gif';
	import tagStructureImg from '$lib/assets/img/tagstructure.gif';
	import tagPemdImg from '$lib/assets/img/pemd360.png';
	import { Mail } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement;
	let mpSdk: MpSdk | undefined = $state();

	let showMail = $state(false);
	let showAmiante = $state(false);
	let showPlomb = $state(false);
	let showTermite = $state(false);
	let showStructure = $state(false);
	let showPemd = $state(false);

	// modal states and selected presence filters (defaults: both checked)
	let showAmianteModal = $state(false);
	let showPlombModal = $state(false);
	let showTermiteModal = $state(false);
	// Modal pour PEMD
	let showPemdModal = $state(false);

	let amiantePresenceSelected: number[] = [0, 1, 2];
	let plombPresenceSelected: number[] = [0, 1, 2];
	let termitePresenceSelected: number[] = [0, 1, 2];

	// PEMD filter / autocomplete state
	let pemdGroups = $state([] as { id: number | null; name: string | null }[]); // used for project-specific facets as before
	let pemdCategories = $state(
		[] as { id: number | null; name: string | null; groupeId: number | null }[]
	);
	let pemdObjects = $state(
		[] as { id: number | null; name: string | null; categorieId: number | null }[]
	);
	// Master list of objects (complete set) coming from server
	let allPemdObjects = $state(
		[] as { id: number | null; name: string | null; categorieId: number | null }[]
	);
	// Master lists coming from server (categorie_v2 and groupe)
	let allPemdGroups = $state([] as { id: number | null; name: string | null }[]);
	let categoriesV2 = $state(
		[] as { id: number | null; name: string | null; groupeId: number | null }[]
	);
	let selectedPemdGroup = $state('');
	let selectedPemdCategory = $state('');
	let selectedPemdObject = $state('');
	// Filtered lists (depend on selection)
	let pemdCategoriesFiltered = $state(
		[] as { id: number | null; name: string | null; groupeId: number | null }[]
	);
	let pemdObjectsFiltered = $state(
		[] as { id: number | null; name: string | null; categorieId: number | null }[]
	);

	// helper booleans for modal checkboxes
	let amiantePresent = $state(true);
	let amianteAbsent = $state(true);
	let amianteEnCours = $state(true);
	let plombPresent = $state(true);
	let plombAbsent = $state(true);
	let plombEnCours = $state(true);
	let termitePresent = $state(true);
	let termiteAbsent = $state(true);
	let termiteEnCours = $state(true);

	let mailSids: string[] = [];
	let amianteSids: string[] = [];
	let plombSids: string[] = [];
	let termiteSids: string[] = [];
	let structureSids: string[] = [];
	let pemdSids = $state([] as string[]);

	async function toggleMail() {
		if (!mpSdk) return;
		if (showMail) {
			if (data.tags && data.tags.length > 0) {
				console.log(`Adding ${data.tags.length} tags to the model`);
				for (const tag of data.tags) {
					try {
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);
						const tagDate = tag.date ? new Date(tag.date).toLocaleDateString() : '';
						const tagDescriptor = {
							label: `Mail - ${tagDate}`,
							description: tag.content,
							anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
							stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z }
						};
						const [sid] = await mpSdk.Tag.add(tagDescriptor);
						mailSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of mailSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			mailSids = [];
		}
	}

	async function toggleAmiante() {
		if (!mpSdk) return;
		if (showAmiante) {
			// Remove any previously added amiante tags so we don't duplicate or keep stale tags
			for (const sid of amianteSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error('Failed to remove previous amiante sid', sid, e);
				}
			}
			amianteSids = [];
			if (data.amianteTags && data.amianteTags.length > 0) {
				const filtered = data.amianteTags.filter((t: any) =>
					amiantePresenceSelected.includes(Number(t.presenceAmiante))
				);
				console.log(`Adding ${filtered.length} amiante tags`);
				for (const tag of filtered) {
					try {
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);
						const amianteStatus = tag.presenceAmiante ? 'Présence' : 'Absence';
						const tagDescriptor = {
							label: `Amiante - ${amianteStatus}`,
							description: `${tag.description}\nType: ${tag.type}\nÉtage: ${tag.etage}`,
							anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
							stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
							color: tag.presenceAmiante ? { r: 1, g: 0, b: 0 } : { r: 0, g: 1, b: 0 }
						};
						const [sid] = await mpSdk.Tag.add(tagDescriptor);
						amianteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add amiante tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of amianteSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			amianteSids = [];
		}
	}

	async function togglePlomb() {
		if (!mpSdk) return;
		if (showPlomb) {
			// remove previous plomb tags to avoid duplicates / stale display
			for (const sid of plombSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error('Failed to remove previous plomb sid', sid, e);
				}
			}
			plombSids = [];
			if (data.plombTags && data.plombTags.length > 0) {
				const filtered = data.plombTags.filter((t: any) =>
					plombPresenceSelected.includes(Number(t.presencePlomb))
				);
				console.log(`Adding ${filtered.length} plomb tags`);
				for (const tag of filtered) {
					try {
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);
						const plombStatus = tag.presencePlomb ? 'Présence' : 'Absence';
						let description = tag.description;
						if (tag.presencePlomb && tag.concentration) {
							description += `\nConcentration: ${tag.concentration}`;
						}
						description += `\nÉtage: ${tag.etage}`;
						const tagDescriptor = {
							label: `Plomb - ${plombStatus}`,
							description: description,
							anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
							stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
							color: tag.presencePlomb ? { r: 1, g: 0.5, b: 0 } : { r: 0, g: 0.7, b: 1 }
						};
						const [sid] = await mpSdk.Tag.add(tagDescriptor);
						plombSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add plomb tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of plombSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			plombSids = [];
		}
	}

	async function toggleTermite() {
		if (!mpSdk) return;
		if (showTermite) {
			// remove any previous termite tags
			for (const sid of termiteSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error('Failed to remove previous termite sid', sid, e);
				}
			}
			termiteSids = [];
			if (data.termiteTags && data.termiteTags.length > 0) {
				const filtered = data.termiteTags.filter((t: any) =>
					termitePresenceSelected.includes(Number(t.presenceTermite))
				);
				console.log(`Adding ${filtered.length} termite tags`);
				for (const tag of filtered) {
					try {
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);
						const termiteStatus = tag.presenceTermite ? 'Présence' : 'Absence';
						const tagDescriptor = {
							label: `Termite - ${termiteStatus}`,
							description: `${tag.description}\nÉtage: ${tag.etage}`,
							anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
							stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
							color: tag.presenceTermite ? { r: 0.6, g: 0.3, b: 0 } : { r: 0.5, g: 1, b: 0.5 }
						};
						const [sid] = await mpSdk.Tag.add(tagDescriptor);
						termiteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add termite tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of termiteSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			termiteSids = [];
		}
	}

	async function toggleStructure() {
		if (!mpSdk) return;
		if (showStructure) {
			// remove any previously added structure tags
			for (const sid of structureSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error('Failed to remove previous structure sid', sid, e);
				}
			}
			structureSids = [];
			if (data.structureTags && data.structureTags.length > 0) {
				console.log(`Adding ${data.structureTags.length} structure tags`);
				for (const tag of data.structureTags) {
					try {
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);
						let description = tag.description;
						if (tag.shapeSurface) {
							description += `\nSurface: ${tag.shapeSurface} m²`;
						}
						const tagDescriptor = {
							label: 'Structure',
							description: description,
							anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
							stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
							color: { r: 0.5, g: 0.5, b: 0.5 }
						};
						const [sid] = await mpSdk.Tag.add(tagDescriptor);
						structureSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add structure tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of structureSids) {
				try {
					await mpSdk.Tag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			structureSids = [];
		}
	}

	// Build cache of PEMD facet lists for client-side filtering
	function buildPemdFacets() {
		const groups: { id: number | null; name: string | null }[] = [];
		const categories: { id: number | null; name: string | null; groupeId: number | null }[] = [];
		const objects: { id: number | null; name: string | null; categorieId: number | null }[] = [];
		if (!data.pemdFacets) {
			pemdGroups = groups;
			pemdCategories = categories;
			pemdObjects = objects;
			// set master lists
			allPemdGroups = data.groups || [];
			categoriesV2 = data.categoriesV2 || [];
			allPemdObjects = data.allPemdObjects || objects;
			return;
		}
		for (const f of data.pemdFacets) {
			if (f.groupeName != null) {
				if (!groups.some((g) => g.name === f.groupeName)) {
					groups.push({ id: f.groupeId, name: f.groupeName });
				}
			}
			if (f.categorieName != null) {
				if (!categories.some((c) => c.name === f.categorieName)) {
					categories.push({ id: f.categorieId, name: f.categorieName, groupeId: f.groupeId });
				}
			}
			if (f.objetName != null) {
				if (!objects.some((o) => o.name === f.objetName)) {
					objects.push({ id: f.objetId, name: f.objetName, categorieId: f.categorieId });
				}
			}
		}
		pemdGroups = groups;
		pemdCategories = categories;
		pemdObjects = objects;
		// set master lists from server response if available, otherwise keep what we derived
		allPemdGroups = data.groups || groups;
		categoriesV2 = data.categoriesV2 || categories;
		allPemdObjects = data.allPemdObjects || objects;
	}

	function isPemdFilterSelected() {
		return (
			selectedPemdGroup.trim() !== '' ||
			selectedPemdCategory.trim() !== '' ||
			selectedPemdObject.trim() !== ''
		);
	}

	// Handlers for group/category changes (run on input) — avoids using rune reactive statements
	function handleGroupChange() {
		if (selectedPemdGroup && selectedPemdGroup.trim() !== '') {
			const group = allPemdGroups.find(
				(g) => g.name === selectedPemdGroup || String(g.id) === selectedPemdGroup
			);
			if (group) {
				pemdCategoriesFiltered = categoriesV2.filter((c) => c.groupeId === group.id);
			} else {
				pemdCategoriesFiltered = [];
			}
			// Clear downstream selections
			selectedPemdCategory = '';
			selectedPemdObject = '';
		} else {
			pemdCategoriesFiltered = [];
			pemdObjectsFiltered = [];
			selectedPemdCategory = '';
			selectedPemdObject = '';
		}
	}

	function handleCategoryChange() {
		if (selectedPemdCategory && selectedPemdCategory.trim() !== '') {
			const cat = categoriesV2.find(
				(c) => c.name === selectedPemdCategory || String(c.id) === selectedPemdCategory
			);
			if (cat) {
				pemdObjectsFiltered = allPemdObjects.filter((o) => o.categorieId === cat.id);
			} else {
				pemdObjectsFiltered = [];
			}
			selectedPemdObject = '';
		} else {
			pemdObjectsFiltered = [];
			selectedPemdObject = '';
		}
	}

	function getAllowedObjetIds() {
		const allowed = new Set<number>();
		if (selectedPemdObject.trim() !== '') {
			for (const o of allPemdObjects) {
				if (o.name === selectedPemdObject && o.id != null) allowed.add(o.id);
			}
			return Array.from(allowed).filter((v): v is number => v != null);
		}

		if (selectedPemdCategory.trim() !== '') {
			const cat = categoriesV2.find(
				(c) => c.id === Number(selectedPemdCategory) || c.name === selectedPemdCategory
			);
			if (cat) {
				for (const o of allPemdObjects) {
					if (o.categorieId === cat.id && o.id != null) allowed.add(o.id);
				}
			}
			return Array.from(allowed).filter((v): v is number => v != null);
		}

		if (selectedPemdGroup.trim() !== '') {
			const group = allPemdGroups.find(
				(g) => g.name === selectedPemdGroup || String(g.id) === selectedPemdGroup
			);
			if (group) {
				const allowedCatIds = categoriesV2.filter((c) => c.groupeId === group.id).map((c) => c.id);
				for (const o of allPemdObjects) {
					if (o.categorieId != null && allowedCatIds.includes(o.categorieId) && o.id != null)
						allowed.add(o.id);
				}
			}
			return Array.from(allowed).filter((v): v is number => v != null);
		}

		// no filter: return empty array (do not add everything by default)
		return [];
	}

	async function addFilteredPemdTags() {
		if (!mpSdk) return;
		if (!isPemdFilterSelected()) {
			alert('Veuillez sélectionner au moins un filtre (groupe, catégorie ou objet).');
			return;
		}
		const allowedIds = getAllowedObjetIds();
		if (!data.pemdTags || data.pemdTags.length === 0) return;
		// remove existing PEMD tags before adding the new filtered set
		await removePemdTags();
		const filtered = data.pemdTags.filter(
			(t: any) => t.objetId != null && allowedIds.includes(Number(t.objetId))
		);
		console.log(`Adding ${filtered.length} pemd tags (filtered)`);
		for (const tag of filtered) {
			try {
				if (!tag.anchorPosition || !tag.stemVector) continue;
				const anchorPosition = JSON.parse(tag.anchorPosition);
				const stemVector = JSON.parse(tag.stemVector);
				let description = tag.description || '';
				if (tag.quantite) description += `\nQuantité: ${tag.quantite}`;
				if (tag.etage) description += `\nÉtage: ${tag.etage}`;
				if (tag.etat) description += `\nÉtat: ${tag.etat}`;

				const tagDescriptor = {
					label: 'PEMD',
					description: description,
					anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
					stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
					color: { r: 0.6, g: 0.2, b: 0.8 }
				};
				const [sid] = await mpSdk.Tag.add(tagDescriptor);
				pemdSids.push(sid);
			} catch (tagError) {
				console.error(`Failed to add pemd tag ${tag.id}:`, tagError);
			}
		}
		// keep the UI toggle state true (user wants to display PEMD tags)
		showPemd = true;
		showPemdModal = false;
	}

	async function removePemdTags() {
		if (!mpSdk) return;
		for (const sid of pemdSids) {
			try {
				await mpSdk.Tag.remove(sid);
			} catch (e) {
				console.error('Failed to remove pemd sid', sid, e);
			}
		}
		pemdSids = [];
		showPemd = false;
	}

	onMount(() => {
		let handleUnhandledRejection: (ev: PromiseRejectionEvent) => void;
		(async () => {
			try {
				const { setupSdk } = await import('@matterport/sdk');
				mpSdk = await setupSdk(data.matterportSdkKey, { iframe });

				// Suppress noisy analytics/network errors coming from the Matterport SDK (often caused by ad-blockers)
				handleUnhandledRejection = (ev: PromiseRejectionEvent) => {
					try {
						const r: any = ev.reason;
						const msg =
							typeof r === 'string'
								? r
								: r && (r.message || (r.error && r.error.message) || r.url || '');
						if (msg && String(msg).includes('events.matterport.com')) {
							ev.preventDefault();
							console.debug('Ignored blocked Matterport analytics request:', r);
						}
					} catch (ignored) {
						// ignore handler errors
					}
				};
				window.addEventListener('unhandledrejection', handleUnhandledRejection);

				console.log('Matterport SDK connected', mpSdk);
			} catch (e) {
				console.error('Matterport SDK connection failed:', e);
			}
		})();

		return () => {
			if (handleUnhandledRejection)
				window.removeEventListener('unhandledrejection', handleUnhandledRejection);
			try {
				if (mpSdk && mpSdk.disconnect) mpSdk.disconnect();
			} catch (err) {
				console.error('Matterport SDK disconnect failed:', err);
			}
		};
	});
</script>

<div class="h-screen w-full p-6 font-[Poppins] flex flex-col">
	<!-- Modals -->
	{#if showAmianteModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="absolute inset-0 bg-black/40"
				role="button"
				tabindex="0"
				aria-label="Fermer le modal"
				onclick={() => {
					showAmianteModal = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showAmianteModal = false;
					}
				}}
			></div>
			<div class="relative z-10 w-80 rounded-lg bg-white p-4 shadow-lg">
				<h3 class="mb-3 text-lg font-semibold">Filtrer Amiante</h3>
				<div class="mb-3 flex flex-col gap-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={amiantePresent} />
						<span>Présence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={amianteAbsent} />
						<span>Absence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={amianteEnCours} />
						<span>En cours</span>
					</label>
				</div>
				<div class="flex justify-end gap-2">
					<button
						class="rounded px-3 py-1 text-sm"
						onclick={() => {
							showAmianteModal = false;
						}}>Annuler</button
					>
					<button
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white"
						onclick={() => {
							amiantePresenceSelected = [];
							if (amiantePresent) amiantePresenceSelected.push(1);
							if (amianteAbsent) amiantePresenceSelected.push(0);
							if (amianteEnCours) amiantePresenceSelected.push(2);
							showAmianteModal = false;
							showAmiante = true;
							toggleAmiante();
						}}>Appliquer</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if showPemdModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="absolute inset-0 bg-black/40"
				role="button"
				tabindex="0"
				aria-label="Fermer le modal"
				onclick={() => {
					showPemdModal = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showPemdModal = false;
					}
				}}
			></div>
			<div class="relative z-10 w-96 rounded-lg bg-white p-4 shadow-lg">
				<h3 class="mb-3 text-lg font-semibold">Filtrer PEMD</h3>
				<div class="mb-3 flex flex-col gap-2">
					<label class="flex flex-col">
						<span class="text-sm text-gray-700">Groupe</span>
						<select
							bind:value={selectedPemdGroup}
							onchange={handleGroupChange}
							class="w-full border rounded px-2 py-1"
						>
							<option value="">-- Choisir un groupe --</option>
							{#each allPemdGroups as g}
								<option value={g.name}>{g.name}</option>
							{/each}
						</select>
					</label>
					<label class="flex flex-col">
						<span class="text-sm text-gray-700">Catégorie</span>
						<select
							bind:value={selectedPemdCategory}
							onchange={handleCategoryChange}
							class="w-full border rounded px-2 py-1"
							disabled={selectedPemdGroup.trim() === ''}
						>
							<option value="">-- Choisir une catégorie --</option>
							{#each pemdCategoriesFiltered as c}
								<option value={c.name}>{c.name}</option>
							{/each}
						</select>
					</label>
					<label class="flex flex-col">
						<span class="text-sm text-gray-700">Objet</span>
						<select
							bind:value={selectedPemdObject}
							class="w-full border rounded px-2 py-1"
							disabled={selectedPemdCategory.trim() === ''}
						>
							<option value="">-- Choisir un objet --</option>
							{#each pemdObjectsFiltered as o}
								<option value={o.name}>{o.name}</option>
							{/each}
						</select>
					</label>
				</div>
				<div class="mb-3">
					<span class="text-sm text-gray-700 mb-2 block">Filtres appliqués:</span>
					<div class="flex flex-wrap gap-2">
						{#if selectedPemdGroup.trim() !== ''}
							<span class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
								Groupe: {selectedPemdGroup}
								<button
									type="button"
									onclick={() => {
										selectedPemdGroup = '';
										handleGroupChange();
									}}
									class="hover:bg-blue-200 rounded-full p-0.5"
									aria-label="Supprimer le filtre groupe"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</button>
							</span>
						{/if}
						{#if selectedPemdCategory.trim() !== ''}
							<span class="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
								Catégorie: {selectedPemdCategory}
								<button
									type="button"
									onclick={() => {
										selectedPemdCategory = '';
										handleCategoryChange();
									}}
									class="hover:bg-green-200 rounded-full p-0.5"
									aria-label="Supprimer le filtre catégorie"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</button>
							</span>
						{/if}
						{#if selectedPemdObject.trim() !== ''}
							<span class="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
								Objet: {selectedPemdObject}
								<button
									type="button"
									onclick={() => {
										selectedPemdObject = '';
									}}
									class="hover:bg-purple-200 rounded-full p-0.5"
									aria-label="Supprimer le filtre objet"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</button>
							</span>
						{/if}
						{#if selectedPemdGroup.trim() === '' && selectedPemdCategory.trim() === '' && selectedPemdObject.trim() === ''}
							<span class="text-sm text-gray-400">Aucun filtre appliqué</span>
						{/if}
					</div>
				</div>
				<div class="flex justify-end gap-2">
					<button
						class="rounded px-3 py-1 text-sm"
						onclick={() => {
							showPemdModal = false;
						}}>Fermer</button
					>
					<button
						class="rounded bg-red-600 px-3 py-1 text-sm text-white"
						onclick={removePemdTags}
						disabled={pemdSids.length === 0}>Supprimer les tags PEMD</button
					>
					<button
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white"
						onclick={addFilteredPemdTags}
						disabled={!isPemdFilterSelected()}>Ajouter dans le modèle</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if showPlombModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="absolute inset-0 bg-black/40"
				role="button"
				tabindex="0"
				aria-label="Fermer le modal"
				onclick={() => {
					showPlombModal = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showPlombModal = false;
					}
				}}
			></div>
			<div class="relative z-10 w-80 rounded-lg bg-white p-4 shadow-lg">
				<h3 class="mb-3 text-lg font-semibold">Filtrer Plomb</h3>
				<div class="mb-3 flex flex-col gap-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={plombPresent} />
						<span>Présence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={plombAbsent} />
						<span>Absence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={plombEnCours} />
						<span>En cours</span>
					</label>
				</div>
				<div class="flex justify-end gap-2">
					<button
						class="rounded px-3 py-1 text-sm"
						onclick={() => {
							showPlombModal = false;
						}}>Annuler</button
					>
					<button
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white"
						onclick={() => {
							plombPresenceSelected = [];
							if (plombPresent) plombPresenceSelected.push(1);
							if (plombAbsent) plombPresenceSelected.push(0);
							if (plombEnCours) plombPresenceSelected.push(2);
							showPlombModal = false;
							showPlomb = true;
							togglePlomb();
						}}>Appliquer</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if showTermiteModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center">
			<div
				class="absolute inset-0 bg-black/40"
				role="button"
				tabindex="0"
				aria-label="Fermer le modal"
				onclick={() => {
					showTermiteModal = false;
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						showTermiteModal = false;
					}
				}}
			></div>
			<div class="relative z-10 w-80 rounded-lg bg-white p-4 shadow-lg">
				<h3 class="mb-3 text-lg font-semibold">Filtrer Termite</h3>
				<div class="mb-3 flex flex-col gap-2">
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={termitePresent} />
						<span>Présence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={termiteAbsent} />
						<span>Absence</span>
					</label>
					<label class="flex items-center gap-2">
						<input type="checkbox" bind:checked={termiteEnCours} />
						<span>En cours</span>
					</label>
				</div>
				<div class="flex justify-end gap-2">
					<button
						class="rounded px-3 py-1 text-sm"
						onclick={() => {
							showTermiteModal = false;
						}}>Annuler</button
					>
					<button
						class="rounded bg-blue-600 px-3 py-1 text-sm text-white"
						onclick={() => {
							termitePresenceSelected = [];
							if (termitePresent) termitePresenceSelected.push(1);
							if (termiteAbsent) termitePresenceSelected.push(0);
							if (termiteEnCours) termitePresenceSelected.push(2);
							showTermiteModal = false;
							showTermite = true;
							toggleTermite();
						}}>Appliquer</button
					>
				</div>
			</div>
		</div>
	{/if}

	<div class="mb-6 grid grid-cols-6 gap-4 w-full">
		<button
			type="button"
			title="Afficher les mail tags"
			aria-pressed={showMail}
			onclick={() => {
				showMail = !showMail;
				toggleMail();
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showMail ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<Mail
				size={32}
				class={`transition-transform ${showMail ? 'scale-110 text-blue-700' : 'text-gray-700'}`}
			/>
		</button>

		<button
			type="button"
			title="Afficher les tags amiante"
			aria-pressed={showAmiante}
			onclick={() => {
				if (showAmiante) {
					showAmiante = false;
					toggleAmiante();
				} else {
					showAmianteModal = true;
				}
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showAmiante ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img
				src={tagAmianteImg}
				alt="amiante"
				class={`h-10 w-10 transition-transform ${showAmiante ? 'scale-110' : ''}`}
			/>
		</button>

		<button
			type="button"
			title="Afficher les tags plomb"
			aria-pressed={showPlomb}
			onclick={() => {
				if (showPlomb) {
					showPlomb = false;
					togglePlomb();
				} else {
					showPlombModal = true;
				}
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showPlomb ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img
				src={tagPlombImg}
				alt="plomb"
				class={`h-10 w-10 transition-transform ${showPlomb ? 'scale-110' : ''}`}
			/>
		</button>

		<button
			type="button"
			title="Afficher les tags termite"
			aria-pressed={showTermite}
			onclick={() => {
				if (showTermite) {
					showTermite = false;
					toggleTermite();
				} else {
					showTermiteModal = true;
				}
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showTermite ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img
				src={tagTermiteImg}
				alt="termite"
				class={`h-10 w-10 transition-transform ${showTermite ? 'scale-110' : ''}`}
			/>
		</button>

		<button
			type="button"
			title="Afficher les tags structure"
			aria-pressed={showStructure}
			onclick={() => {
				showStructure = !showStructure;
				toggleStructure();
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showStructure ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img
				src={tagStructureImg}
				alt="structure"
				class={`h-10 w-10 transition-transform ${showStructure ? 'scale-110' : ''}`}
			/>
		</button>

		<button
			type="button"
			title="Afficher les tags PEMD"
			aria-pressed={showPemd}
			onclick={() => {
				// Open modal to choose filters (group / category / object) instead of adding all tags
				buildPemdFacets();
				showPemdModal = true;
			}}
			class={`w-full h-20 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showPemd ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img
				src={tagPemdImg}
				alt="pemd"
				class={`h-10 w-10 object-contain transition-transform ${showPemd ? 'scale-110' : ''}`}
			/>
		</button>
	</div>

	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex-1">
		<iframe
			bind:this={iframe}
			title="Matterport Showcase"
			class="h-full w-full"
			src="https://my.matterport.com/show?m={data.projet
				.id}&play=1&applicationKey={data.matterportSdkKey}"
			frameborder="0"
			allow="fullscreen; vr"
		>
		</iframe>
	</div>
</div>
