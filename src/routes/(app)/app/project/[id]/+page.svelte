<script lang="ts">
	import { ArrowLeft, Calendar, MapPin, Building2, Hash, FileText, Target } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{data.projet.libelle} · Projet</title>
</svelte:head>

<div class="min-h-screen bg-linear-gradient-to-br from-slate-50 via-white to-emerald-50/30">
	{#if mounted}
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6" in:fade={{ duration: 300 }}>
			<!-- Header compact -->
			<div in:fly={{ y: -20, duration: 500 }} class="relative bg-linear-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-xl p-6 mb-6 overflow-hidden">
				<div class="absolute inset-0 bg-black/5"></div>
				<div class="relative z-10">
					<a href="/app/projets" class="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors">
						<ArrowLeft class="h-4 w-4" />
						<span class="text-sm font-medium">Retour aux projets</span>
					</a>

					<h1 class="text-3xl font-bold text-white mb-3">{data.projet.libelle}</h1>
					
					<div class="flex flex-wrap items-center gap-3">
						<span class="inline-flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
							<Hash class="h-3.5 w-3.5" />
							<span class="font-medium">{data.projet.reference}</span>
						</span>
						
						{#if data.projet.societeNom}
							<span class="inline-flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
								<Building2 class="h-3.5 w-3.5" />
								<span class="font-medium">{data.projet.societeNom}</span>
							</span>
						{/if}
						
						<span class="inline-flex items-center gap-2 text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
							<MapPin class="h-3.5 w-3.5" />
							<span class="font-medium">{data.projet.ville}</span>
						</span>
					</div>
				</div>
			</div>

			<!-- Grid 2 colonnes plus compact -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
				<!-- Colonne gauche -->
				<div in:fly={{ x: -20, delay: 100, duration: 500 }} class="space-y-5">
					<!-- Localisation -->
					<div class="bg-white rounded-xl border border-gray-200 p-5">
						<div class="flex items-center gap-2.5 mb-4">
							<div class="p-2 bg-linear-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
								<MapPin class="h-4 w-4 text-white" />
							</div>
							<h2 class="text-base font-semibold text-gray-900">Localisation</h2>
						</div>

						<div class="space-y-3">
							<div class="p-3 bg-gray-50 rounded-lg">
								<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">Adresse</p>
								<p class="text-sm text-gray-900 font-medium">{data.projet.rue}</p>
							</div>
							
							<div class="grid grid-cols-2 gap-3">
								<div class="p-3 bg-gray-50 rounded-lg">
									<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">CP</p>
									<p class="text-sm text-gray-900 font-medium">{data.projet.cp}</p>
								</div>
								<div class="p-3 bg-gray-50 rounded-lg">
									<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">Ville</p>
									<p class="text-sm text-gray-900 font-medium">{data.projet.ville}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Cadastre -->
					<div class="bg-white rounded-xl border border-gray-200 p-5">
						<div class="flex items-center gap-2.5 mb-4">
							<div class="p-2 bg-linear-gradient-to-br from-violet-500 to-purple-500 rounded-lg">
								<FileText class="h-4 w-4 text-white" />
							</div>
							<h2 class="text-base font-semibold text-gray-900">Cadastre</h2>
						</div>

						<div class="space-y-3">
							<div class="p-3 bg-violet-50 rounded-lg border border-violet-100">
								<p class="text-xs text-violet-600 mb-1 uppercase tracking-wide font-medium">Code INSEE</p>
								<p class="text-sm text-gray-900 font-semibold">{data.projet.codeInsee}</p>
							</div>
							
							<div class="grid grid-cols-2 gap-3">
								<div class="p-3 bg-gray-50 rounded-lg">
									<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">Section</p>
									<p class="text-sm text-gray-900 font-medium">{data.projet.section}</p>
								</div>
								<div class="p-3 bg-gray-50 rounded-lg">
									<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">Parcelle</p>
									<p class="text-sm text-gray-900 font-medium">{data.projet.parcelle}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Colonne droite -->
				<div in:fly={{ x: 20, delay: 200, duration: 500 }} class="space-y-5">
					<!-- Planning -->
					<div class="bg-white rounded-xl border border-gray-200 p-5">
						<div class="flex items-center gap-2.5 mb-4">
							<div class="p-2 bg-linear-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
								<Calendar class="h-4 w-4 text-white" />
							</div>
							<h2 class="text-base font-semibold text-gray-900">Planning</h2>
						</div>

						<div class="space-y-3">
							<div class="p-3 bg-linear-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
								<p class="text-xs text-blue-600 mb-1 uppercase tracking-wide font-medium">Démarrage</p>
								<p class="text-sm text-gray-900 font-semibold">{formatDate(data.projet.dateDemarrage)}</p>
							</div>
							
							{#if data.projet.dateDeFin}
								<div class="p-3 bg-linear-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
									<p class="text-xs text-purple-600 mb-1 uppercase tracking-wide font-medium">Fin prévue</p>
									<p class="text-sm text-gray-900 font-semibold">{formatDate(data.projet.dateDeFin)}</p>
								</div>
							{/if}
						</div>
					</div>

					<!-- Intervenants -->
					<div class="bg-white rounded-xl border border-gray-200 p-5">
						<div class="flex items-center gap-2.5 mb-4">
							<div class="p-2 bg-linear-gradient-to-br from-orange-500 to-red-500 rounded-lg">
								<Building2 class="h-4 w-4 text-white" />
							</div>
							<h2 class="text-base font-semibold text-gray-900">Intervenants</h2>
						</div>

						<div class="space-y-3">
							{#if data.projet.etablissementNom}
								<div class="p-3 bg-orange-50 rounded-lg border border-orange-100">
									<p class="text-xs text-orange-600 mb-1 uppercase tracking-wide font-medium">Établissement</p>
									<p class="text-sm text-gray-900 font-semibold">{data.projet.etablissementNom}</p>
								</div>
							{/if}
							
							<div class="p-3 bg-gray-50 rounded-lg">
								<p class="text-xs text-gray-500 mb-1 uppercase tracking-wide">Maître d'ouvrage</p>
								<p class="text-sm text-gray-900 font-medium">{data.projet.maitreDOuvrage}</p>
							</div>
						</div>
					</div>

					<!-- Type opération -->
					{#if data.projet.typeOperation}
						<div class="bg-linear-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-5 text-white">
							<div class="flex items-center gap-2.5 mb-3">
								<div class="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
									<Target class="h-4 w-4" />
								</div>
								<h2 class="text-base font-semibold">Type d'opération</h2>
							</div>
							<p class="text-xl font-bold">{data.projet.typeOperation}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
