<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const id = $derived($page.params.id);

	function toDateInput(ts: number | null | undefined): string {
		if (!ts) return '';
		return new Date(ts).toISOString().split('T')[0];
	}

	const storedDocuments: string[] = JSON.parse(data.diagnostic?.documentsConsultes || '[]');

	let desordres = $state(!!data.diagnostic?.desordres);
	let precaution = $state(!!data.diagnostic?.precaution);
	let documentsConsultes = $state([...storedDocuments]);

	const documentsList = [
		'Dossier des Ouvrages Exécutés (DOE) des bâtiments existants',
		'Plans',
		'Diagnostic amiante',
		'Diagnostic plomb',
		'Diagnostic termites',
		'Autre'
	];
</script>

<svelte:head>
	<title>CERFA · Le diagnostic</title>
</svelte:head>

<div class="p-6 max-w-3xl mx-auto">
	<div class="mb-6">
		<a href="/app/cerfa/informations?projetId={id}" class="btn btn-ghost btn-sm">← Retour</a>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="border-b border-teal-100 px-6 py-4">
			<h1 class="text-xl font-semibold">Le diagnostic</h1>
		</div>
		<div class="p-6">
			<form method="POST" use:enhance class="space-y-6">
				<div>
					<label for="derniereVisite" class="block text-sm font-medium mb-2"
						>Date de la dernière visite de l'opération</label
					>
					<input
						id="derniereVisite"
						name="derniereVisite"
						type="date"
						value={toDateInput(data.diagnostic?.derniereVisite)}
						class="input"
					/>
				</div>

				<div>
					<label for="batVisite" class="block text-sm font-medium mb-2"
						>Les bâtiments ou parties de bâtiments visitées par le diagnostiqueur</label
					>
					<textarea
						id="batVisite"
						name="batVisite"
						rows="3"
						placeholder="parties de bâtiments visitées"
						class="input">{data.diagnostic?.batVisite || ''}</textarea
					>
				</div>

				<div>
					<label for="batNonVisite" class="block text-sm font-medium mb-2"
						>Les bâtiments ou parties de bâtiments non visitées par le diagnostiqueur</label
					>
					<textarea
						id="batNonVisite"
						name="batNonVisite"
						rows="3"
						placeholder="parties de bâtiments non visitées"
						class="input">{data.diagnostic?.batNonVisite || ''}</textarea
					>
				</div>

				<div>
					<label for="raisonsNePasVisite" class="block text-sm font-medium mb-2"
						>Raisons pour n'avoir pas visité ces parties</label
					>
					<textarea
						id="raisonsNePasVisite"
						name="raisonsNePasVisite"
						rows="3"
						placeholder="Raisons"
						class="input">{data.diagnostic?.raisonsNePasVisite || ''}</textarea
					>
				</div>

				<div>
					<div class="block text-sm font-medium mb-2">
						Le diagnostic a-t-il identifié des vices ou des désordres apparents dans des composants
						des bâtiments ?
					</div>
					<div class="flex gap-4">
						<label for="desordres-oui" class="flex items-center gap-2 cursor-pointer">
							<input
								id="desordres-oui"
								type="radio"
								name="desordres"
								value="true"
								checked={desordres}
								onchange={() => (desordres = true)}
								class="radio"
							/>
							<span class="">Oui</span>
						</label>
						<label for="desordres-non" class="flex items-center gap-2 cursor-pointer">
							<input
								id="desordres-non"
								type="radio"
								name="desordres"
								value="false"
								checked={!desordres}
								onchange={() => (desordres = false)}
								class="radio"
							/>
							<span class="">Non</span>
						</label>
					</div>
				</div>

				<div>
					<div class="block text-sm font-medium mb-2">
						Le rapport de diagnostic fournit-il des indications sur les précautions de démolition ou
						de rénovation ?
					</div>
					<div class="flex gap-4">
						<label for="precaution-oui" class="flex items-center gap-2 cursor-pointer">
							<input
								id="precaution-oui"
								type="radio"
								name="precaution"
								value="true"
								checked={precaution}
								onchange={() => (precaution = true)}
								class="radio"
							/>
							<span class="">Oui</span>
						</label>
						<label for="precaution-non" class="flex items-center gap-2 cursor-pointer">
							<input
								id="precaution-non"
								type="radio"
								name="precaution"
								value="false"
								checked={!precaution}
								onchange={() => (precaution = false)}
								class="radio"
							/>
							<span class="">Non</span>
						</label>
					</div>
				</div>

				<div>
					<div class="block text-sm font-medium mb-2">Documents consultés</div>
					<div class="space-y-2">
						{#each documentsList as doc}
							<label
								for={`doc-${doc.replace(/\s+/g, '-').toLowerCase()}`}
								class="flex items-center gap-2"
							>
								<input
									id={`doc-${doc.replace(/\s+/g, '-').toLowerCase()}`}
									type="checkbox"
									name="documentsConsultes"
									value={doc}
									checked={documentsConsultes.includes(doc)}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											documentsConsultes = [...documentsConsultes, doc];
										} else {
											documentsConsultes = documentsConsultes.filter((d) => d !== doc);
										}
									}}
									class="checkbox"
								/>
								<span class="text-sm">{doc}</span>
							</label>
						{/each}
					</div>
				</div>

				<div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
					<a href="/app/cerfa/informations?projetId={id}" class="btn">Annuler</a>
					<button type="submit" class="btn">Valider</button>
				</div>
			</form>
		</div>
	</div>
</div>
