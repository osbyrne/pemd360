<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import Pagination from '$lib/components/Pagination.svelte';
	import { Users, Bug, RefreshCcw, Search } from 'lucide-svelte';
	import CreateUserModal from '$lib/components/CreateUserModal.svelte';
	import UserProjetsModal from '$lib/components/UserProjetsModal.svelte';
	import EditUserModal from '$lib/components/EditUserModal.svelte';
	import UserPasswordModal from '$lib/components/UserPasswordModal.svelte';
	import UserBanModal from '$lib/components/UserBanModal.svelte';
	import DeleteUserModal from '$lib/components/DeleteUserModal.svelte';

	export let data;

	type User = {
		id: string;
		email: string;
		name: string;
		role?: string;
		banned: boolean;
		image?: string;
		createdAt: Date;
		emailVerified: boolean;
		projetIds?: string[];
	};

	type Projet = {
		id: string;
		libelle: string;
		reference: string;
	};

	// State
	let users: User[] = [];
	let loading = true;
	let error: string | null = null;

	// Projets from server
	$: projets = (data.projets || []) as Projet[];
	$: usersWithProjets = (data.usersWithProjets || []) as { userId: string; projetId: string }[];

	// Pagination & Search
	let query = '';
	let perPage = 25;
	let page = 1;

	// Toast/Notification
	let toast: { message: string; type: 'success' | 'error' } | null = null;

	// Show toast
	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Get user's projets
	function getUserProjets(userId: string): string[] {
		return usersWithProjets.filter((up) => up.userId === userId).map((up) => up.projetId);
	}

	// Get projets names
	function getProjetsNames(projetIds: string[]): string {
		if (!projetIds || projetIds.length === 0) return 'Aucun';
		const names = projetIds.map((id) => {
			const p = projets.find((proj) => proj.id === id);
			return p?.libelle || 'Inconnu';
		});
		if (names.length <= 2) return names.join(', ');
		return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
	}

	// Get projets count
	function getProjetsCount(userId: string): number {
		return getUserProjets(userId).length;
	}

	async function loadUsers() {
		loading = true;
		error = null;
		try {
			const res = await authClient.admin.listUsers({
				query: {
					limit: 100,
					sortBy: 'createdAt',
					sortDirection: 'desc'
				}
			});

			if (res.data) {
				users = (res.data.users as unknown as User[]).map((u) => ({
					...u,
					projetIds: getUserProjets(u.id)
				}));
			} else {
				if (res.error) error = res.error.message || 'Une erreur est survenue';
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.log(e.message || 'Échec du chargement des utilisateurs');
			} else {
				console.log(String(e));
			}
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadUsers();
	});

	// Derived
	$: filteredUsers = users.filter((u) => {
		if (!query) return true;
		const q = query.toLowerCase();
		return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
	});

	$: totalPages = Math.ceil(filteredUsers.length / perPage);
	$: displayedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

	function handleProjetsSaved(event: CustomEvent<{ userId: string; projetIds: string[] }>) {
		const { userId, projetIds } = event.detail;
		usersWithProjets = usersWithProjets.filter((up) => up.userId !== userId);
		usersWithProjets = [
			...usersWithProjets,
			...projetIds.map((projetId) => ({ userId, projetId }))
		];
		users = users.map((u) => (u.id === userId ? { ...u, projetIds } : u));
	}

	function handleUserUpdated(
		event: CustomEvent<{ userId: string; name: string; email: string; role: string }>
	) {
		const { userId, name, email, role } = event.detail;
		users = users.map((u) => (u.id === userId ? { ...u, name, email, role } : u));
	}

	function handleUserStatusChanged(event: CustomEvent<{ userId: string; banned: boolean }>) {
		const { userId, banned } = event.detail;
		users = users.map((u) => (u.id === userId ? { ...u, banned } : u));
	}

	function handleUserDeleted(event: CustomEvent<{ userId: string }>) {
		const { userId } = event.detail;
		users = users.filter((u) => u.id !== userId);
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Admin · Utilisateurs</title>
</svelte:head>

<main class="mx-auto max-w-7xl">
	<!-- Header -->
	<div class="mb-8">
		<div class="sm:flex sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Gestion des utilisateurs</h1>
				<p class="mt-2 text-sm">Gérez les utilisateurs, leurs rôles et leurs accès.</p>
			</div>
			<div class="mt-4 flex flex-wrap gap-3 sm:mt-0">
				<CreateUserModal
					{projets}
					on:created={loadUsers}
					on:toast={(e) => showToast(e.detail.message, e.detail.type)}
				/>
				<button on:click={loadUsers} class="btn">
					<RefreshCcw size={20} />
					Actualiser
				</button>
			</div>
		</div>
	</div>

	<!-- Search Bar -->
	<label class="mb-6 input relative">
		<Search />
		<input type="search" bind:value={query} placeholder="Rechercher par nom ou email..." />
	</label>

	<!-- Error State -->
	{#if error}
		<div class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
			<div class="flex items-start gap-3">
				<Bug size={24} />
				<div>
					<h3 class="text-sm font-semibold text-red-800">Erreur de chargement</h3>
					<p class="mt-1 text-sm text-red-700">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Users Grid -->
	<ul class="list bg-base-100 rounded-box shadow-md">
		{#if loading}
			<div class="divide-y divide-slate-100">
				{#each [...Array(5).keys()] as i (i)}
					<div class="flex items-center gap-4 p-4">
						<div class="h-12 w-12 rounded-full animate-pulse"></div>
						<div class="flex-1 space-y-2">
							<div class="h-4 w-32 rounded animate-pulse"></div>
							<div class="h-3 w-48 rounded animate-pulse"></div>
						</div>
						<div class="h-6 w-16 rounded-full animate-pulse"></div>
					</div>
				{/each}
			</div>
		{:else if displayedUsers.length === 0}
			<div class="flex flex-col items-center justify-center py-16 px-4">
				<Users />
				<p class=" font-medium">Aucun utilisateur trouvé</p>
				<p class="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div>
				{#each displayedUsers as user (user.id)}
					<li class="list-row">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate font-semibold">{user.name}</p>
								{#if user.role === 'admin'}
									<span class="rounded-full px-2 py-0.5 text-xs"> Administrateur </span>
								{:else if user.role === 'collaborator'}
									<span class="rounded-full px-2 py-0.5 text-xs"> Collaborateur </span>
								{:else}
									<span class="rounded-full px-2 py-0.5 text-xs"> Utilisateur </span>
								{/if}
							</div>
							<p class="truncate text-sm">{user.email}</p>
						</div>

						<!-- Date -->
						<div class="hidden md:flex md:flex-col md:items-end">
							<p class="text-xs">Inscrit le</p>
							<p class="text-sm font-medium whitespace-nowrap">
								{formatDate(user.createdAt)}
							</p>
						</div>

						<!-- Projets -->
						<div class="hidden lg:flex lg:flex-col lg:items-end w-32 mr-4">
							<p class="text-xs">Projets</p>
							{#if user.role === 'admin'}
								<p class="text-sm font-medium whitespace-nowrap truncate max-w-30">tous</p>
							{:else}
								<p
									class="text-sm font-medium whitespace-nowrap truncate max-w-30"
									title={getProjetsNames(getUserProjets(user.id))}
								>
									{getProjetsCount(user.id)} projet{getProjetsCount(user.id) > 1 ? 's' : ''}
								</p>
							{/if}
						</div>

						<!-- Actions -->
						<div class="flex items-center gap-1 pl-2 border-l border-slate-200">
							<UserProjetsModal
								{user}
								{projets}
								initialProjetIds={getUserProjets(user.id)}
								on:saved={handleProjetsSaved}
								on:toast={(e) => showToast(e.detail.message, e.detail.type)}
							/>
							<EditUserModal
								{user}
								on:updated={handleUserUpdated}
								on:toast={(e) => showToast(e.detail.message, e.detail.type)}
							/>
							<UserPasswordModal
								{user}
								on:toast={(e) => showToast(e.detail.message, e.detail.type)}
							/>
							<UserBanModal
								{user}
								on:statusChanged={handleUserStatusChanged}
								on:toast={(e) => showToast(e.detail.message, e.detail.type)}
							/>
							<DeleteUserModal
								{user}
								on:deleted={handleUserDeleted}
								on:toast={(e) => showToast(e.detail.message, e.detail.type)}
							/>
						</div>
					</li>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if !loading}
			<Pagination
				{page}
				{totalPages}
				totalItems={filteredUsers.length}
				{perPage}
				onPageChange={(p) => (page = p)}
			/>
		{/if}
	</ul>
</main>

{#if toast}
	<div class="toast">
		<div class="alert alert-info">
			<span class="text-sm font-medium">{toast.message}</span>
		</div>
	</div>
{/if}
