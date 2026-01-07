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
