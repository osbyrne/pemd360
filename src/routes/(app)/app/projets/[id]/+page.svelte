<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import tagAmianteImg from '$lib/assets/img/tagamiante.gif';
	import tagPlombImg from '$lib/assets/img/tagplomb.gif';
	import tagTermiteImg from '$lib/assets/img/tagtermite.gif';
	import tagStructureImg from '$lib/assets/img/tagstructure.gif';
	import tagPemdImg from '$lib/assets/img/pemd360.png';
	import { Mail } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement;
	let mpSdk: any;

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

	let amiantePresenceSelected: number[] = [0, 1, 2];
	let plombPresenceSelected: number[] = [0, 1, 2];
	let termitePresenceSelected: number[] = [0, 1, 2];

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
	let pemdSids: string[] = [];

	// SDK helper to support the new Tag API and fallback to Mattertag when needed
	async function addTag(descriptor: any) {
		if (!mpSdk) return [];
		if (mpSdk.Tag && typeof mpSdk.Tag.add === 'function') {
			return mpSdk.Tag.add(descriptor);
		}
		if (mpSdk.Mattertag && typeof mpSdk.Mattertag.add === 'function') {
			return mpSdk.Mattertag.add(descriptor);
		}
		throw new Error('SDK does not support Tag.add or Mattertag.add');
	}

	async function removeTag(sid: string) {
		if (!mpSdk) return;
		if (mpSdk.Tag && typeof mpSdk.Tag.remove === 'function') {
			return mpSdk.Tag.remove(sid);
		}
		if (mpSdk.Mattertag && typeof mpSdk.Mattertag.remove === 'function') {
			return mpSdk.Mattertag.remove(sid);
		}
		throw new Error('SDK does not support Tag.remove or Mattertag.remove');
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
					const [sid] = await addTag(tagDescriptor);
						mailSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of mailSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
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
						const [sid] = await addTag(tagDescriptor);
						amianteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add amiante tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of amianteSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
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
					const [sid] = await addTag(tagDescriptor);
						plombSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add plomb tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of plombSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
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
					const [sid] = await addTag(tagDescriptor);
						termiteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add termite tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of termiteSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
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
					const [sid] = await addTag(tagDescriptor);
						structureSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add structure tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of structureSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			structureSids = [];
		}
	}

	async function togglePemd() {
		if (!mpSdk) return;
		if (showPemd) {
			if (data.pemdTags && data.pemdTags.length > 0) {
				console.log(`Adding ${data.pemdTags.length} pemd tags`);
				for (const tag of data.pemdTags) {
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
					const [sid] = await addTag(tagDescriptor);
						pemdSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add pemd tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of pemdSids) {
				try {
					await mpSdk.Mattertag.remove(sid);
				} catch (e) {
					console.error(e);
				}
			}
			pemdSids = [];
		}
	}

	onMount(async () => {
		let handleUnhandledRejection: (ev: PromiseRejectionEvent) => void;
		try {
			// @ts-ignore
			const { connect } = await import('$lib/matterport/sdk.es6.js');
			mpSdk = await connect(iframe);
			// Shim: if SDK supports Tag API, forward Mattertag calls to Tag to avoid deprecation warnings
			if (mpSdk && mpSdk.Tag) {
				mpSdk.Mattertag = mpSdk.Mattertag || {};
				mpSdk.Mattertag.add = (...args: any[]) => mpSdk.Tag.add(...args);
				mpSdk.Mattertag.remove = (...args: any[]) => mpSdk.Tag.remove(...args);
			}

			// Suppress noisy analytics/network errors coming from the Matterport SDK (often caused by ad-blockers)
			handleUnhandledRejection = (ev: PromiseRejectionEvent) => {
				try {
					const r: any = ev.reason;
					const msg = typeof r === 'string' ? r : r && (r.message || r.error && r.error.message || r.url || '');
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

		return () => {
			if (handleUnhandledRejection) window.removeEventListener('unhandledrejection', handleUnhandledRejection);
			try {
				if (mpSdk && mpSdk.disconnect) mpSdk.disconnect();
			} catch (err) {
				// ignore disconnect errors
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
				showPemd = !showPemd;
				togglePemd();
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
				.id}&play=1&applicationKey=wxdq9q4dpay6wcrm41b1ynnib"
			frameborder="0"
			allow="fullscreen; vr"
		>
		</iframe>
	</div>
</div>
