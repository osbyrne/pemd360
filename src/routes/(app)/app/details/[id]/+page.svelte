<script lang="ts">
	import { MapPin, Building2, Hash, Target, Download } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	function formatDate(date: Date | number): string {
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

<div class="min-h-screen">
	{#if mounted}
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<!-- Header compact -->
			<div class=" rounded-xl p-6 mb-6">
				<h1 class="text-3xl font-bold">{data.projet.libelle}</h1>

				<a href="/api/projects/{data.projet.id}/cerfa" download class="btn">
					<Download class="h-4 w-4" />
					<span>Télécharger Cerfa</span>
				</a>

				<div class="flex flex-wrap items-center gap-3">
					<span
						class="inline-flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm"
					>
						<Hash class="h-3.5 w-3.5" />
						<span class="font-medium">{data.projet.reference}</span>
					</span>

					{#if data.projet.societeNom}
						<span
							class="inline-flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm"
						>
							<Building2 class="h-3.5 w-3.5" />
							<span class="font-medium">{data.projet.societeNom}</span>
						</span>
					{/if}

					<span
						class="inline-flex items-center gap-2 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm"
					>
						<MapPin class="h-3.5 w-3.5" />
						<span class="font-medium">{data.projet.ville}</span>
					</span>
				</div>
			</div>

			<!-- Grid 2 colonnes plus compact -->
			<div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:flex-row">
				<div class="space-y-5">
					<!-- Localisation -->
					<div class="card bg-base-100 w-96 shadow-sm">
						<div class="card-body">
							<div class="flex items-center gap-2.5 mb-4">
								<h2 class="text-base font-semibold">Localisation</h2>
							</div>

							<div class="space-y-3">
								<div class="p-3 rounded-lg">
									<p class="text-xs mb-1 uppercase tracking-wide">Adresse</p>
									<p class="text-sm font-medium">{data.projet.rue}</p>
								</div>

								<div class="grid grid-cols-2 gap-3">
									<div class="p-3 rounded-lg">
										<p class="text-xs mb-1 uppercase tracking-wide">CP</p>
										<p class="text-sm font-medium">{data.projet.cp}</p>
									</div>
									<div class="p-3 rounded-lg">
										<p class="text-xs mb-1 uppercase tracking-wide">Ville</p>
										<p class="text-sm font-medium">{data.projet.ville}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Cadastre -->
					<div class="card bg-base-100 w-96 shadow-sm">
						<div class="card-body">
							<div class="flex items-center gap-2.5 mb-4">
								<h2 class="text-base font-semibold">Cadastre</h2>
							</div>

							<div class="space-y-3">
								<div class="p-3 rounded-lg border border-violet-100">
									<p class="text-xs text-violet-600 mb-1 uppercase tracking-wide font-medium">
										Code INSEE
									</p>
									<p class="text-sm font-semibold">{data.projet.codeInsee}</p>
								</div>

								<div class="grid grid-cols-2 gap-3">
									<div class="p-3 rounded-lg">
										<p class="text-xs mb-1 uppercase tracking-wide">Section</p>
										<p class="text-sm font-medium">{data.projet.section}</p>
									</div>
									<div class="p-3 rounded-lg">
										<p class="text-xs mb-1 uppercase tracking-wide">Parcelle</p>
										<p class="text-sm font-medium">{data.projet.parcelle}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Colonne droite -->
				<div class="space-y-5">
					<!-- Planning -->
					<div class="card bg-base-100 w-96 shadow-sm">
						<div class="card-body">
							<div class="flex items-center gap-2.5 mb-4">
								<h2 class="text-base font-semibold">Planning</h2>
							</div>

							<div class="space-y-3">
								<div class="p-3 rounded-lg border border-blue-100">
									<p class="text-xs text-blue-600 mb-1 uppercase tracking-wide font-medium">
										Démarrage
									</p>
									<p class="text-sm font-semibold">
										{formatDate(data.projet.dateDemarrage)}
									</p>
								</div>

								{#if data.projet.dateDeFin}
									<div class="p-3 rounded-lg border border-purple-100">
										<p class="text-xs text-purple-600 mb-1 uppercase tracking-wide font-medium">
											Fin prévue
										</p>
										<p class="text-sm font-semibold">
											{formatDate(data.projet.dateDeFin)}
										</p>
									</div>
								{/if}
							</div>
						</div>
					</div>

					<!-- Intervenants -->
					<div class="card bg-base-100 w-96 shadow-sm">
						<div class="card-body">
							<div class="flex items-center gap-2.5 mb-4">
								<h2 class="text-base font-semibold">Intervenants</h2>
							</div>

							<div class="space-y-3">
								{#if data.projet.etablissementNom}
									<div class="p-3 rounded-lg">
										<p class="">Établissement</p>
										<p>
											{data.projet.etablissementNom}
										</p>
									</div>
								{/if}

								<div class="p-3 rounded-lg">
									<p class="">Maître d'ouvrage</p>
									<p>{data.projet.maitreDOuvrage}</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Type opération -->
					{#if data.projet.typeOperation}
						<div class=" rounded-xl p-5 text-white">
							<div class="flex items-center gap-2.5 mb-3">
								<div class="p-2 backdrop-blur-sm rounded-lg">
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
