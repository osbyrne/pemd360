<script lang="ts">
	import CerfaTabs from '$lib/components/CerfaTabs.svelte';
	import { Building2, UserCircle, MapPin, CalendarDays, Edit2 } from 'lucide-svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const projetId = $derived($page.url.searchParams.get('projetId') || '');

	const projectData = $derived(
		data.list.find((item) => item.projetId === projetId) || data.list[0]
	);
</script>

<svelte:head>
	<title>CERFA · Informations</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<CerfaTabs />
	<div class="mb-8 flex justify-between items-start">
		<div>
			<h1 class="text-3xl font-bold">Partie Informations</h1>
			<p>Informations administratives du projet : Maîtrise d'ouvrage, Opération, Diagnostiqueur</p>
		</div>
	</div>

	{#if projectData}
		<div class="mb-6 rounded-xl shadow-lg p-6 flex items-center gap-4">
			<div>
				<p class="text-sm font-medium">Projet actuel</p>
				<h2 class="text-2xl font-bold">{projectData.projetNom || 'Projet sans nom'}</h2>
			</div>
		</div>

		<div class="grid lg:grid-cols-2 gap-6">
			<!-- Left Column -->
			<div class="space-y-6">
				<!-- Section: Maître d'Ouvrage -->
				<div class="card bg-base-100 shadow-sm">
					<div class="px-6 py-4 flex justify-between items-center">
						<div class="flex items-center gap-3">
							<Building2 class="w-5 h-5" />
							<h2>Maître d'Ouvrage</h2>
						</div>
						<a href="/app/cerfa/informations/{projectData.projetId}/maitre" class="btn">
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</a>
					</div>
					<div class="p-6">
						{#if projectData.moaNom || projectData.moaNomPhy}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<UserCircle class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
											Identité
										</p>
										<p class="font-semibold">
											{projectData.moaNom ||
												`${projectData.moaPrenomPhy || ''} ${projectData.moaNomPhy || ''}`}
										</p>
									</div>
								</div>
								{#if projectData.moaAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
												Adresse
											</p>
											<p class="">{projectData.moaAdresse}</p>
											<p class="text-sm">
												{projectData.moaCp || ''}
												{projectData.moaCommune || ''}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<UserCircle class="w-12 h-12 mx-auto mb-3" />
								<p class="italic">Non renseigné</p>
								<p class="text-sm mt-1">Cliquez sur "Modifier" pour ajouter les informations</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Section: Diagnostiqueur -->
				<div class="card bg-base-100 shadow-sm">
					<div class="px-6 py-4 flex justify-between items-center">
						<div class="flex items-center gap-3">
							<div class="bg-purple-500 p-2 rounded-lg">
								<UserCircle class="w-5 h-5 text-white" />
							</div>
							<h2>Diagnostiqueur</h2>
						</div>
						<a href="/app/cerfa/informations/{projectData.projetId}/diagnostiqueur" class="btn">
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</a>
					</div>
					<div class="p-6">
						{#if projectData.diagnostiqueurNom || projectData.diagnostiqueurNomPhy}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<UserCircle class="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
											Identité
										</p>
										<p class="font-semibold">
											{projectData.diagnostiqueurNom ||
												`${projectData.diagnostiqueurPrenomPhy || ''} ${projectData.diagnostiqueurNomPhy || ''}`}
										</p>
									</div>
								</div>
								{#if projectData.diagnostiqueurAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
												Adresse
											</p>
											<p class="">{projectData.diagnostiqueurAdresse}</p>
											<p class="text-sm">
												{projectData.diagnostiqueurCp || ''}
												{projectData.diagnostiqueurCommune || ''}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<UserCircle class="w-12 h-12 mx-auto mb-3" />
								<p class="italic">Non renseigné</p>
								<p class="text-sm mt-1">Cliquez sur "Modifier" pour ajouter les informations</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- Section: Le diagnostic -->
				<div class="card bg-base-100 shadow-sm">
					<div class="px-6 py-4 flex justify-between items-center">
						<div class="flex items-center gap-3">
							<div class="bg-teal-500 p-2 rounded-lg">
								<CalendarDays class="w-5 h-5 text-white" />
							</div>
							<h2>Le diagnostic</h2>
						</div>
						<a href="/app/cerfa/informations/{projectData.projetId}/diagnostic" class="btn">
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</a>
					</div>
					<div class="p-6">
						{#if projectData.diagnosticDerniereVisite}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<CalendarDays class="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-teal-600 uppercase tracking-wide mb-1">
											Dernière visite
										</p>
										<p class="font-semibold">
											{new Date(projectData.diagnosticDerniereVisite).toLocaleDateString('fr-FR', {
												weekday: 'long',
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</p>
									</div>
								</div>
								{#if projectData.diagnosticDesordres !== null}
									<div class="grid grid-cols-2 gap-3 mt-4">
										<div class="bg-teal-50 rounded-lg p-3">
											<p class="text-xs text-teal-700 font-medium mb-1">Désordres constatés</p>
											<p class="text-sm font-semibold text-teal-900">
												{projectData.diagnosticDesordres ? 'Oui' : 'Non'}
											</p>
										</div>
										<div class="bg-teal-50 rounded-lg p-3">
											<p class="text-xs text-teal-700 font-medium mb-1">Précautions</p>
											<p class="text-sm font-semibold text-teal-900">
												{projectData.diagnosticPrecaution ? 'Oui' : 'Non'}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<CalendarDays class="w-12 h-12 mx-auto mb-3" />
								<p class="italic">Non renseigné</p>
								<p class="text-sm mt-1">Cliquez sur "Modifier" pour ajouter les informations</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Section: L'opération -->
				<div class="card bg-base-100 shadow-sm">
					<div class="px-6 py-4 flex justify-between items-center">
						<div class="flex items-center gap-3">
							<div class="bg-amber-500 p-2 rounded-lg">
								<MapPin class="w-5 h-5 text-white" />
							</div>
							<h2>L'opération</h2>
						</div>
						<a href="/app/cerfa/informations/{projectData.projetId}/operation" class="btn">
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</a>
					</div>
					<div class="p-6">
						{#if projectData.operationAdresse || projectData.datePermis}
							<div class="space-y-4">
								{#if projectData.operationAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Localisation
											</p>
											<p class="font-semibold">{projectData.operationAdresse}</p>
											<p class="text-sm">
												{projectData.operationCp || ''}
												{projectData.operationCommune || ''}
											</p>
										</div>
									</div>
								{/if}
								{#if projectData.operationType}
									<div class="flex items-start gap-3">
										<Building2 class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Type d'opération
											</p>
											<p class="">{projectData.operationType}</p>
										</div>
									</div>
								{/if}
								{#if projectData.datePermis}
									<div class="flex items-start gap-3">
										<CalendarDays class="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Permis de construire
											</p>
											<p class="font-semibold">
												{new Date(projectData.datePermis).toLocaleDateString('fr-FR')}
											</p>
										</div>
									</div>
								{/if}
								{#if projectData.operationDateDebut || projectData.operationDateFin}
									<div class="bg-amber-50 rounded-lg p-4 mt-4">
										<p class="text-xs font-medium text-amber-700 mb-2">Période d'opération</p>
										<div class="flex items-center gap-3 text-sm">
											{#if projectData.operationDateDebut}
												<span class="font-medium"
													>Du {new Date(projectData.operationDateDebut).toLocaleDateString(
														'fr-FR'
													)}</span
												>
											{/if}
											{#if projectData.operationDateFin}
												<span class=""
													>au {new Date(projectData.operationDateFin).toLocaleDateString(
														'fr-FR'
													)}</span
												>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<MapPin class="w-12 h-12 mx-auto mb-3" />
								<p class="italic">Non renseigné</p>
								<p class="text-sm mt-1">Cliquez sur "Modifier" pour ajouter les informations</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="rounded-xl border border-gray-200 p-12 text-center">
			<p class="">Aucune donnée disponible pour ce projet.</p>
		</div>
	{/if}
</div>
