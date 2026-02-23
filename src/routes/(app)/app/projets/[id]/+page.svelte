<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData, ActionData } from './$types';
	import type { MpSdk } from '@matterport/sdk';
	import tagAmianteImg from '$lib/assets/tagamiante.png';
	import tagPlombImg from '$lib/assets/tagplomb.png';
	import tagTermiteImg from '$lib/assets/tagtermite.png';
	import tagPemdImg from '$lib/assets/pemd360.png';
	import { Mail, Plus, Pencil, X } from 'lucide-svelte';
	import { invalidateAll } from '$app/navigation';
	import PresenceFilterModal from '$lib/components/PresenceFilterModal.svelte';
	import PemdCreateModal from '$lib/components/PemdCreateModal.svelte';
	import PemdFilterModal from '$lib/components/PemdFilterModal.svelte';
	import { PemdEditMode } from '$lib/pemd-edit-mode.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let iframe: HTMLIFrameElement;
	let mpSdk: MpSdk | undefined = $state();

	let showMail = $state(false);
	let showAmiante = $state(false);
	let showPlomb = $state(false);
	let showTermite = $state(false);
	let showPemd = $state(false);

	// modal states and selected presence filters (defaults: both checked)
	let showAmianteModal = $state(false);
	let showPlombModal = $state(false);
	let showTermiteModal = $state(false);
	// Modal pour PEMD
	let showPemdModal = $state(false);

	// PEMD Edit Mode
	let showPemdCreateModal = $state(false);
	let pendingTagPosition: {
		anchorPosition: { x: number; y: number; z: number };
		normal: { x: number; y: number; z: number };
	} | null = $state(null);
	const editMode = new PemdEditMode((position, normal) => openPemdCreateModal(position, normal));
	let amiantePresenceSelected: number[] = [0, 1, 2];
	let plombPresenceSelected: number[] = [0, 1, 2];
	let termitePresenceSelected: number[] = [0, 1, 2];

	let mailSids: string[] = [];
	let amianteSids: string[] = [];
	let plombSids: string[] = [];
	let termiteSids: string[] = [];
	let pemdSids = $state([] as string[]);

	// Generic helper shared by toggleAmiante, togglePlomb, toggleTermite.
	// Always removes the current SIDs first, then adds filtered tags if `show` is true.
	// Returns the new SIDs array so callers can reassign their variable.
	interface PresenceTag {
		id: unknown;
		anchorPosition: string;
		stemVector: string;
	}

	async function togglePresenceTags<T extends PresenceTag>(
		show: boolean,
		currentSids: string[],
		tags: T[] | undefined,
		presenceSelected: number[],
		getPresence: (tag: T) => number,
		buildLabel: (tag: T) => string,
		buildDescription: (tag: T) => string,
		getColor: (tag: T) => { r: number; g: number; b: number },
		typeName: string
	): Promise<string[]> {
		if (!mpSdk) return currentSids;

		for (const sid of currentSids) {
			try {
				await mpSdk.Tag.remove(sid);
			} catch (e) {
				console.error(`Failed to remove ${typeName} sid`, sid, e);
			}
		}

		if (!show || !tags || tags.length === 0) return [];

		const newSids: string[] = [];
		const filtered = tags.filter((tag) => presenceSelected.includes(getPresence(tag)));
		console.log(`Adding ${filtered.length} ${typeName} tags`);

		for (const tag of filtered) {
			try {
				const anchorPosition = JSON.parse(tag.anchorPosition);
				const stemVector = JSON.parse(tag.stemVector);
				const [sid] = await mpSdk.Tag.add({
					label: buildLabel(tag),
					description: buildDescription(tag),
					anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
					stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
					color: getColor(tag)
				});
				newSids.push(sid);
			} catch (tagError) {
				console.error(`Failed to add ${typeName} tag ${tag.id}:`, tagError);
			}
		}

		return newSids;
	}

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
		amianteSids = await togglePresenceTags(
			showAmiante,
			amianteSids,
			data.amianteTags,
			amiantePresenceSelected,
			(tag: App.TagsAmiante) => Number(tag.presenceAmiante),
			(tag) => `Amiante - ${tag.presenceAmiante ? 'Présence' : 'Absence'}`,
			(tag) => `${tag.description}\nType: ${tag.type}\nÉtage: ${tag.etage}`,
			(tag) => (tag.presenceAmiante ? { r: 1, g: 0, b: 0 } : { r: 0, g: 1, b: 0 }),
			'amiante'
		);
	}

	async function togglePlomb() {
		plombSids = await togglePresenceTags(
			showPlomb,
			plombSids,
			data.plombTags,
			plombPresenceSelected,
			(tag: App.PlombTags) => Number(tag.presencePlomb),
			(tag) => `Plomb - ${tag.presencePlomb ? 'Présence' : 'Absence'}`,
			(tag) => {
				let desc = tag.description;
				if (tag.presencePlomb && tag.concentration) desc += `\nConcentration: ${tag.concentration}`;
				desc += `\nÉtage: ${tag.etage}`;
				return desc;
			},
			(tag) => (tag.presencePlomb ? { r: 1, g: 0.5, b: 0 } : { r: 0, g: 0.7, b: 1 }),
			'plomb'
		);
	}

	async function toggleTermite() {
		termiteSids = await togglePresenceTags(
			showTermite,
			termiteSids,
			data.termiteTags,
			termitePresenceSelected,
			(tag: App.TermiteTags) => Number(tag.presenceTermite),
			(tag) => `Termite - ${tag.presenceTermite ? 'Présence' : 'Absence'}`,
			(tag) => `${tag.description}\nÉtage: ${tag.etage}`,
			(tag) => (tag.presenceTermite ? { r: 0.6, g: 0.3, b: 0 } : { r: 0.5, g: 1, b: 0.5 }),
			'termite'
		);
	}

	async function addFilteredPemdTags(allowedIds: number[]) {
		if (!mpSdk) return;
		if (!data.pemdTags || data.pemdTags.length === 0) return;
		// remove existing PEMD tags before adding the new filtered set
		await removePemdTags();
		const filtered = data.pemdTags.filter(
			(pemdTag: App.Pemds) =>
				pemdTag.objetId != null && allowedIds.includes(Number(pemdTag.objetId))
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

	function openPemdCreateModal(
		position: { x: number; y: number; z: number },
		normal: { x: number; y: number; z: number }
	) {
		// Calculate stemVector from normal (pointing outward from surface)
		const stemVector = {
			x: normal.x * 0.15,
			y: normal.y * 0.15,
			z: normal.z * 0.15
		};

		pendingTagPosition = {
			anchorPosition: position,
			normal: stemVector
		};

		showPemdCreateModal = true;
	}

	function closePemdCreateModal() {
		showPemdCreateModal = false;
		pendingTagPosition = null;
	}

	async function addNewPemdTagToModel(tagData: App.Tag): Promise<App.TagResponse | void> {
		if (!mpSdk) return;

		try {
			const anchorPosition = JSON.parse(tagData.anchorPosition);
			const stemVector = JSON.parse(tagData.stemVector);

			let description = tagData.description || '';
			if (tagData.quantite) description += `\nQuantité: ${tagData.quantite}`;
			if (tagData.etage) description += `\nÉtage: ${tagData.etage}`;
			if (tagData.etat) description += `\nÉtat: ${tagData.etat}`;

			const tagDescriptor = {
				label: 'PEMD',
				description: description,
				anchorPosition: { x: anchorPosition.x, y: anchorPosition.y, z: anchorPosition.z },
				stemVector: { x: stemVector.x, y: stemVector.y, z: stemVector.z },
				color: { r: 0.6, g: 0.2, b: 0.8 }
			};

			const [sid] = await mpSdk.Tag.add(tagDescriptor);
			pemdSids.push(sid);
			showPemd = true;
		} catch (e) {
			console.error('Failed to add new PEMD tag to model:', e);
		}
	}

	onMount(() => {
		let handleUnhandledRejection: (ev: PromiseRejectionEvent) => void;
		(async () => {
			try {
				const { setupSdk } = await import('@matterport/sdk');
				mpSdk = await setupSdk(data.matterportSdkKey, { iframe });
				editMode.setMpSdk(mpSdk);

				// Suppress noisy analytics/network errors coming from the Matterport SDK (often caused by ad-blockers)
				handleUnhandledRejection = (ev: PromiseRejectionEvent) => {
					try {
						const reason: PromiseRejectionEvent['reason'] = ev.reason;
						const msg =
							typeof reason === 'string'
								? reason
								: reason &&
									(reason.message || (reason.error && reason.error.message) || reason.url || '');
						if (msg && String(msg).includes('events.matterport.com')) {
							ev.preventDefault();
							console.debug('Ignored blocked Matterport analytics request:', reason);
						}
					} catch (ignored) {
						console.debug('Unhandled rejection handler failed:', ignored);
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
			// Cleanup edit mode listeners
			editMode.cleanup();
			try {
				if (mpSdk && mpSdk.disconnect) mpSdk.disconnect();
			} catch (err) {
				console.error('Matterport SDK disconnect failed:', err);
			}
		};
	});

	// Effect to handle form submission result
	$effect(() => {
		if (form?.success && form?.tag) {
			// Add the new tag to the model
			addNewPemdTagToModel(form.tag);
			closePemdCreateModal();
			// Refresh the data
			invalidateAll();
		}
	});
</script>

<div class="h-screen w-full p-6 font-[Poppins] flex flex-col">
	<!-- Modals -->
	<PresenceFilterModal
		title="Filtrer Amiante"
		bind:show={showAmianteModal}
		onApply={(selected) => {
			amiantePresenceSelected = selected;
			showAmiante = true;
			toggleAmiante();
		}}
	/>

	<PemdFilterModal
		bind:show={showPemdModal}
		groups={data.groups || []}
		categoriesV2={data.categoriesV2 || []}
		allPemdObjects={data.allPemdObjects || []}
		hasTags={pemdSids.length > 0}
		onApply={addFilteredPemdTags}
		onRemove={removePemdTags}
	/>

	<PresenceFilterModal
		title="Filtrer Plomb"
		bind:show={showPlombModal}
		onApply={(selected) => {
			plombPresenceSelected = selected;
			showPlomb = true;
			togglePlomb();
		}}
	/>

	<PresenceFilterModal
		title="Filtrer Termite"
		bind:show={showTermiteModal}
		onApply={(selected) => {
			termitePresenceSelected = selected;
			showTermite = true;
			toggleTermite();
		}}
	/>

	<!-- PEMD Creation Modal -->
	<PemdCreateModal
		show={showPemdCreateModal}
		pendingPosition={pendingTagPosition}
		groups={data.groups || []}
		categoriesV2={data.categoriesV2 || []}
		allPemdObjects={data.allPemdObjects || []}
		onClose={closePemdCreateModal}
	/>

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

		<div class="flex flex-col gap-2">
			<button
				type="button"
				title="Afficher les tags PEMD"
				aria-pressed={showPemd}
				onclick={() => {
					showPemdModal = true;
				}}
				class={`w-full h-14 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showPemd ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
			>
				<img
					src={tagPemdImg}
					alt="pemd"
					class={`h-24 w-24 object-contain transition-transform ${showPemd ? 'scale-140' : ''}`}
				/>
			</button>
			<button
				type="button"
				title={editMode.enabled ? 'Désactiver le mode édition PEMD' : 'Activer le mode édition PEMD'}
				aria-pressed={editMode.enabled}
				onclick={() => editMode.toggle()}
				class={`w-full h-6 flex items-center justify-center rounded-lg border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${editMode.enabled ? 'bg-purple-600 text-white ring-1 ring-purple-300 shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}
			>
				<Pencil size={12} class="mr-1" />
				{editMode.enabled ? 'Édition ON' : 'Éditer'}
			</button>
		</div>
	</div>

	<!-- Edit mode indicator -->
	{#if editMode.enabled}
		<div
			class="mb-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-4 py-3"
		>
			<div class="flex items-center gap-3">
				<div class="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
				<span class="text-purple-700 font-medium">Mode édition PEMD actif</span>
				<span class="text-purple-600 text-sm"
					>- Cliquez directement sur le modèle pour ajouter un tag</span
				>
			</div>
			<button
				type="button"
				onclick={() => editMode.toggle()}
				class="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
			>
				<X size={16} />
				Quitter le mode édition
			</button>
		</div>
	{/if}

	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex-1 relative">
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

		<!-- Overlay for capturing clicks in edit mode -->
		{#if editMode.enabled}
			<div
				bind:this={editMode.overlay}
				role="button"
				tabindex="0"
				aria-label="Cliquez pour ajouter un tag PEMD"
				class="absolute inset-0 cursor-crosshair z-10"
				style="background: rgba(147, 51, 234, 0.05);"
				onclick={(e) => editMode.handleOverlayClick(e)}
				onmousemove={(e) => editMode.handleOverlayMouseMove(e)}
				onkeydown={(e) => editMode.handleOverlayKeydown(e)}
			>
				<!-- Visual indicator showing where the tag will be placed -->
				{#if editMode.lastIntersection}
					<div
						class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-purple-200"
					>
						<div class="flex items-center gap-2 text-purple-700">
							<Plus size={16} />
							<span class="text-sm font-medium">Cliquez pour placer le tag</span>
						</div>
						<div class="text-xs text-gray-500 mt-1">
							Position: X={editMode.lastIntersection!.position.x.toFixed(2)}, Y={editMode.lastIntersection!.position.y.toFixed(
								2
							)}, Z={editMode.lastIntersection!.position.z.toFixed(2)}
						</div>
					</div>
				{:else}
					<div
						class="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200"
					>
						<div class="flex items-center gap-2 text-gray-500">
							<span class="text-sm">Déplacez le curseur sur le modèle...</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>
