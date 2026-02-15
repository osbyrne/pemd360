<script lang="ts">
	import CerfaTabs from '$lib/components/CerfaTabs.svelte';
	import {
		Building2,
		UserCircle,
		MapPin,
		CalendarDays,
		Edit2,
		X,
		Download,
		FileText
	} from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Get projetId from URL params
	const projetId = $derived($page.url.searchParams.get('projetId') || '');

	// Filter data for the specific project
	const projectData = $derived(
		data.list.find((item) => item.projetId === projetId) || data.list[0]
	);

	// Modal state
	let showOperationModal = $state(false);
	let showMoaModal = $state(false);
	let showDiagnostiqueurModal = $state(false);
	let showDiagnosticModal = $state(false);

	// Form state for operation
	let operationForm = $state({
		adresse: '',
		cp: '',
		commune: '',
		dateDebut: '',
		dateFin: '',
		operation: '',
		nbBatDemolition: 0,
		surfaceDemolir: 0,
		nbBatRenovation: 0,
		surfaceRenover: 0,
		typologies: [] as string[],
		autreType: '',
		datePermis: '',
		operationsSoumis: [] as string[],
		dateRenovation: ''
	});

	// Form state for Maître d'Ouvrage
	let moaForm = $state({
		typePersonne: 'morale' as 'physique' | 'morale',
		adresse: '',
		cp: '',
		commune: '',
		nom: '',
		prenom: '',
		raisonSociale: '',
		siretSiren: ''
	});

	// Form state for Diagnostiqueur
	let diagnostiqueurForm = $state({
		typePersonne: 'morale' as 'physique' | 'morale',
		adresse: '',
		cp: '',
		commune: '',
		nom: '',
		prenom: '',
		raisonSociale: '',
		siretSiren: '',
		engagementAssurance: false,
		nomAssurance: '',
		numeroPolice: '',
		dateDebutAssurance: '',
		dateFinAssurance: '',
		competences: false
	});

	// Form state for Diagnostic
	let diagnosticForm = $state({
		derniereVisite: '',
		batVisite: '',
		batNonVisite: '',
		raisonsNePasVisite: '',
		desordres: false,
		precaution: false,
		documentsConsultes: [] as string[],
		autreDocument: ''
	});

	function openOperationModal() {
		// Initialize form with current project data
		operationForm = {
			adresse: projectData?.operationAdresse || '',
			cp: projectData?.operationCp || '',
			commune: projectData?.operationCommune || '',
			dateDebut: projectData?.operationDateDebut
				? new Date(projectData.operationDateDebut).toISOString().split('T')[0]
				: '',
			dateFin: projectData?.operationDateFin
				? new Date(projectData.operationDateFin).toISOString().split('T')[0]
				: '',
			operation: projectData?.operationType || '',
			nbBatDemolition: projectData?.operationNbBatDemolition || 0,
			surfaceDemolir: projectData?.operationSurfaceDemolir || 0,
			nbBatRenovation: projectData?.operationNbBatRenovation || 0,
			surfaceRenover: projectData?.operationSurfaceRenover || 0,
			typologies: [],
			autreType: '',
			datePermis: projectData?.datePermis
				? new Date(projectData.datePermis).toISOString().split('T')[0]
				: '',
			operationsSoumis: [],
			dateRenovation: ''
		};
		showOperationModal = true;
	}

	function closeOperationModal() {
		showOperationModal = false;
	}

	function handleOperationSubmit() {
		// TODO: Implement save logic
		console.log('Saving operation data:', operationForm);
		closeOperationModal();
	}

	function openMoaModal() {
		moaForm = {
			typePersonne: projectData?.moaNom ? 'morale' : 'physique',
			adresse: projectData?.moaAdresse || '',
			cp: projectData?.moaCp?.toString() || '',
			commune: projectData?.moaCommune || '',
			nom: projectData?.moaNomPhy || '',
			prenom: projectData?.moaPrenomPhy || '',
			raisonSociale: projectData?.moaNom || '',
			siretSiren: projectData?.moaSiretSiren || ''
		};
		showMoaModal = true;
	}

	function closeMoaModal() {
		showMoaModal = false;
	}

	function handleMoaSubmit() {
		// TODO: Implement save logic
		console.log('Saving MOA data:', moaForm);
		closeMoaModal();
	}

	function openDiagnostiqueurModal() {
		diagnostiqueurForm = {
			typePersonne: projectData?.diagnostiqueurNom ? 'morale' : 'physique',
			adresse: projectData?.diagnostiqueurAdresse || '',
			cp: projectData?.diagnostiqueurCp || '',
			commune: projectData?.diagnostiqueurCommune || '',
			nom: projectData?.diagnostiqueurNomPhy || '',
			prenom: projectData?.diagnostiqueurPrenomPhy || '',
			raisonSociale: projectData?.diagnostiqueurNom || '',
			siretSiren: projectData?.diagnostiqueurSiretSiren || '',
			engagementAssurance: false,
			nomAssurance: '',
			numeroPolice: '',
			dateDebutAssurance: '',
			dateFinAssurance: '',
			competences: false
		};
		showDiagnostiqueurModal = true;
	}

	function closeDiagnostiqueurModal() {
		showDiagnostiqueurModal = false;
	}

	function handleDiagnostiqueurSubmit() {
		// TODO: Implement save logic
		console.log('Saving Diagnostiqueur data:', diagnostiqueurForm);
		closeDiagnostiqueurModal();
	}

	function openDiagnosticModal() {
		diagnosticForm = {
			derniereVisite: projectData?.diagnosticDerniereVisite
				? new Date(projectData.diagnosticDerniereVisite).toISOString().split('T')[0]
				: '',
			batVisite: projectData?.diagnosticBatVisite || '',
			batNonVisite: projectData?.diagnosticBatNonVisite || '',
			raisonsNePasVisite: projectData?.diagnosticRaisonsNePasVisite || '',
			desordres: !!projectData?.diagnosticDesordres,
			precaution: !!projectData?.diagnosticPrecaution,
			documentsConsultes: [],
			autreDocument: ''
		};
		showDiagnosticModal = true;
	}

	function closeDiagnosticModal() {
		showDiagnosticModal = false;
	}

	function handleDiagnosticSubmit() {
		// TODO: Implement save logic
		console.log('Saving Diagnostic data:', diagnosticForm);
		closeDiagnosticModal();
	}
</script>

<svelte:head>
	<title>CERFA · Informations</title>
</svelte:head>

<div class="p-6 max-w-7xl mx-auto">
	<CerfaTabs />

	<!-- Header Section -->
	<div class="mb-8 flex justify-between items-start">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Partie Informations</h1>
			<p class="text-gray-600 mt-2">
				Informations administratives du projet : Maîtrise d'ouvrage, Opération, Diagnostiqueur
			</p>
		</div>
	</div>

	{#if projectData}
		<!-- Project Name Banner -->
		<div
			class="mb-6 bg-linear-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
		>
			<div class="flex items-center gap-4">
				<div class="bg-white/20 p-3 rounded-lg">
					<Building2 class="w-8 h-8" />
				</div>
				<div>
					<p class="text-emerald-100 text-sm font-medium">Projet actuel</p>
					<h2 class="text-2xl font-bold">{projectData.projetNom || 'Projet sans nom'}</h2>
				</div>
			</div>
		</div>

		<!-- Main Content Grid -->
		<div class="grid lg:grid-cols-2 gap-6">
			<!-- Left Column -->
			<div class="space-y-6">
				<!-- Section: Maître d'Ouvrage -->
				<div
					class="bg-white rounded-xl border-2 border-blue-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
				>
					<div
						class="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4 flex justify-between items-center"
					>
						<div class="flex items-center gap-3">
							<div class="bg-blue-500 p-2 rounded-lg">
								<Building2 class="w-5 h-5 text-white" />
							</div>
							<h2 class="text-lg font-bold text-blue-900">Maître d'Ouvrage</h2>
						</div>
						<button
							onclick={openMoaModal}
							class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
						>
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</button>
					</div>
					<div class="p-6">
						{#if projectData.moaNom || projectData.moaNomPhy}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<UserCircle class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
											Identité
										</p>
										<p class="font-semibold text-gray-900">
											{projectData.moaNom ||
												`${projectData.moaPrenomPhy || ''} ${projectData.moaNomPhy || ''}`}
										</p>
									</div>
								</div>
								{#if projectData.moaAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
												Adresse
											</p>
											<p class="text-gray-900">{projectData.moaAdresse}</p>
											<p class="text-sm text-gray-600">
												{projectData.moaCp || ''}
												{projectData.moaCommune || ''}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<UserCircle class="w-12 h-12 text-gray-300 mx-auto mb-3" />
								<p class="text-gray-400 italic">Non renseigné</p>
								<p class="text-sm text-gray-500 mt-1">
									Cliquez sur "Modifier" pour ajouter les informations
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Section: Diagnostiqueur -->
				<div
					class="bg-white rounded-xl border-2 border-purple-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
				>
					<div
						class="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 px-6 py-4 flex justify-between items-center"
					>
						<div class="flex items-center gap-3">
							<div class="bg-purple-500 p-2 rounded-lg">
								<UserCircle class="w-5 h-5 text-white" />
							</div>
							<h2 class="text-lg font-bold text-purple-900">Diagnostiqueur</h2>
						</div>
						<button
							onclick={openDiagnostiqueurModal}
							class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:scale-105 shadow-sm"
						>
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</button>
					</div>
					<div class="p-6">
						{#if projectData.diagnostiqueurNom || projectData.diagnostiqueurNomPhy}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<UserCircle class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
											Identité
										</p>
										<p class="font-semibold text-gray-900">
											{projectData.diagnostiqueurNom ||
												`${projectData.diagnostiqueurPrenomPhy || ''} ${projectData.diagnostiqueurNomPhy || ''}`}
										</p>
									</div>
								</div>
								{#if projectData.diagnostiqueurAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
												Adresse
											</p>
											<p class="text-gray-900">{projectData.diagnostiqueurAdresse}</p>
											<p class="text-sm text-gray-600">
												{projectData.diagnostiqueurCp || ''}
												{projectData.diagnostiqueurCommune || ''}
											</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-center py-8">
								<UserCircle class="w-12 h-12 text-gray-300 mx-auto mb-3" />
								<p class="text-gray-400 italic">Non renseigné</p>
								<p class="text-sm text-gray-500 mt-1">
									Cliquez sur "Modifier" pour ajouter les informations
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right Column -->
			<div class="space-y-6">
				<!-- Section: Le diagnostic -->
				<div
					class="bg-white rounded-xl border-2 border-teal-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
				>
					<div
						class="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200 px-6 py-4 flex justify-between items-center"
					>
						<div class="flex items-center gap-3">
							<div class="bg-teal-500 p-2 rounded-lg">
								<CalendarDays class="w-5 h-5 text-white" />
							</div>
							<h2 class="text-lg font-bold text-teal-900">Le diagnostic</h2>
						</div>
						<button
							onclick={openDiagnosticModal}
							class="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all hover:scale-105 shadow-sm"
						>
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</button>
					</div>
					<div class="p-6">
						{#if projectData.diagnosticDerniereVisite}
							<div class="space-y-3">
								<div class="flex items-start gap-3">
									<CalendarDays class="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
									<div class="flex-1">
										<p class="text-xs font-medium text-teal-600 uppercase tracking-wide mb-1">
											Dernière visite
										</p>
										<p class="font-semibold text-gray-900">
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
								<CalendarDays class="w-12 h-12 text-gray-300 mx-auto mb-3" />
								<p class="text-gray-400 italic">Non renseigné</p>
								<p class="text-sm text-gray-500 mt-1">
									Cliquez sur "Modifier" pour ajouter les informations
								</p>
							</div>
						{/if}
					</div>
				</div>

				<!-- Section: L'opération -->
				<div
					class="bg-white rounded-xl border-2 border-amber-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
				>
					<div
						class="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200 px-6 py-4 flex justify-between items-center"
					>
						<div class="flex items-center gap-3">
							<div class="bg-amber-500 p-2 rounded-lg">
								<MapPin class="w-5 h-5 text-white" />
							</div>
							<h2 class="text-lg font-bold text-amber-900">L'opération</h2>
						</div>
						<button
							onclick={openOperationModal}
							class="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all hover:scale-105 shadow-sm"
						>
							<Edit2 class="w-4 h-4" />
							<span class="text-sm font-medium">Modifier</span>
						</button>
					</div>
					<div class="p-6">
						{#if projectData.operationAdresse || projectData.datePermis}
							<div class="space-y-4">
								{#if projectData.operationAdresse}
									<div class="flex items-start gap-3">
										<MapPin class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Localisation
											</p>
											<p class="font-semibold text-gray-900">{projectData.operationAdresse}</p>
											<p class="text-sm text-gray-600">
												{projectData.operationCp || ''}
												{projectData.operationCommune || ''}
											</p>
										</div>
									</div>
								{/if}
								{#if projectData.operationType}
									<div class="flex items-start gap-3">
										<Building2 class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Type d'opération
											</p>
											<p class="text-gray-900">{projectData.operationType}</p>
										</div>
									</div>
								{/if}
								{#if projectData.datePermis}
									<div class="flex items-start gap-3">
										<CalendarDays class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
										<div class="flex-1">
											<p class="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">
												Permis de construire
											</p>
											<p class="font-semibold text-gray-900">
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
												<span class="font-medium text-gray-900"
													>Du {new Date(projectData.operationDateDebut).toLocaleDateString(
														'fr-FR'
													)}</span
												>
											{/if}
											{#if projectData.operationDateFin}
												<span class="text-gray-600"
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
								<MapPin class="w-12 h-12 text-gray-300 mx-auto mb-3" />
								<p class="text-gray-400 italic">Non renseigné</p>
								<p class="text-sm text-gray-500 mt-1">
									Cliquez sur "Modifier" pour ajouter les informations
								</p>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-xl border border-gray-200 p-12 text-center">
			<p class="text-gray-500">Aucune donnée disponible pour ce projet.</p>
		</div>
	{/if}
</div>

<!-- Modal for Operation -->
{#if showOperationModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeOperationModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Modal Header -->
			<div
				class="bg-amber-50 border-b border-amber-100 px-6 py-4 flex justify-between items-center"
			>
				<h3 class="text-xl font-semibold text-amber-900">Modifier l'opération</h3>
				<button
					onclick={closeOperationModal}
					class="p-2 hover:bg-amber-100 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-amber-900" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				<form class="space-y-6">
					<!-- Adresse -->
					<div class="grid grid-cols-1 gap-4">
						<div>
							<label for="operation-adresse" class="block text-sm font-medium text-gray-700 mb-2"
								>Adresse</label
							>
							<input
								id="operation-adresse"
								type="text"
								bind:value={operationForm.adresse}
								placeholder="Adresse"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="operation-cp" class="block text-sm font-medium text-gray-700 mb-2"
									>Code postal</label
								>
								<input
									id="operation-cp"
									type="text"
									bind:value={operationForm.cp}
									placeholder="Code postal"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label for="operation-commune" class="block text-sm font-medium text-gray-700 mb-2"
									>Commune</label
								>
								<input
									id="operation-commune"
									type="text"
									bind:value={operationForm.commune}
									placeholder="Commune"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Dates -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="operation-date-debut" class="block text-sm font-medium text-gray-700 mb-2"
								>Date de début</label
							>
							<input
								id="operation-date-debut"
								type="date"
								bind:value={operationForm.dateDebut}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label for="operation-date-fin" class="block text-sm font-medium text-gray-700 mb-2"
								>Date de fin</label
							>
							<input
								id="operation-date-fin"
								type="date"
								bind:value={operationForm.dateFin}
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
							/>
						</div>
					</div>

					<!-- Type d'opération -->
					<div>
						<label for="operation-type" class="block text-sm font-medium text-gray-700 mb-2"
							>L'opération est-elle</label
						>
						<select
							id="operation-type"
							bind:value={operationForm.operation}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
						>
							<option value="">Sélectionnez...</option>
							<option value="demolition">Démolition</option>
							<option value="renovation">Rénovation</option>
							<option value="mixte">Mixte (Démolition + Rénovation)</option>
						</select>
					</div>

					<!-- Démolition -->
					<div class="bg-red-50 rounded-lg p-4 space-y-4">
						<h4 class="font-semibold text-red-900">Démolition</h4>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label
									for="demolition-nb-bat"
									class="block text-sm font-medium text-gray-700 mb-2"
									>Nombre de bâtiments concernés</label
								>
								<input
									id="demolition-nb-bat"
									type="number"
									bind:value={operationForm.nbBatDemolition}
									placeholder="NB BATs"
									min="0"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label
									for="demolition-surface"
									class="block text-sm font-medium text-gray-700 mb-2"
									>Surface totale de plancher (m²)</label
								>
								<input
									id="demolition-surface"
									type="number"
									bind:value={operationForm.surfaceDemolir}
									placeholder="m²"
									min="0"
									step="0.01"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Rénovation -->
					<div class="bg-blue-50 rounded-lg p-4 space-y-4">
						<h4 class="font-semibold text-blue-900">Rénovation significative</h4>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label
									for="renovation-nb-bat"
									class="block text-sm font-medium text-gray-700 mb-2"
									>Nombre de bâtiments concernés</label
								>
								<input
									id="renovation-nb-bat"
									type="number"
									bind:value={operationForm.nbBatRenovation}
									placeholder="NB BATs"
									min="0"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label
									for="renovation-surface"
									class="block text-sm font-medium text-gray-700 mb-2"
									>Surface totale de plancher (m²)</label
								>
								<input
									id="renovation-surface"
									type="number"
									bind:value={operationForm.surfaceRenover}
									placeholder="m²"
									min="0"
									step="0.01"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Typologies -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Typologies principales des bâtiments</label
						>
						<div class="grid grid-cols-2 gap-3">
							{#each ['Maison individuelle', 'Logement collectif', 'Commerces', 'Bureaux', 'Bâtiment industriel', 'Établissement de santé', "Établissement d'enseignement", 'Café, hôtel, restaurants', 'Bâtiment à usage sportif ou de loisirs', 'ICPE', 'Autre'] as typologie}
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										value={typologie}
										checked={operationForm.typologies.includes(typologie)}
										onchange={(e) => {
											if (e.currentTarget.checked) {
												operationForm.typologies = [...operationForm.typologies, typologie];
											} else {
												operationForm.typologies = operationForm.typologies.filter(
													(t) => t !== typologie
												);
											}
										}}
										class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
									/>
									<span class="text-sm text-gray-700">{typologie}</span>
								</label>
							{/each}
						</div>
						{#if operationForm.typologies.includes('Autre')}
							<input
								type="text"
								bind:value={operationForm.autreType}
								placeholder="Précisez le type"
								class="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
							/>
						{/if}
					</div>

					<!-- Date permis -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Date d'obtention du permis de construction du bâtiment le plus ancien</label
						>
						<input
							type="date"
							bind:value={operationForm.datePermis}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
						/>
					</div>

					<!-- Opérations soumises -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">
							Cochez, s'il y en a eu, le(s) type(s) d'opération(s) auxquel(s) le bâtiment a été
							soumis depuis la date mentionnée ci-dessus :
						</label>
						<div class="space-y-2">
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									value="renovation"
									checked={operationForm.operationsSoumis.includes('renovation')}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											operationForm.operationsSoumis = [
												...operationForm.operationsSoumis,
												'renovation'
											];
										} else {
											operationForm.operationsSoumis = operationForm.operationsSoumis.filter(
												(t) => t !== 'renovation'
											);
										}
									}}
									class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
								/>
								<span class="text-sm text-gray-700">Rénovation importante</span>
							</label>
							{#if operationForm.operationsSoumis.includes('renovation')}
								<input
									type="month"
									bind:value={operationForm.dateRenovation}
									placeholder="MM/AAAA"
									class="ml-6 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
								/>
							{/if}
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									value="decontamination"
									checked={operationForm.operationsSoumis.includes('decontamination')}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											operationForm.operationsSoumis = [
												...operationForm.operationsSoumis,
												'decontamination'
											];
										} else {
											operationForm.operationsSoumis = operationForm.operationsSoumis.filter(
												(t) => t !== 'decontamination'
											);
										}
									}}
									class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
								/>
								<span class="text-sm text-gray-700"
									>Opération de décontamination (ex: désamiantage)</span
								>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									value="autre"
									checked={operationForm.operationsSoumis.includes('autre')}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											operationForm.operationsSoumis = [...operationForm.operationsSoumis, 'autre'];
										} else {
											operationForm.operationsSoumis = operationForm.operationsSoumis.filter(
												(t) => t !== 'autre'
											);
										}
									}}
									class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
								/>
								<span class="text-sm text-gray-700">Autre intervention importante</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									value="aucune"
									checked={operationForm.operationsSoumis.includes('aucune')}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											operationForm.operationsSoumis = [
												...operationForm.operationsSoumis,
												'aucune'
											];
										} else {
											operationForm.operationsSoumis = operationForm.operationsSoumis.filter(
												(t) => t !== 'aucune'
											);
										}
									}}
									class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
								/>
								<span class="text-sm text-gray-700">Aucune opération</span>
							</label>
							<label class="flex items-center gap-2">
								<input
									type="checkbox"
									value="ne_sait_pas"
									checked={operationForm.operationsSoumis.includes('ne_sait_pas')}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											operationForm.operationsSoumis = [
												...operationForm.operationsSoumis,
												'ne_sait_pas'
											];
										} else {
											operationForm.operationsSoumis = operationForm.operationsSoumis.filter(
												(t) => t !== 'ne_sait_pas'
											);
										}
									}}
									class="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
								/>
								<span class="text-sm text-gray-700">Ne sait pas</span>
							</label>
						</div>
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
				<button
					onclick={closeOperationModal}
					class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
				>
					Annuler
				</button>
				<button
					onclick={handleOperationSubmit}
					class="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
				>
					Valider
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal for Maître d'Ouvrage -->
{#if showMoaModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeMoaModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Modal Header -->
			<div class="bg-blue-50 border-b border-blue-100 px-6 py-4 flex justify-between items-center">
				<h3 class="text-xl font-semibold text-blue-900">Le diagnostic</h3>
				<button onclick={closeMoaModal} class="p-2 hover:bg-blue-100 rounded-lg transition-colors">
					<X class="w-5 h-5 text-blue-900" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				<form class="space-y-6">
					<!-- Adresse -->
					<div class="grid grid-cols-1 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
							<input
								type="text"
								bind:value={moaForm.adresse}
								placeholder="adresse"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
								<input
									type="text"
									bind:value={moaForm.cp}
									placeholder="Code postal"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Commune</label>
								<input
									type="text"
									bind:value={moaForm.commune}
									placeholder="Commune"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Type de personne selector -->
					<div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								bind:group={moaForm.typePersonne}
								value="physique"
								class="w-4 h-4 text-blue-600"
							/>
							<span class="font-medium text-gray-700">Personne physique</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								bind:group={moaForm.typePersonne}
								value="morale"
								class="w-4 h-4 text-blue-600"
							/>
							<span class="font-medium text-gray-700">Personne morale</span>
						</label>
					</div>

					{#if moaForm.typePersonne === 'physique'}
						<!-- Si personne physique -->
						<div class="bg-blue-50 rounded-lg p-4 space-y-4">
							<h4 class="font-semibold text-blue-900">Si personne physique</h4>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
								<input
									type="text"
									bind:value={moaForm.nom}
									placeholder="Nom"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
								<input
									type="text"
									bind:value={moaForm.prenom}
									placeholder="Prénom"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
					{:else}
						<!-- Si personne morale -->
						<div class="bg-blue-50 rounded-lg p-4 space-y-4">
							<h4 class="font-semibold text-blue-900">Si personne morale</h4>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Raison sociale</label>
								<input
									type="text"
									bind:value={moaForm.raisonSociale}
									placeholder="Raison sociale"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2"
									>Numéro de Siret ou Siren</label
								>
								<input
									type="text"
									bind:value={moaForm.siretSiren}
									placeholder="Siret ou Siren"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>
					{/if}
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
				<button
					onclick={closeMoaModal}
					class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
				>
					Annuler
				</button>
				<button
					onclick={handleMoaSubmit}
					class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
				>
					Valider
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal for Diagnostiqueur -->
{#if showDiagnostiqueurModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeDiagnostiqueurModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Modal Header -->
			<div
				class="bg-purple-50 border-b border-purple-100 px-6 py-4 flex justify-between items-center"
			>
				<h3 class="text-xl font-semibold text-purple-900">Le diagnostiqueur</h3>
				<button
					onclick={closeDiagnostiqueurModal}
					class="p-2 hover:bg-purple-100 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-purple-900" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				<form class="space-y-6">
					<!-- Adresse -->
					<div class="grid grid-cols-1 gap-4">
						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
							<input
								type="text"
								bind:value={diagnostiqueurForm.adresse}
								placeholder="adresse"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
								<input
									type="text"
									bind:value={diagnostiqueurForm.cp}
									placeholder="Code postal"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Commune</label>
								<input
									type="text"
									bind:value={diagnostiqueurForm.commune}
									placeholder="Commune"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Type de personne selector -->
					<div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								bind:group={diagnostiqueurForm.typePersonne}
								value="physique"
								class="w-4 h-4 text-purple-600"
							/>
							<span class="font-medium text-gray-700">Personne physique</span>
						</label>
						<label class="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								bind:group={diagnostiqueurForm.typePersonne}
								value="morale"
								class="w-4 h-4 text-purple-600"
							/>
							<span class="font-medium text-gray-700">Personne morale</span>
						</label>
					</div>

					{#if diagnostiqueurForm.typePersonne === 'physique'}
						<!-- Si personne physique -->
						<div class="bg-purple-50 rounded-lg p-4 space-y-4">
							<h4 class="font-semibold text-purple-900">Si personne physique</h4>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Nom</label>
								<input
									type="text"
									bind:value={diagnostiqueurForm.nom}
									placeholder="Nom"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
								<input
									type="text"
									bind:value={diagnostiqueurForm.prenom}
									placeholder="Prénom"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
						</div>
					{:else}
						<!-- Si personne morale -->
						<div class="bg-purple-50 rounded-lg p-4 space-y-4">
							<h4 class="font-semibold text-purple-900">Si personne morale</h4>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">Raison sociale</label>
								<input
									type="text"
									bind:value={diagnostiqueurForm.raisonSociale}
									placeholder="Raison sociale"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2"
									>Numéro de Siret ou Siren</label
								>
								<input
									type="text"
									bind:value={diagnostiqueurForm.siretSiren}
									placeholder="Siret ou Siren"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
						</div>
					{/if}

					<!-- Assurance souscrite -->
					<div class="border-t border-gray-200 pt-6 space-y-4">
						<h4 class="font-semibold text-gray-900">Assurance souscrite par le diagnostiqueur</h4>
						<label class="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={diagnostiqueurForm.engagementAssurance}
								class="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
							/>
							<span class="text-sm text-gray-700">
								Je déclare qu'en cas de sinistre l'assurance souscrite couvre les activités du
								diagnostiqueur et que le montant de la garantie est d'au moins 300 000 € par
								sinistre et 500 000 € par année d'assurance.
							</span>
						</label>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2"
								>Nom de la compagnie d'assurance</label
							>
							<input
								type="text"
								bind:value={diagnostiqueurForm.nomAssurance}
								placeholder="Nom de la compagnie d'assurance"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Numéro de police</label>
							<input
								type="text"
								bind:value={diagnostiqueurForm.numeroPolice}
								placeholder="Numéro de police"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>

						<div>
							<label class="block text-sm font-medium text-gray-700 mb-2">Date de validité</label>
							<div class="grid grid-cols-2 gap-4">
								<input
									type="date"
									bind:value={diagnostiqueurForm.dateDebutAssurance}
									placeholder="jj/mm/aaaa"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
								<input
									type="date"
									bind:value={diagnostiqueurForm.dateFinAssurance}
									placeholder="jj/mm/aaaa"
									class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
								/>
							</div>
						</div>
					</div>

					<!-- Compétences -->
					<div class="border-t border-gray-200 pt-6">
						<label class="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={diagnostiqueurForm.competences}
								class="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
							/>
							<span class="text-sm text-gray-700">
								Je déclare pouvoir justifier des compétences du diagnostiqueur à la demande de
								l'administration. (3)
							</span>
						</label>
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
				<button
					onclick={closeDiagnostiqueurModal}
					class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
				>
					Annuler
				</button>
				<button
					onclick={handleDiagnostiqueurSubmit}
					class="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
				>
					Valider
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Modal for Diagnostic -->
{#if showDiagnosticModal}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={closeDiagnosticModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Modal Header -->
			<div class="bg-teal-50 border-b border-teal-100 px-6 py-4 flex justify-between items-center">
				<h3 class="text-xl font-semibold text-teal-900">diagnostic</h3>
				<button
					onclick={closeDiagnosticModal}
					class="p-2 hover:bg-teal-100 rounded-lg transition-colors"
				>
					<X class="w-5 h-5 text-teal-900" />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
				<form class="space-y-6">
					<!-- Date de la dernière visite -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Date de la dernière visite de l'opération</label
						>
						<input
							type="date"
							bind:value={diagnosticForm.derniereVisite}
							placeholder="jj/mm/aaaa"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
						/>
					</div>

					<!-- Bâtiments visitées -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Les bâtiments ou parties de bâtiments visitées par le diagnostiqueur</label
						>
						<textarea
							bind:value={diagnosticForm.batVisite}
							placeholder="parties de bâtiments visitées"
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Bâtiments non visitées -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Les bâtiments ou parties de bâtiments non visitées par le diagnostiqueur</label
						>
						<textarea
							bind:value={diagnosticForm.batNonVisite}
							placeholder="parties de bâtiments non visitées"
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Raisons -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Raisons pour n'avoir pas visité ces parties</label
						>
						<textarea
							bind:value={diagnosticForm.raisonsNePasVisite}
							placeholder="Raisons"
							rows="3"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
						></textarea>
					</div>

					<!-- Vices ou désordres -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Le diagnostic a-t-il identifié des vices ou des désordres apparents dans des
							composants des bâtiments ?</label
						>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									bind:group={diagnosticForm.desordres}
									value={true}
									class="w-4 h-4 text-teal-600"
								/>
								<span class="text-gray-700">Oui</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									bind:group={diagnosticForm.desordres}
									value={false}
									class="w-4 h-4 text-teal-600"
								/>
								<span class="text-gray-700">Non</span>
							</label>
						</div>
					</div>

					<!-- Précautions -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2"
							>Le rapport de diagnostic fournit-il des indications sur les précautions de démolition
							ou de rénovation ?</label
						>
						<div class="flex gap-4">
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									bind:group={diagnosticForm.precaution}
									value={true}
									class="w-4 h-4 text-teal-600"
								/>
								<span class="text-gray-700">Oui</span>
							</label>
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									bind:group={diagnosticForm.precaution}
									value={false}
									class="w-4 h-4 text-teal-600"
								/>
								<span class="text-gray-700">Non</span>
							</label>
						</div>
					</div>

					<!-- Documents consultés -->
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-2">Documents consultés</label>
						<div class="space-y-2">
							{#each ['Dossier des Ouvrages Exécutés (DOE) des bâtiments existants', 'Plans', 'Diagnostic amiante', 'Diagnostic plomb', 'Diagnostic termites', 'Autre'] as doc}
								<label class="flex items-center gap-2">
									<input
										type="checkbox"
										value={doc}
										checked={diagnosticForm.documentsConsultes.includes(doc)}
										onchange={(e) => {
											if (e.currentTarget.checked) {
												diagnosticForm.documentsConsultes = [
													...diagnosticForm.documentsConsultes,
													doc
												];
											} else {
												diagnosticForm.documentsConsultes =
													diagnosticForm.documentsConsultes.filter((d) => d !== doc);
											}
										}}
										class="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
									/>
									<span class="text-sm text-gray-700">{doc}</span>
								</label>
							{/each}
						</div>
						{#if diagnosticForm.documentsConsultes.includes('Autre')}
							<input
								type="text"
								bind:value={diagnosticForm.autreDocument}
								placeholder="Autre document"
								class="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
							/>
						{/if}
					</div>
				</form>
			</div>

			<!-- Modal Footer -->
			<div class="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
				<button
					onclick={closeDiagnosticModal}
					class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
				>
					Annuler
				</button>
				<button
					onclick={handleDiagnosticSubmit}
					class="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
				>
					Valider
				</button>
			</div>
		</div>
	</div>
{/if}
