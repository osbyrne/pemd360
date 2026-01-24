<script lang="ts">
	import './layout.css';
	import logoPEMD from '$lib/assets/img/pemd360.png';
	import logoDC from '$lib/assets/img/depollution_conseil.png';
	import { authClient } from '$lib/auth-client';
	import { pwaInfo } from 'virtual:pwa-info';
    import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
    injectSpeedInsights();

	let { children } = $props();
	let mobileMenuOpen = $state(false);

	// Vérifier si l'utilisateur est connecté
	const session = authClient.useSession();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
	<title>PEMD360</title>
	{@html pwaInfo!.webManifest.linkTag}
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="flex min-h-screen flex-col font-[Poppins]">
	<!-- Main Content -->
	<main class="flex-1">
		{@render children()}
	</main>
</div>
