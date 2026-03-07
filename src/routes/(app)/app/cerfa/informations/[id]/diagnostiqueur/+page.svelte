<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const id = $derived($page.params.id);

	let typePersonne = $state(data.diagnostiqueur?.nomPerMorale ? 'morale' : 'physique');

	function toDateInput(ts: number | null | undefined): string {
		if (!ts) return '';
		return new Date(ts).toISOString().split('T')[0];
	}
</script>

<svelte:head>
	<title>CERFA · Diagnostiqueur</title>
</svelte:head>

<div class="p-6 max-w-2xl mx-auto">
	<div class="mb-6">
		<a href="/app/cerfa/informations?projetId={id}" class="btn btn-ghost btn-sm">← Retour</a>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="bg-purple-50 border-b border-purple-100 px-6 py-4">
			<h1 class="text-xl font-semibold text-purple-900">Le diagnostiqueur</h1>
		</div>
		<div class="p-6">
			<form method="POST" use:enhance class="space-y-6">
				<div class="grid grid-cols-1 gap-4">
					<div>
						<label for="adresse" class="block text-sm font-medium mb-2">Adresse</label>
						<input
							id="adresse"
							name="adresse"
							type="text"
							value={data.diagnostiqueur?.adresse || ''}
							placeholder="Adresse"
							class="input"
						/>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="cp" class="block text-sm font-medium mb-2">Code postal</label>
							<input
								id="cp"
								name="cp"
								type="text"
								value={data.diagnostiqueur?.cp || ''}
								placeholder="Code postal"
								class="input"
							/>
						</div>
						<div>
							<label for="commune" class="block text-sm font-medium mb-2">Commune</label>
							<input
								id="commune"
								name="commune"
								type="text"
								value={data.diagnostiqueur?.commune || ''}
								placeholder="Commune"
								class="input"
							/>
						</div>
					</div>
				</div>

				<div class="flex gap-4 p-4 rounded-lg">
					<label for="personne-physique" class="flex items-center gap-2 cursor-pointer">
						<input
							id="personne-physique"
							type="radio"
							name="typePersonne"
							value="physique"
							checked={typePersonne === 'physique'}
							onchange={() => (typePersonne = 'physique')}
							class="radio"
						/>
						<span class="font-medium">Personne physique</span>
					</label>
					<label for="personne-morale" class="flex items-center gap-2 cursor-pointer">
						<input
							id="personne-morale"
							type="radio"
							name="typePersonne"
							value="morale"
							checked={typePersonne === 'morale'}
							onchange={() => (typePersonne = 'morale')}
							class="radio"
						/>
						<span class="font-medium">Personne morale</span>
					</label>
				</div>

				{#if typePersonne === 'physique'}
					<div class="bg-purple-50 rounded-lg p-4 space-y-4">
						<h4 class="font-semibold text-purple-900">Si personne physique</h4>
						<div>
							<label for="nom" class="block text-sm font-medium mb-2">Nom</label>
							<input
								id="nom"
								name="nom"
								type="text"
								value={data.diagnostiqueur?.nomPerPhy || ''}
								placeholder="Nom"
								class="input"
							/>
						</div>
						<div>
							<label for="prenom" class="block text-sm font-medium mb-2">Prénom</label>
							<input
								id="prenom"
								name="prenom"
								type="text"
								value={data.diagnostiqueur?.prenomPerPhy || ''}
								placeholder="Prénom"
								class="input"
							/>
						</div>
					</div>
				{:else}
					<div class="bg-purple-50 rounded-lg p-4 space-y-4">
						<h4 class="font-semibold text-purple-900">Si personne morale</h4>
						<div>
							<label for="raisonSociale" class="block text-sm font-medium mb-2"
								>Raison sociale</label
							>
							<input
								id="raisonSociale"
								name="raisonSociale"
								type="text"
								value={data.diagnostiqueur?.nomPerMorale || ''}
								placeholder="Raison sociale"
								class="input"
							/>
						</div>
						<div>
							<label for="siretSiren" class="block text-sm font-medium mb-2"
								>Numéro de Siret ou Siren</label
							>
							<input
								id="siretSiren"
								name="siretSiren"
								type="text"
								value={data.diagnostiqueur?.siretSiren || ''}
								placeholder="Siret ou Siren"
								class="input"
							/>
						</div>
					</div>
				{/if}

				<div class="border-t border-gray-200 pt-6 space-y-4">
					<h4 class="font-semibold">Assurance souscrite par le diagnostiqueur</h4>
					<label for="engagementAssurance" class="flex items-start gap-3 cursor-pointer">
						<input
							id="engagementAssurance"
							name="engagementAssurance"
							type="checkbox"
							checked={!!data.diagnostiqueur?.engagementAssurance}
							class="checkbox"
						/>
						<span class="text-sm">
							Je déclare qu'en cas de sinistre l'assurance souscrite couvre les activités du
							diagnostiqueur et que le montant de la garantie est d'au moins 300 000 € par sinistre
							et 500 000 € par année d'assurance.
						</span>
					</label>
					<div>
						<label for="nomAssurance" class="block text-sm font-medium mb-2"
							>Nom de la compagnie d'assurance</label
						>
						<input
							id="nomAssurance"
							name="nomAssurance"
							type="text"
							value={data.diagnostiqueur?.nomAssurance || ''}
							placeholder="Nom de la compagnie d'assurance"
							class="input"
						/>
					</div>
					<div>
						<label for="numeroPolice" class="block text-sm font-medium mb-2">Numéro de police</label
						>
						<input
							id="numeroPolice"
							name="numeroPolice"
							type="text"
							value={data.diagnostiqueur?.numeroPolice || ''}
							placeholder="Numéro de police"
							class="input"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium mb-2">Date de validité</label>
						<div class="grid grid-cols-2 gap-4">
							<input
								id="dateDebutAssurance"
								name="dateDebutAssurance"
								type="date"
								value={toDateInput(data.diagnostiqueur?.dateDebutAssurance)}
								class="input"
							/>
							<input
								id="dateFinAssurance"
								name="dateFinAssurance"
								type="date"
								value={toDateInput(data.diagnostiqueur?.dateFinAssurance)}
								class="input"
							/>
						</div>
					</div>
				</div>

				<div class="border-t border-gray-200 pt-6">
					<label for="competences" class="flex items-start gap-3 cursor-pointer">
						<input
							id="competences"
							name="competences"
							type="checkbox"
							checked={!!data.diagnostiqueur?.competences}
							class="checkbox"
						/>
						<span class="text-sm">
							Je déclare pouvoir justifier des compétences du diagnostiqueur à la demande de
							l'administration. (3)
						</span>
					</label>
				</div>

				<div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
					<a href="/app/cerfa/informations?projetId={id}" class="btn">Annuler</a>
					<button type="submit" class="btn">Valider</button>
				</div>
			</form>
		</div>
	</div>
</div>
