<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import {
		Users,
		Bug,
		UserPen,
		RefreshCcw,
		Search,
		Pencil,
		ArrowLeft,
		ArrowRight
	} from 'lucide-svelte';

	export let data;

	type User = {
		id: string;
		email: string;
		name: string;
		role?: string;
		banned: boolean;
		createdAt: Date;
		emailVerified: boolean;
	};

	type Projet = {
		id: string;
		libelle: string;
		reference: string;
	};

	let users: User[] = [];
	let loading = true;
	let error: string | null = null;

	$: projets = (data.projets || []) as Projet[];
	$: usersWithProjets = (data.usersWithProjets || []) as { userId: string; projetId: string }[];

	let query = '';
	let perPage = 25;
	let page = 1;

	function getUserProjetsCount(userId: string): number {
		return usersWithProjets.filter((up) => up.userId === userId).length;
	}

	async function loadUsers() {
		loading = true;
		error = null;
		try {
			const res = await authClient.admin.listUsers({
				query: { limit: 100, sortBy: 'createdAt', sortDirection: 'desc' }
			});
			if (res.data) {
				users = res.data.users as unknown as User[];
			} else if (res.error) {
				error = res.error.message || 'Une erreur est survenue';
			}
		} catch (e: unknown) {
			error = e instanceof Error ? e.message : 'Échec du chargement';
		} finally {
			loading = false;
		}
	}

	onMount(loadUsers);

	$: filteredUsers = users.filter((u) => {
		if (!query) return true;
		const q = query.toLowerCase();
		return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
	});

	$: totalPages = Math.ceil(filteredUsers.length / perPage);
	$: displayedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

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
				<a href="/app/admin/utilisateurs/nouveau" class="btn">
					<UserPen size={20} />
					Nouvel utilisateur
				</a>
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

	<!-- Users List -->
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
				<p class="font-medium">Aucun utilisateur trouvé</p>
				<p class="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
			</div>
		{:else}
			<div class="divide-y divide-slate-100">
				{#each displayedUsers as user (user.id)}
					<li class="list-row">
						<!-- User Info -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2">
								<p class="truncate font-semibold">{user.name}</p>
								{#if user.role === 'admin'}
									<span
										class="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700"
									>
										Administrateur
									</span>
								{:else if user.role === 'collaborator'}
									<span
										class="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
									>
										Collaborateur
									</span>
								{:else}
									<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
										Utilisateur
									</span>
								{/if}
							</div>
							<p class="truncate text-sm">{user.email}</p>
						</div>

						<!-- Status -->
						<div class="hidden sm:flex sm:w-20 sm:justify-center">
							{#if user.banned}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
								>
									<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>
									Clôturé
								</span>
							{:else}
								<span
									class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
								>
									<span class="h-1.5 w-1.5 rounded-full bg-green-500"></span>
									Actif
								</span>
							{/if}
						</div>

						<!-- Date -->
						<div class="hidden md:flex md:flex-col md:items-end w-36 mr-4">
							<p class="text-xs">Inscrit le</p>
							<p class="text-sm font-medium whitespace-nowrap">{formatDate(user.createdAt)}</p>
						</div>

						<!-- Projets -->
						<div class="hidden lg:flex lg:flex-col lg:items-end w-24 mr-4">
							<p class="text-xs">Projets</p>
							{#if user.role === 'admin'}
								<p class="text-sm font-medium">tous</p>
							{:else}
								<p class="text-sm font-medium">{getUserProjetsCount(user.id)}</p>
							{/if}
						</div>

						<!-- Edit link -->
						<div class="flex items-center pl-2 border-l border-slate-200">
							<a
								href="/app/admin/utilisateurs/{user.id}"
								class="btn btn-ghost"
								title="Modifier l'utilisateur"
							>
								<Pencil size={18} />
							</a>
						</div>
					</li>
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if !loading && filteredUsers.length > 0 && totalPages > 1}
			<div class="flex items-center justify-between border-t border-slate-200 px-4 py-3">
				<p class="text-sm">
					Affichage de <span class="font-semibold"
						>{Math.min(filteredUsers.length, (page - 1) * perPage + 1)}</span
					>
					à <span class="font-semibold">{Math.min(filteredUsers.length, page * perPage)}</span>
					sur <span class="font-semibold">{filteredUsers.length}</span> résultats
				</p>
				<div class="flex gap-2">
					<button on:click={() => (page = Math.max(1, page - 1))} disabled={page === 1} class="btn">
						<ArrowLeft />
						Précédent
					</button>
					<button
						on:click={() => (page = Math.min(totalPages, page + 1))}
						disabled={page === totalPages}
						class="btn"
					>
						Suivant
						<ArrowRight />
					</button>
				</div>
			</div>
		{/if}
	</ul>
</main>
