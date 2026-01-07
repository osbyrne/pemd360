<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import tagAmianteImg from '$lib/assets/img/tagamiante.gif';
	import tagPlombImg from '$lib/assets/img/tagplomb.gif';
	import tagTermiteImg from '$lib/assets/img/tagtermite.gif';
	import tagStructureImg from '$lib/assets/img/tagstructure.gif';
	import {
		Mail
	} from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement;
	let mpSdk: any;

	let showMail = $state(false);
	let showAmiante = $state(false);
	let showPlomb = $state(false);
	let showTermite = $state(false);
	let showStructure = $state(false);

	let mailSids: string[] = [];
	let amianteSids: string[] = [];
	let plombSids: string[] = [];
	let termiteSids: string[] = [];
	let structureSids: string[] = [];

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
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						mailSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of mailSids) {
				try { await mpSdk.Mattertag.remove(sid); } catch (e) { console.error(e); }
			}
			mailSids = [];
		}
	}

	async function toggleAmiante() {
		if (!mpSdk) return;
		if (showAmiante) {
			if (data.amianteTags && data.amianteTags.length > 0) {
				console.log(`Adding ${data.amianteTags.length} amiante tags`);
				for (const tag of data.amianteTags) {
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
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						amianteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add amiante tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of amianteSids) {
				try { await mpSdk.Mattertag.remove(sid); } catch (e) { console.error(e); }
			}
			amianteSids = [];
		}
	}

	async function togglePlomb() {
		if (!mpSdk) return;
		if (showPlomb) {
			if (data.plombTags && data.plombTags.length > 0) {
				console.log(`Adding ${data.plombTags.length} plomb tags`);
				for (const tag of data.plombTags) {
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
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						plombSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add plomb tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of plombSids) {
				try { await mpSdk.Mattertag.remove(sid); } catch (e) { console.error(e); }
			}
			plombSids = [];
		}
	}

	async function toggleTermite() {
		if (!mpSdk) return;
		if (showTermite) {
			if (data.termiteTags && data.termiteTags.length > 0) {
				console.log(`Adding ${data.termiteTags.length} termite tags`);
				for (const tag of data.termiteTags) {
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
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						termiteSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add termite tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of termiteSids) {
				try { await mpSdk.Mattertag.remove(sid); } catch (e) { console.error(e); }
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
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						structureSids.push(sid);
					} catch (tagError) {
						console.error(`Failed to add structure tag ${tag.id}:`, tagError);
					}
				}
			}
		} else {
			for (const sid of structureSids) {
				try { await mpSdk.Mattertag.remove(sid); } catch (e) { console.error(e); }
			}
			structureSids = [];
		}
	}

	onMount(async () => {
		try {
			// @ts-ignore
			const { connect } = await import('$lib/matterport/sdk.es6.js');
			mpSdk = await connect(iframe);
			console.log('Matterport SDK connected', mpSdk);
		} catch (e) {
			console.error('Matterport SDK connection failed:', e);
		}
	});
</script>

<div class="h-full w-full p-6 font-[Poppins]">
	<div class="mb-6 flex items-center gap-4">
		<h1 class="text-2xl font-bold text-gray-900">{data.projet.libelle}</h1>
	</div>

	<div class="mb-6 flex flex-wrap items-center gap-6">
		<button
			type="button"
			title="Afficher les mail tags"
			aria-pressed={showMail}
			on:click={() => { showMail = !showMail; toggleMail(); }}
			class={`w-16 h-16 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showMail ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<Mail size={28} class={`transition-transform ${showMail ? 'scale-110 text-blue-700' : 'text-gray-700'}`} />
		</button>

		<button
			type="button"
			title="Afficher les tags amiante"
			aria-pressed={showAmiante}
			on:click={() => { showAmiante = !showAmiante; toggleAmiante(); }}
			class={`w-16 h-16 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showAmiante ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img src={tagAmianteImg} alt="amiante" class={`h-8 w-8 transition-transform ${showAmiante ? 'scale-110' : ''}`} />
		</button>

		<button
			type="button"
			title="Afficher les tags plomb"
			aria-pressed={showPlomb}
			on:click={() => { showPlomb = !showPlomb; togglePlomb(); }}
			class={`w-16 h-16 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showPlomb ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img src={tagPlombImg} alt="plomb" class={`h-8 w-8 transition-transform ${showPlomb ? 'scale-110' : ''}`} />
		</button>

		<button
			type="button"
			title="Afficher les tags termite"
			aria-pressed={showTermite}
			on:click={() => { showTermite = !showTermite; toggleTermite(); }}
			class={`w-16 h-16 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showTermite ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img src={tagTermiteImg} alt="termite" class={`h-8 w-8 transition-transform ${showTermite ? 'scale-110' : ''}`} />
		</button>

		<button
			type="button"
			title="Afficher les tags structure"
			aria-pressed={showStructure}
			on:click={() => { showStructure = !showStructure; toggleStructure(); }}
			class={`w-16 h-16 flex items-center justify-center rounded-lg border transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${showStructure ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm scale-105' : 'bg-gray-50 text-gray-700 hover:scale-105 hover:shadow-sm'}`}
		>
			<img src={tagStructureImg} alt="structure" class={`h-8 w-8 transition-transform ${showStructure ? 'scale-110' : ''}`} />
		</button>
	</div>

	<div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm h-[80vh]">
		<iframe
			bind:this={iframe}
			title="Matterport Showcase"
			class="h-full w-full"
			src="https://my.matterport.com/show?m={data.projet.id}&play=1&applicationKey=wxdq9q4dpay6wcrm41b1ynnib"
			frameborder="0"
			allow="fullscreen; vr"
		>
		</iframe>
	</div>
</div>
