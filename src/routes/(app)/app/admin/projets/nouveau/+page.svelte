<script lang="ts">
	import { ArrowLeft, Plus, ChartNoAxesCombined, MapPin } from 'lucide-svelte';
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

<div class="max-w-4xl mx-auto px-4 py-8">
	<!-- Fil d'ariane / Retour -->
	<div class="mb-8">
		<a href="/app/admin/projets" class="btn btn-ghost btn-primary">
			<ArrowLeft class="h-4 w-4" />
			Retour à la liste
		</a>
	</div>

	<!-- Titre -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold mb-2">Nouveau projet</h1>
		<p class="text-sm">Créez un nouveau projet dans la plateforme.</p>
	</div>

	{#if form?.message}
		<div class="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
			{form.message}
		</div>
	{/if}

	<form method="POST" use:enhance class="space-y-8">
		<!-- Section Identité -->
		<div class="p-6 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="p-2 bg-emerald-50 rounded-lg">
					<ChartNoAxesCombined class="text-emerald-600" />
				</div>
				<h2 class="text-xl font-semibold">Informations du projet</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-1.5 md:col-span-2">
					<label for="id" class="text-sm font-medium">ID Matterport *</label>
					<input
						type="text"
						id="id"
						name="id"
						value={data_form.id}
						required
						class="input"
						placeholder="ex: SxQL3iGy1rE (ID de la visite Matterport)"
					/>
					<p class="text-xs mt-1">
						L'identifiant unique de la visite Matterport (visible dans l'URL de la visite)
					</p>
				</div>

				<div class="space-y-1.5">
					<label for="reference" class="text-sm font-medium">Référence *</label>
					<input
						type="text"
						id="reference"
						name="reference"
						value={data_form.reference}
						required
						class="input"
						placeholder="REF-2024-001"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="libelle" class="text-sm font-medium">Libellé *</label>
					<input
						type="text"
						id="libelle"
						name="libelle"
						value={data_form.libelle}
						required
						class="input"
						placeholder="Nom du projet"
					/>
				</div>

				<div class="space-y-1.5 md:col-span-2">
					<label for="etablissementId" class="text-sm font-medium">Établissement *</label>
					<select id="etablissementId" name="etablissementId" required class="select">
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
					<label for="typeOperation" class="text-sm font-medium">Type d'opération</label>
					<input
						type="text"
						id="typeOperation"
						name="typeOperation"
						value={data_form.typeOperation}
						class="input"
						placeholder="Démolition, Rénovation..."
					/>
				</div>

				<div class="space-y-1.5">
					<label for="maitreDOuvrage" class="text-sm font-medium">Maître d'ouvrage</label>
					<input
						type="text"
						id="maitreDOuvrage"
						name="maitreDOuvrage"
						value={data_form.maitreDOuvrage}
						class="input"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="dateDemarrage" class="text-sm font-medium">Date de démarrage *</label>
					<input
						type="date"
						id="dateDemarrage"
						name="dateDemarrage"
						value={data_form.dateDemarrage}
						required
						class="input"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="dateDeFin" class="text-sm font-medium">Date de fin</label>
					<input
						type="date"
						id="dateDeFin"
						name="dateDeFin"
						value={data_form.dateDeFin}
						class="input"
					/>
				</div>
			</div>
		</div>

		<!-- Section Localisation -->
		<div class="p-6 rounded-xl border border-gray-200 shadow-sm">
			<div class="flex items-center gap-3 mb-6">
				<div class="p-2 bg-emerald-50 rounded-lg">
					<MapPin class="text-emerald-600" />
				</div>
				<h2 class="text-xl font-semibold">Localisation</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="space-y-1.5 md:col-span-2">
					<label for="rue" class="text-sm font-medium">Adresse *</label>
					<input
						type="text"
						id="rue"
						name="rue"
						value={data_form.rue}
						required
						class="input"
						placeholder="123 rue de la Paix"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="cp" class="text-sm font-medium">Code Postal *</label>
					<input
						type="text"
						id="cp"
						name="cp"
						value={data_form.cp}
						required
						class="input"
						placeholder="75000"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="ville" class="text-sm font-medium">Ville *</label>
					<input
						type="text"
						id="ville"
						name="ville"
						value={data_form.ville}
						required
						class="input"
						placeholder="Paris"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="codeInsee" class="text-sm font-medium">Code INSEE</label>
					<input
						type="text"
						id="codeInsee"
						name="codeInsee"
						value={data_form.codeInsee}
						class="input"
						placeholder="75056"
						maxlength="5"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="section" class="text-sm font-medium">Section cadastrale *</label>
					<input
						type="text"
						id="section"
						name="section"
						value={data_form.section}
						required
						class="input"
						placeholder="AB"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="parcelle" class="text-sm font-medium">Parcelle *</label>
					<input
						type="text"
						id="parcelle"
						name="parcelle"
						value={data_form.parcelle}
						required
						class="input"
						placeholder="0123"
					/>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-3 transition-all pt-4">
			<a href="/app/admin/projets" class="btn"> Annuler </a>
			<button type="submit" class="btn">
				<Plus class="mr-2 h-4 w-4" />
				Créer le projet
			</button>
		</div>
	</form>
</div>
