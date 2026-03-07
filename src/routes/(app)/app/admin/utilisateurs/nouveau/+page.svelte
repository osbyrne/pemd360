<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { scale } from 'svelte/transition';
	import { ArrowLeft, UserPlus, Search, SquareCheckBig, CircleAlert } from 'lucide-svelte';

	export let data;

	const { projets } = data;

	let toast: { message: string; type: 'success' | 'error' } | null = null;
	let submitting = false;

	let name = '';
	let email = '';
	let password = '';
	let role = 'user';
	let selectedProjets: string[] = [];
	let projectSearch = '';

	$: filteredProjets = projets.filter((p: { id: string; libelle: string; reference: string }) => {
		if (!projectSearch) return true;
		const s = projectSearch.toLowerCase();
		return p.libelle.toLowerCase().includes(s) || p.reference.toLowerCase().includes(s);
	});

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	async function createUser() {
		if (!name || !email || !password) {
			showToast('Veuillez remplir tous les champs obligatoires', 'error');
			return;
		}

		submitting = true;
		try {
			const res = await authClient.admin.createUser({
				email,
				password,
				name,
				role: role as any
			});

			if (!res.data) {
				showToast('Échec : ' + (res.error?.message ?? 'Erreur inconnue'), 'error');
				return;
			}

			const newUserId = res.data.user.id;

			if (selectedProjets.length > 0) {
				const formData = new FormData();
				formData.append('userId', newUserId);
				selectedProjets.forEach((id) => formData.append('projetIds', id));
				await fetch('/app/admin/utilisateurs?/setProjets', { method: 'POST', body: formData });
			}

			goto(`/app/admin/utilisateurs/${newUserId}`);
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Erreur', 'error');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Admin · Nouvel utilisateur</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
	<!-- Back -->
	<div class="mb-6">
		<a href="/app/admin/utilisateurs" class="btn btn-ghost">
			<ArrowLeft size={18} />
			Retour aux utilisateurs
		</a>
	</div>

	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-2xl font-bold">Nouvel utilisateur</h1>
		<p class="text-sm mt-1">Créez un compte et assignez des projets.</p>
	</div>

	<div class="space-y-6">
		<!-- Section : Informations -->
		<div class="p-6 rounded-xl border shadow-sm">
			<div class="flex items-center gap-3 mb-5">
				<div class="p-2 bg-emerald-50 rounded-lg">
					<UserPlus size={18} class="text-emerald-600" />
				</div>
				<h2 class="text-lg font-semibold">Informations du compte</h2>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="space-y-1.5">
					<label for="name" class="text-sm font-medium">Nom *</label>
					<input
						id="name"
						bind:value={name}
						type="text"
						placeholder="Jean Dupont"
						class="input"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="email" class="text-sm font-medium">Email *</label>
					<input
						id="email"
						bind:value={email}
						type="email"
						placeholder="jean.dupont@exemple.com"
						class="input"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="password" class="text-sm font-medium">Mot de passe *</label>
					<input
						id="password"
						bind:value={password}
						type="password"
						autocomplete="new-password"
						placeholder="Minimum 8 caractères"
						class="input"
					/>
				</div>
				<div class="space-y-1.5">
					<label for="role" class="text-sm font-medium">Rôle</label>
					<select id="role" bind:value={role} class="select">
						<option value="user">Utilisateur</option>
						<option value="collaborator">Collaborateur</option>
						<option value="admin">Administrateur</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Section : Projets -->
		<div class="p-6 rounded-xl border shadow-sm">
			<div class="flex items-center gap-3 mb-5">
				<div class="p-2 bg-indigo-50 rounded-lg">
					<Search size={18} class="text-indigo-600" />
				</div>
				<h2 class="text-lg font-semibold">Projets</h2>
			</div>

			<label class="input mb-3">
				<Search size={16} />
				<input type="search" bind:value={projectSearch} placeholder="Rechercher un projet..." />
			</label>

			<div class="max-h-64 overflow-y-auto rounded-lg border divide-y mb-3">
				{#if projets.length === 0}
					<p class="p-4 text-sm text-center">Aucun projet disponible</p>
				{:else if filteredProjets.length === 0}
					<p class="p-4 text-sm text-center">Aucun projet trouvé</p>
				{:else}
					{#each filteredProjets as p (p.id)}
						<label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-200">
							<input
								type="checkbox"
								value={p.id}
								checked={selectedProjets.includes(p.id)}
								on:change={(e) => {
									if (e.currentTarget.checked) {
										selectedProjets = [...selectedProjets, p.id];
									} else {
										selectedProjets = selectedProjets.filter((id) => id !== p.id);
									}
								}}
								class="checkbox"
							/>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium truncate">{p.libelle}</p>
								<p class="text-xs truncate">Réf : {p.reference}</p>
							</div>
						</label>
					{/each}
				{/if}
			</div>

			<p class="text-xs">
				{selectedProjets.length} projet{selectedProjets.length !== 1 ? 's' : ''} sélectionné{selectedProjets.length
					!== 1
					? 's'
					: ''}
			</p>
		</div>

		<!-- Actions -->
		<div class="flex justify-end gap-3">
			<a href="/app/admin/utilisateurs" class="btn btn-ghost">Annuler</a>
			<button on:click={createUser} disabled={submitting} class="btn">
				<UserPlus size={16} />
				Créer l'utilisateur
			</button>
		</div>
	</div>
</div>

<!-- Toast -->
{#if toast}
	<div class="fixed bottom-4 right-4 z-50" transition:scale={{ duration: 200 }}>
		<div
			class="flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg {toast.type === 'success'
				? 'bg-emerald-600'
				: 'bg-red-600'} text-white"
		>
			{#if toast.type === 'success'}
				<SquareCheckBig size={18} />
			{:else}
				<CircleAlert size={18} />
			{/if}
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
