<script lang="ts">
	import { ArrowLeft, Plus } from 'lucide-svelte';
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;

	$: ({ etablissements } = data);

	let data_form = form?.data || {
		id: '',
		libelle: '',
		reference: '',
		etablissementId: '',
		codeInsee: '',
		rue: '',
		cp: '',
		ville: '',
		dateDemarrage: '',
		section: '',
		parcelle: '',
		typeOperation: '',
		maitreDOuvrage: '',
		dateDeFin: ''
	};
</script>

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

	<!-- Titre -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 mb-2">Nouveau projet</h1>
		<p class="text-sm text-gray-500">Créez un nouveau projet dans la plateforme.</p>
	</div>

	{#if form?.message}
		<div class="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
			{form.message}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-8">
		<!-- Section Identité -->
		<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="p-2 bg-emerald-50 rounded-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-emerald-600"
					>
						<path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900">Informations du projet</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-1.5 md:col-span-2">
					<label for="id" class="text-sm font-medium text-gray-700">ID Matterport *</label>
					<input
						type="text"
						id="id"
						name="id"
						value={data_form.id}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-mono"
						placeholder="ex: SxQL3iGy1rE (ID de la visite Matterport)"
					/>
					<p class="text-xs text-gray-500 mt-1">
						L'identifiant unique de la visite Matterport (visible dans l'URL de la visite)
					</p>
				</div>

				<div class="space-y-1.5">
					<label for="reference" class="text-sm font-medium text-gray-700">Référence *</label>
					<input
						type="text"
						id="reference"
						name="reference"
						value={data_form.reference}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="REF-2024-001"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="libelle" class="text-sm font-medium text-gray-700">Libellé *</label>
					<input
						type="text"
						id="libelle"
						name="libelle"
						value={data_form.libelle}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="Nom du projet"
					/>
				</div>

				<div class="space-y-1.5 md:col-span-2">
					<label for="etablissementId" class="text-sm font-medium text-gray-700"
						>Établissement *</label
					>
					<select
						id="etablissementId"
						name="etablissementId"
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
					>
						<option value="" disabled selected={!data_form.etablissementId}
							>Sélectionnez un établissement</option
						>
						{#each etablissements as etab}
							<option value={etab.id} selected={etab.id.toString() === data_form.etablissementId}>
								{etab.nom} ({etab.societeNom || 'Sans société'})
							</option>
						{/each}
					</select>
				</div>

				<div class="space-y-1.5">
					<label for="typeOperation" class="text-sm font-medium text-gray-700"
						>Type d'opération</label
					>
					<input
						type="text"
						id="typeOperation"
						name="typeOperation"
						value={data_form.typeOperation}
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="Démolition, Rénovation..."
					/>
				</div>

				<div class="space-y-1.5">
					<label for="maitreDOuvrage" class="text-sm font-medium text-gray-700"
						>Maître d'ouvrage</label
					>
					<input
						type="text"
						id="maitreDOuvrage"
						name="maitreDOuvrage"
						value={data_form.maitreDOuvrage}
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="dateDemarrage" class="text-sm font-medium text-gray-700"
						>Date de démarrage *</label
					>
					<input
						type="date"
						id="dateDemarrage"
						name="dateDemarrage"
						value={data_form.dateDemarrage}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="dateDeFin" class="text-sm font-medium text-gray-700">Date de fin</label>
					<input
						type="date"
						id="dateDeFin"
						name="dateDeFin"
						value={data_form.dateDeFin}
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
					/>
				</div>
			</div>
		</div>

		<!-- Section Localisation -->
		<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="p-2 bg-emerald-50 rounded-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="text-emerald-600"
					>
						<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle
							cx="12"
							cy="10"
							r="3"
						/>
					</svg>
				</div>
				<h2 class="text-xl font-semibold text-gray-900">Localisation</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-1.5 md:col-span-2">
					<label for="rue" class="text-sm font-medium text-gray-700">Adresse *</label>
					<input
						type="text"
						id="rue"
						name="rue"
						value={data_form.rue}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="123 rue de la Paix"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="cp" class="text-sm font-medium text-gray-700">Code Postal *</label>
					<input
						type="text"
						id="cp"
						name="cp"
						value={data_form.cp}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="75000"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="ville" class="text-sm font-medium text-gray-700">Ville *</label>
					<input
						type="text"
						id="ville"
						name="ville"
						value={data_form.ville}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="Paris"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="codeInsee" class="text-sm font-medium text-gray-700">Code INSEE</label>
					<input
						type="text"
						id="codeInsee"
						name="codeInsee"
						value={data_form.codeInsee}
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="75056"
						maxlength="5"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="section" class="text-sm font-medium text-gray-700">Section cadastrale *</label
					>
					<input
						type="text"
						id="section"
						name="section"
						value={data_form.section}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="AB"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="parcelle" class="text-sm font-medium text-gray-700">Parcelle *</label>
					<input
						type="text"
						id="parcelle"
						name="parcelle"
						value={data_form.parcelle}
						required
						class="block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
						placeholder="0123"
					/>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-3 transition-all pt-4">
			<a
				href="/app/admin/projets"
				class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
			>
				Annuler
			</a>
			<button
				type="submit"
				class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
			>
				<Plus class="mr-2 h-4 w-4" />
				Créer le projet
			</button>
		</div>
	</form>
</div>
