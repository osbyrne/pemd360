<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let iframe: HTMLIFrameElement;
	let mpSdk: any;

	onMount(async () => {
		try {
			// @ts-ignore
			const { connect } = await import('$lib/matterport/sdk.es6.js');
			mpSdk = await connect(iframe);
			
			console.log('Matterport SDK connected', mpSdk);

			// Add tags from database
			if (data.tags && data.tags.length > 0) {
				console.log(`Adding ${data.tags.length} tags to the model`);
				
				for (const tag of data.tags) {
					try {
						// Parse position data from JSON strings
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);

						// Format date for display
						const tagDate = tag.date ? new Date(tag.date).toLocaleDateString() : '';

						// Create tag descriptor
						const tagDescriptor = {
							label: `Mail - ${tagDate}`,
							description: tag.content,
							anchorPosition: {
								x: anchorPosition.x,
								y: anchorPosition.y,
								z: anchorPosition.z
							},
							stemVector: {
								x: stemVector.x,
								y: stemVector.y,
								z: stemVector.z
							}
						};

						// Add tag to model
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						console.log(`Added tag ${tag.id} with sid ${sid}`);
					} catch (tagError) {
						console.error(`Failed to add tag ${tag.id}:`, tagError);
					}
				}
			}

			// Add amiante tags from database
			if (data.amianteTags && data.amianteTags.length > 0) {
				console.log(`Adding ${data.amianteTags.length} amiante tags to the model`);
				
				for (const tag of data.amianteTags) {
					try {
						// Parse position data from JSON strings
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);

						// Determine label based on presence of amiante
						const amianteStatus = tag.presenceAmiante ? 'Présence' : 'Absence';
						const label = `Amiante - ${amianteStatus}`;

						// Create tag descriptor
						const tagDescriptor = {
							label: label,
							description: `${tag.description}\nType: ${tag.type}\nÉtage: ${tag.etage}`,
							anchorPosition: {
								x: anchorPosition.x,
								y: anchorPosition.y,
								z: anchorPosition.z
							},
							stemVector: {
								x: stemVector.x,
								y: stemVector.y,
								z: stemVector.z
							},
							color: tag.presenceAmiante ? { r: 1, g: 0, b: 0 } : { r: 0, g: 1, b: 0 }
						};

						// Add tag to model
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						console.log(`Added amiante tag ${tag.id} with sid ${sid}`);
					} catch (tagError) {
						console.error(`Failed to add amiante tag ${tag.id}:`, tagError);
					}
				}
			}

			// Add plomb tags from database
			if (data.plombTags && data.plombTags.length > 0) {
				console.log(`Adding ${data.plombTags.length} plomb tags to the model`);
				
				for (const tag of data.plombTags) {
					try {
						// Parse position data from JSON strings
						const anchorPosition = JSON.parse(tag.anchorPosition);
						const stemVector = JSON.parse(tag.stemVector);

						// Determine label based on presence of plomb
						const plombStatus = tag.presencePlomb ? 'Présence' : 'Absence';
						const label = `Plomb - ${plombStatus}`;

						// Build description with concentration if available
						let description = tag.description;
						if (tag.presencePlomb && tag.concentration) {
							description += `\nConcentration: ${tag.concentration}`;
						}
						description += `\nÉtage: ${tag.etage}`;

						// Create tag descriptor
						const tagDescriptor = {
							label: label,
							description: description,
							anchorPosition: {
								x: anchorPosition.x,
								y: anchorPosition.y,
								z: anchorPosition.z
							},
							stemVector: {
								x: stemVector.x,
								y: stemVector.y,
								z: stemVector.z
							},
							color: tag.presencePlomb ? { r: 1, g: 0.5, b: 0 } : { r: 0, g: 0.7, b: 1 }
						};

						// Add tag to model
						const [sid] = await mpSdk.Mattertag.add(tagDescriptor);
						console.log(`Added plomb tag ${tag.id} with sid ${sid}`);
					} catch (tagError) {
						console.error(`Failed to add plomb tag ${tag.id}:`, tagError);
					}
				}
			}
		} catch (e) {
			console.error('Matterport SDK connection failed:', e);
		}
	});
</script>

<div class="h-full w-full p-6 font-[Poppins]">
	<div class="mb-6 flex items-center gap-4">
		<h1 class="text-2xl font-bold text-gray-900">{data.projet.libelle}</h1>
	</div>

	<div class="mb-6 flex items-center gap-4">
		<span class="text-sm text-gray-600">
			{data.tags?.length || 0} tag{data.tags?.length === 1 ? '' : 's'} mail
		</span>
		<span class="text-sm text-gray-600">•</span>
		<span class="text-sm text-gray-600">
			{data.amianteTags?.length || 0} tag{data.amianteTags?.length === 1 ? '' : 's'} amiante
		</span>
		<span class="text-sm text-gray-600">•</span>
		<span class="text-sm text-gray-600">
			{data.plombTags?.length || 0} tag{data.plombTags?.length === 1 ? '' : 's'} plomb
		</span>
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
