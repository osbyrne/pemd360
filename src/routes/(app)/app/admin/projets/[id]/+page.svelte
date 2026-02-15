<script lang="ts">
	import { ArrowLeft, Edit, Trash2, Building2, MapPin, Calendar, FileText } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: ({ projet } = data);

	function formatDate(date: Date | number | null): string {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Projet · {projet.libelle}</title>
</svelte:head>

<div class="font-[Poppins] max-w-4xl mx-auto px-4 py-8">
	<!-- Fil d'ariane / Retour -->
	<div class="mb-8">
		<a
			href="/app/admin/projets"
			class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour à la liste
		</a>
	</div>

	<!-- Header -->
	<div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">{projet.libelle}</h1>
			<p class="text-sm text-gray-500 mt-1">Référence: {projet.reference}</p>
			<p
				class="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded mt-2 inline-block"
			>
				ID Matterport: {projet.id}
			</p>
		</div>
		<div class="flex gap-3">
			<a
				href="/app/admin/projets/{projet.id}/modifier"
				class="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
			>
				<Edit class="h-4 w-4" />
				Modifier
			</a>
		</div>
	</div>

	<!-- Informations générales -->
	<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="p-2 bg-blue-50 rounded-lg">
				<FileText class="h-6 w-6 text-blue-600" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900">Informations générales</h2>
		</div>

		<dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<dt class="text-sm font-medium text-gray-500">Référence</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.reference}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Libellé</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.libelle}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Type d'opération</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.typeOperation || '-'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Maître d'ouvrage</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.maitreDOuvrage || '-'}</dd>
			</div>
		</dl>
	</div>

	<!-- Établissement & Société -->
	<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="p-2 bg-purple-50 rounded-lg">
				<Building2 class="h-6 w-6 text-purple-600" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900">Établissement & Société</h2>
		</div>

		<dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<dt class="text-sm font-medium text-gray-500">Établissement</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.etablissementNom || '-'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Ville de l'établissement</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.etablissementVille || '-'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Société</dt>
				<dd class="mt-1">
					{#if projet.societeNom}
						<span
							class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
						>
							{projet.societeNom}
						</span>
					{:else}
						<span class="text-sm text-gray-900">-</span>
					{/if}
				</dd>
			</div>
		</dl>
	</div>

	<!-- Localisation -->
	<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
		<div class="flex items-center gap-3 mb-6">
			<div class="p-2 bg-emerald-50 rounded-lg">
				<MapPin class="h-6 w-6 text-emerald-600" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900">Localisation</h2>
		</div>

		<dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="md:col-span-2">
				<dt class="text-sm font-medium text-gray-500">Adresse</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.rue}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Code Postal</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.cp}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Ville</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.ville}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Code INSEE</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.codeInsee || '-'}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Section cadastrale</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.section}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Parcelle</dt>
				<dd class="mt-1 text-sm text-gray-900">{projet.parcelle}</dd>
			</div>
		</dl>
	</div>

	<!-- Dates -->
	<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
		<div class="flex items-center gap-3 mb-6">
			<div class="p-2 bg-amber-50 rounded-lg">
				<Calendar class="h-6 w-6 text-amber-600" />
			</div>
			<h2 class="text-xl font-semibold text-gray-900">Planning</h2>
		</div>

		<dl class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<dt class="text-sm font-medium text-gray-500">Date de démarrage</dt>
				<dd class="mt-1 text-sm text-gray-900">{formatDate(projet.dateDemarrage)}</dd>
			</div>
			<div>
				<dt class="text-sm font-medium text-gray-500">Date de fin</dt>
				<dd class="mt-1 text-sm text-gray-900">{formatDate(projet.dateDeFin)}</dd>
			</div>
		</dl>
	</div>
</div>
