<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { scale } from 'svelte/transition';
	import {
		ArrowLeft,
		Save,
		User,
		KeyRound,
		Folder,
		Ban,
		Trash2,
		Search,
		SquareCheckBig,
		CircleAlert
	} from 'lucide-svelte';

	export let data;

	type UserData = {
		id: string;
		email: string;
		name: string;
		role?: string;
		banned: boolean;
		createdAt: Date;
		emailVerified: boolean;
	};

	const { userId, projets, userProjetIds } = data;

	let user: UserData | null = null;
	let loading = true;

	let toast: { message: string; type: 'success' | 'error' } | null = null;

	// Info form
	let role = 'user';

	// Password form
	let newPassword = '';
	let savingPassword = false;

	// Projects form
	let selectedProjets: string[] = [...userProjetIds];
	let projectSearch = '';

	// Danger zone
	let showDeleteConfirm = false;

	$: filteredProjets = projets.filter((p) => {
		if (!projectSearch) return true;
		const s = projectSearch.toLowerCase();
		return p.libelle.toLowerCase().includes(s) || p.reference.toLowerCase().includes(s);
	});

	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	}

	onMount(async () => {
		try {
			const res = await authClient.admin.listUsers({ query: { limit: 100 } });
			if (res.data) {
				const found = res.data.users.find((u) => u.id === userId);
				if (found) {
					user = found as unknown as UserData;
					role = user.role || 'user';
				}
			}
		} finally {
			loading = false;
		}
	});

	async function saveRole() {
		if (!user) return;
		try {
			const res = await authClient.admin.setRole({ userId: user.id, role: role as any });
			if (res.error) {
				showToast('Échec : ' + res.error.message, 'error');
				return;
			}
			user = { ...user, role };
			showToast('Rôle mis à jour');
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Erreur', 'error');
		}
	}

	async function savePassword() {
		if (!user || !newPassword) return;
		savingPassword = true;
		try {
			const res = await authClient.admin.setUserPassword({ userId: user.id, newPassword });
			if (res.error) {
				showToast('Échec : ' + res.error.message, 'error');
				return;
			}
			newPassword = '';
			showToast('Mot de passe mis à jour');
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Erreur', 'error');
		} finally {
			savingPassword = false;
		}
	}

	async function toggleBan() {
		if (!user) return;
		try {
			if (user.banned) {
				const res = await authClient.admin.unbanUser({ userId: user.id });
				if (res.error) {
					showToast('Échec : ' + res.error.message, 'error');
					return;
				}
				user = { ...user, banned: false };
				showToast('Compte réactivé');
			} else {
				const res = await authClient.admin.banUser({
					userId: user.id,
					banReason: 'Action administrative'
				});
				if (res.error) {
					showToast('Échec : ' + res.error.message, 'error');
					return;
				}
				user = { ...user, banned: true };
				showToast('Compte clôturé');
			}
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Erreur', 'error');
		}
	}

	async function deleteUser() {
		if (!user) return;
		try {
			const res = await authClient.admin.removeUser({ userId: user.id });
			if (res.error) {
				showToast('Échec : ' + res.error.message, 'error');
				return;
			}
			goto('/app/admin/utilisateurs');
		} catch (e) {
			showToast(e instanceof Error ? e.message : 'Erreur', 'error');
		}
	}
</script>

<svelte:head>
	<title>Admin · {user?.name ?? 'Utilisateur'}</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
	<!-- Back -->
	<div class="mb-6">
		<a href="/app/admin/utilisateurs" class="btn btn-ghost">
			<ArrowLeft size={18} />
			Retour aux utilisateurs
		</a>
	</div>

	{#if loading}
		<div class="space-y-4">
			{#each [1, 2, 3] as i (i)}
				<div class="rounded-xl border p-6 animate-pulse">
					<div class="h-4 w-32 rounded mb-4"></div>
					<div class="h-10 rounded"></div>
				</div>
			{/each}
		</div>
	{:else if !user}
		<div class="p-6 rounded-xl border text-center">
			<p class="font-medium">Utilisateur introuvable</p>
			<a href="/app/admin/utilisateurs" class="btn btn-ghost mt-4">Retour</a>
		</div>
	{:else}
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-3 mb-1">
				<h1 class="text-2xl font-bold">{user.name}</h1>
				{#if user.banned}
					<span class="badge badge-error">Clôturé</span>
				{:else}
					<span class="badge badge-success">Actif</span>
				{/if}
			</div>
			<p class="text-sm">{user.email} · Inscrit le {formatDate(user.createdAt)}</p>
		</div>

		<div class="space-y-6">
			<!-- Section : Rôle -->
			<div class="p-6 rounded-xl border shadow-sm">
				<div class="flex items-center gap-3 mb-5">
					<div class="p-2 bg-blue-50 rounded-lg">
						<User size={18} class="text-blue-600" />
					</div>
					<h2 class="text-lg font-semibold">Informations</h2>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div class="space-y-1.5">
						<label class="text-sm font-medium">Nom</label>
						<input type="text" value={user.name} disabled class="input" />
					</div>
					<div class="space-y-1.5">
						<label class="text-sm font-medium">Email</label>
						<input type="email" value={user.email} disabled class="input" />
					</div>
				</div>

				<div class="space-y-1.5 mb-5">
					<label for="role" class="text-sm font-medium">Rôle</label>
					<select id="role" bind:value={role} class="select">
						<option value="user">Utilisateur</option>
						<option value="collaborator">Collaborateur</option>
						<option value="admin">Administrateur</option>
					</select>
				</div>

				<div class="flex justify-end">
					<button on:click={saveRole} class="btn">
						<Save size={16} />
						Enregistrer le rôle
					</button>
				</div>
			</div>

			<!-- Section : Mot de passe -->
			<div class="p-6 rounded-xl border shadow-sm">
				<div class="flex items-center gap-3 mb-5">
					<div class="p-2 bg-amber-50 rounded-lg">
						<KeyRound size={18} class="text-amber-600" />
					</div>
					<h2 class="text-lg font-semibold">Mot de passe</h2>
				</div>

				<div class="space-y-1.5 mb-5">
					<label for="new-password" class="text-sm font-medium">Nouveau mot de passe</label>
					<input
						id="new-password"
						bind:value={newPassword}
						type="password"
						autocomplete="new-password"
						placeholder="Minimum 8 caractères"
						class="input"
					/>
				</div>

				<div class="flex justify-end">
					<button on:click={savePassword} disabled={!newPassword || savingPassword} class="btn">
						<Save size={16} />
						Changer le mot de passe
					</button>
				</div>
			</div>

			<!-- Section : Projets -->
			<div class="p-6 rounded-xl border shadow-sm">
				<div class="flex items-center gap-3 mb-5">
					<div class="p-2 bg-indigo-50 rounded-lg">
						<Folder size={18} class="text-indigo-600" />
					</div>
					<h2 class="text-lg font-semibold">Projets</h2>
				</div>

				<form
					method="POST"
					action="?/setProjets"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								await invalidateAll();
								showToast('Projets mis à jour');
							} else {
								showToast('Échec de la mise à jour', 'error');
							}
						};
					}}
				>
					{#if user.role === 'admin'}
						<p class="text-sm mb-4">Les administrateurs ont accès à tous les projets.</p>
					{:else}
						<label class="input mb-3">
							<Search size={16} />
							<input
								type="search"
								bind:value={projectSearch}
								placeholder="Rechercher un projet..."
							/>
						</label>

						<div
							class="max-h-64 overflow-y-auto rounded-lg border divide-y mb-3"
						>
							{#if projets.length === 0}
								<p class="p-4 text-sm text-center">Aucun projet disponible</p>
							{:else if filteredProjets.length === 0}
								<p class="p-4 text-sm text-center">Aucun projet trouvé</p>
							{:else}
								{#each filteredProjets as p (p.id)}
									<label class="flex items-center gap-3 p-3 cursor-pointer hover:bg-base-200">
										<input
											type="checkbox"
											name="projetIds"
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

						<p class="text-xs mb-4">
							{selectedProjets.length} projet{selectedProjets.length !== 1 ? 's' : ''} sélectionné{selectedProjets.length
								!== 1
								? 's'
								: ''}
						</p>
					{/if}

					<div class="flex justify-end">
						<button type="submit" class="btn" disabled={user.role === 'admin'}>
							<Save size={16} />
							Enregistrer les projets
						</button>
					</div>
				</form>
			</div>

			<!-- Section : Zone de danger -->
			<div class="p-6 rounded-xl border border-red-200 shadow-sm">
				<div class="flex items-center gap-3 mb-5">
					<div class="p-2 bg-red-50 rounded-lg">
						<CircleAlert size={18} class="text-red-600" />
					</div>
					<h2 class="text-lg font-semibold">Zone de danger</h2>
				</div>

				<div class="space-y-4">
					<!-- Ban/Unban -->
					<div class="flex items-center justify-between gap-4 p-4 rounded-lg border">
						<div>
							<p class="text-sm font-medium">
								{user.banned ? 'Réactiver le compte' : 'Clôturer le compte'}
							</p>
							<p class="text-xs mt-0.5">
								{user.banned
									? "L'utilisateur pourra à nouveau accéder à la plateforme."
									: "L'utilisateur ne pourra plus se connecter."}
							</p>
						</div>
						<button
							on:click={toggleBan}
							class="btn btn-ghost {user.banned
								? 'text-green-600 hover:bg-green-50'
								: 'text-amber-600 hover:bg-amber-50'}"
						>
							<Ban size={16} />
							{user.banned ? 'Réactiver' : 'Clôturer'}
						</button>
					</div>

					<!-- Delete -->
					<div class="flex items-center justify-between gap-4 p-4 rounded-lg border border-red-200">
						<div>
							<p class="text-sm font-medium">Supprimer le compte</p>
							<p class="text-xs mt-0.5">
								Action irréversible. Toutes les données seront définitivement supprimées.
							</p>
						</div>
						{#if showDeleteConfirm}
							<div class="flex gap-2">
								<button on:click={() => (showDeleteConfirm = false)} class="btn btn-ghost btn-sm">
									Annuler
								</button>
								<button on:click={deleteUser} class="btn btn-error btn-sm">
									Confirmer la suppression
								</button>
							</div>
						{:else}
							<button
								on:click={() => (showDeleteConfirm = true)}
								class="btn btn-ghost text-red-600 hover:bg-red-50"
							>
								<Trash2 size={16} />
								Supprimer
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
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
