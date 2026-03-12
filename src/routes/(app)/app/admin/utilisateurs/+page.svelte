<script lang="ts">
	import { onMount } from 'svelte';
	import { authClient } from '$lib/auth-client';
	import { enhance } from '$app/forms';
	import Pagination from '$lib/components/Pagination.svelte';
	import { invalidateAll } from '$app/navigation';
	import {
		Pencil,
		Users,
		Folder,
		Bug,
		KeyRound,
		X,
		UserPlus,
		UserPen,
		RefreshCcw,
		Search,
		Ban
	} from 'lucide-svelte';

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

	// Modals
	let editModal: HTMLDialogElement;
	let createModal: HTMLDialogElement;
	let passwordModal: HTMLDialogElement;
	let banModal: HTMLDialogElement;
	let deleteModal: HTMLDialogElement;
	let projetsModal: HTMLDialogElement;

	// Toast/Notification
	let toast: { message: string; type: 'success' | 'error' } | null = null;

	// Clôture de compte (formulaire)
	let banReason = '';

	// Active User for actions
	let selectedUser: User | null = null;

	// Show toast
	function showToast(message: string, type: 'success' | 'error' = 'success') {
		toast = { message, type };
		setTimeout(() => (toast = null), 3000);
	}

	// Forms
	let editForm = {
		name: '',
		email: '',
		role: 'user'
	};

	let createForm = {
		email: '',
		password: '',
		name: '',
		role: 'user',
		projetIds: [] as string[]
	};

	let passwordForm = {
		newPassword: ''
	};

	let projetsForm = {
		projetIds: [] as string[]
	};

	// Search filters for project selection
	let createProjectSearch = '';
	let modalProjectSearch = '';

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

	// Filter projects based on search
	$: filteredCreateProjets = projets.filter((p) => {
		if (!createProjectSearch) return true;
		const search = createProjectSearch.toLowerCase();
		return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
	});

	$: filteredModalProjets = projets.filter((p) => {
		if (!modalProjectSearch) return true;
		const search = modalProjectSearch.toLowerCase();
		return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
	});

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

	// --- Actions ---

	// PROJETS MODAL
	function openProjetsModal(user: User) {
		selectedUser = user;
		projetsForm.projetIds = getUserProjets(user.id);
		modalProjectSearch = '';
		projetsModal?.showModal();
	}

	function closeProjetsModal() {
		projetsModal?.close();
		selectedUser = null;
	}

	// EDIT USER INFO
	function openEditModal(user: User) {
		selectedUser = user;
		editForm.name = user.name || '';
		editForm.email = user.email || '';
		editForm.role = user.role || 'user';
		editModal?.showModal();
	}

	function closeEditModal() {
		editModal?.close();
		selectedUser = null;
	}

	async function saveUserInfo() {
		if (!selectedUser) return;
		try {
			const res = await authClient.admin.setRole({
				userId: selectedUser.id,
				role: editForm.role as 'visiteur' | 'administrateur' | 'administrateur'
			});
			if (res.error) {
				showToast('Échec de la mise à jour : ' + res.error.message, 'error');
				return;
			}
			users = users.map((u) =>
				u.id === selectedUser?.id
					? { ...u, name: editForm.name, email: editForm.email, role: editForm.role }
					: u
			);
			closeEditModal();
			showToast('Utilisateur mis à jour avec succès');
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Échec de la mise à jour';
			showToast(message, 'error');
		}
	}

	// CREATE USER
	function openCreateModal() {
		createForm = { email: '', password: '', name: '', role: 'user', projetIds: [] };
		createProjectSearch = '';
		createModal?.showModal();
	}

	function closeCreateModal() {
		createModal?.close();
	}

	async function createUser() {
		try {
			const res = await authClient.admin.createUser({
				email: createForm.email,
				password: createForm.password,
				name: createForm.name,
				role: createForm.role as any
			});

			if (res.data) {
				const newUserId = res.data.user.id;

				// Assigner les projets si sélectionnés
				if (createForm.projetIds.length > 0) {
					const formData = new FormData();
					formData.append('userId', newUserId);
					createForm.projetIds.forEach((id) => formData.append('projetIds', id));

					await fetch('?/setProjets', {
						method: 'POST',
						body: formData
					});
				}

				// Recharger les données du serveur pour obtenir les associations mises à jour
				await invalidateAll();
				// Recharger les utilisateurs pour afficher le nouvel utilisateur
				await loadUsers();
				closeCreateModal();
				showToast('Utilisateur créé avec succès');
			} else if (res.error) {
				showToast('Échec de la création : ' + res.error.message, 'error');
			}
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.log(e.message || 'Échec du chargement des utilisateurs');
				showToast("Échec de la création de l'utilisateur", 'error');
			} else {
				console.log(String(e));
			}
		}
	}

	// CLÔTURE / RÉACTIVATION DE COMPTE
	function openBanModal(user: User) {
		selectedUser = user;
		banReason = '';
		banModal?.showModal();
	}

	function closeBanModal() {
		banModal?.close();
		selectedUser = null;
		banReason = '';
	}

	async function confirmBan() {
		if (!selectedUser) return;
		const wasBanned = selectedUser.banned;
		try {
			if (wasBanned) {
				const res = await authClient.admin.unbanUser({ userId: selectedUser.id });
				if (res.error) {
					showToast('Échec de la réactivation : ' + res.error.message, 'error');
					return;
				}
				users = users.map((u) => (u.id === selectedUser!.id ? { ...u, banned: false } : u));
				showToast('Compte réactivé avec succès');
			} else {
				const res = await authClient.admin.banUser({
					userId: selectedUser.id,
					banReason: banReason || 'Action administrative'
				});
				if (res.error) {
					showToast('Échec de la clôture : ' + res.error.message, 'error');
					return;
				}
				users = users.map((u) => (u.id === selectedUser!.id ? { ...u, banned: true } : u));
				showToast('Compte clôturé avec succès');
			}
			closeBanModal();
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.log(e.message || 'Échec du chargement des utilisateurs');
				showToast(
					wasBanned ? 'Échec de la réactivation du compte' : 'Échec de la clôture du compte',
					'error'
				);
			} else {
				console.log(String(e));
				showToast(
					wasBanned ? 'Échec de la réactivation du compte' : 'Échec de la clôture du compte',
					'error'
				);
			}
		}
	}

	// DELETE USER
	function openDeleteModal(user: User) {
		selectedUser = user;
		deleteModal?.showModal();
	}

	function closeDeleteModal() {
		deleteModal?.close();
		selectedUser = null;
	}

	async function confirmDelete() {
		if (!selectedUser) return;
		try {
			const res = await authClient.admin.removeUser({
				userId: selectedUser.id
			});
			if (res.error) {
				showToast('Échec de la suppression : ' + res.error.message, 'error');
				return;
			}
			users = users.filter((u) => u.id !== selectedUser!.id);
			closeDeleteModal();
			showToast('Utilisateur supprimé avec succès');
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Échec de la suppression';
			showToast(message, 'error');
		}
	}

	function openPasswordModal(user: User) {
		selectedUser = user;
		passwordForm.newPassword = '';
		passwordModal?.showModal();
	}

	function closePasswordModal() {
		passwordModal?.close();
		selectedUser = null;
	}

	async function setPassword() {
		if (!selectedUser) return;
		try {
			const res = await authClient.admin.setUserPassword({
				userId: selectedUser.id,
				newPassword: passwordForm.newPassword
			});
			if (res.error) {
				showToast('Échec de la mise à jour du mot de passe : ' + res.error.message, 'error');
				return;
			}
			closePasswordModal();
			showToast('Mot de passe mis à jour avec succès');
		} catch (e: unknown) {
			if (e instanceof Error) {
				console.log(e.message || 'Échec du chargement des utilisateurs');
				showToast('Échec de la mise à jour du mot de passe', 'error');
			} else {
				console.log(String(e));
				showToast('Échec de la mise à jour du mot de passe', 'error');
			}
		}
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
				<button on:click={openCreateModal} class="btn">
					<UserPen size={24} />
					Nouvel utilisateur
				</button>
				<dialog bind:this={createModal} class="modal">
					<div class="modal-box">
						<div class="flex items-center gap-3 mb-6">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
								<UserPlus />
							</div>
							<h3 class="text-lg font-semibold">Créer un utilisateur</h3>
						</div>
						<div class="space-y-4">
							<div>
								<label for="create-name" class="block text-sm font-medium mb-1.5">Nom</label>
								<input
									id="create-name"
									bind:value={createForm.name}
									type="text"
									placeholder="Jean Dupont"
									class="input"
								/>
							</div>
							<div>
								<label for="create-email" class="block text-sm font-medium mb-1.5">Email</label>
								<input
									id="create-email"
									bind:value={createForm.email}
									type="email"
									placeholder="jean.dupont@exemple.com"
									class="input"
								/>
							</div>
							<div>
								<label for="create-password" class="block text-sm font-medium mb-1.5"
									>Mot de passe</label
								>
								<input
									id="create-password"
									bind:value={createForm.password}
									type="password"
									autocomplete="new-password"
									placeholder="••••••••"
									class="input"
								/>
							</div>
							<div>
								<label for="create-role" class="block text-sm font-medium mb-1.5">Rôle</label>
								<select id="create-role" bind:value={createForm.role} class="select">
									<option value="user">Utilisateur</option>
									<option value="collaborator">Collaborateur</option>
									<option value="admin">Administrateur</option>
								</select>
							</div>
							<div>
								<label for="create-projets" class="block text-sm font-medium mb-1.5">Projets</label>
								<label class="relative mb-2">
									<Search />
									<input
										type="search"
										bind:value={createProjectSearch}
										placeholder="Rechercher un projet..."
									/>
								</label>
								<div class="max-h-40 overflow-y-auto rounded-lg border border-slate-300 p-2">
									{#if projets.length === 0}
										<p class="text-sm py-2 px-2">Aucun projet disponible</p>
									{:else if filteredCreateProjets.length === 0}
										<p class="text-sm py-2 px-2">Aucun projet trouvé</p>
									{:else}
										{#each filteredCreateProjets as p (p.id)}
											<label
												class="flex items-center gap-2 rounded px-2 py-1.5 hover: cursor-pointer"
											>
												<input
													type="checkbox"
													value={p.id}
													checked={createForm.projetIds.includes(p.id)}
													on:change={(e) => {
														if (e.currentTarget.checked) {
															createForm.projetIds = [...createForm.projetIds, p.id];
														} else {
															createForm.projetIds = createForm.projetIds.filter(
																(id) => id !== p.id
															);
														}
													}}
													class="checkbox"
												/>
												<span class="text-sm"
													>{p.libelle} <span class="">({p.reference})</span></span
												>
											</label>
										{/each}
									{/if}
								</div>
								{#if createForm.projetIds.length > 0}
									<p class="text-xs mt-1">
										{createForm.projetIds.length} projet(s) sélectionné(s)
									</p>
								{/if}
							</div>
						</div>
						<div class="modal-action">
							<button type="button" class="btn btn-warning" on:click={closeCreateModal}
								>Annuler</button
							>
							<button type="button" class="btn btn-secondary" on:click={createUser}>Créer</button>
						</div>
					</div>
				</dialog>
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
									<span
										class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
									>
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
							<button
								on:click={() => openProjetsModal(user)}
								class="btn btn-ghost"
								title="Gérer les projets"
							>
								<Folder size={18} />
							</button>
							<dialog bind:this={projetsModal} class="modal">
								<div class="modal-box max-w-lg">
									{#if selectedUser}
										<form
											method="POST"
											action="?/setProjets"
											use:enhance={() => {
												return async ({ result }) => {
													if (result.type === 'success') {
														await invalidateAll();

														usersWithProjets = usersWithProjets.filter(
															(up) => up.userId !== selectedUser?.id
														);
														const newAssocs = projetsForm.projetIds.map((projetId) => ({
															userId: selectedUser!.id,
															projetId
														}));
														usersWithProjets = [...usersWithProjets, ...newAssocs];

														users = users.map((u) =>
															u.id === selectedUser?.id
																? { ...u, projetIds: projetsForm.projetIds }
																: u
														);

														closeProjetsModal();
														showToast('Projets mis à jour avec succès');
													} else {
														showToast('Échec de la mise à jour', 'error');
													}
												};
											}}
										>
											<input type="hidden" name="userId" value={selectedUser.id} />
											<div class="flex items-center gap-3 mb-6">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100"
												>
													<Folder />
												</div>
												<div>
													<h3 class="text-lg font-semibold">Gérer les projets</h3>
													<p class="text-sm">{selectedUser.name}</p>
												</div>
											</div>
											<div>
												<div class="block text-sm font-medium mb-1.5">Projets assignés</div>
												<label class="input">
													<Search />
													<input
														type="search"
														bind:value={modalProjectSearch}
														required
														placeholder="Rechercher un projet..."
													/>
												</label>

												<div
													class="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100"
												>
													{#if projets.length === 0}
														<p class="p-4 text-sm text-center">Aucun projet disponible</p>
													{:else if filteredModalProjets.length === 0}
														<p class="p-4 text-sm text-center">Aucun projet trouvé</p>
													{:else}
														{#each filteredModalProjets as p, i (i)}
															<label class="flex items-center gap-3 p-3 hover: cursor-pointer">
																<input
																	type="checkbox"
																	name="projetIds"
																	value={p.id}
																	checked={projetsForm.projetIds.includes(p.id)}
																	on:change={(e) => {
																		if (e.currentTarget.checked) {
																			projetsForm.projetIds = [...projetsForm.projetIds, p.id];
																		} else {
																			projetsForm.projetIds = projetsForm.projetIds.filter(
																				(id) => id !== p.id
																			);
																		}
																	}}
																	class="checkbox"
																/>
																<div class="flex-1 min-w-0">
																	<p class="text-sm font-medium truncate">{p.libelle}</p>
																	<p class="text-xs truncate">Réf: {p.reference}</p>
																</div>
															</label>
														{/each}
													{/if}
												</div>
												<p class="mt-2 text-xs">
													{projetsForm.projetIds.length} projet{projetsForm.projetIds.length > 1
														? 's'
														: ''} sélectionné{projetsForm.projetIds.length > 1 ? 's' : ''}
												</p>
											</div>
											<div class="modal-action">
												<button type="button" class="btn" on:click={closeProjetsModal}
													>Annuler</button
												>
												<button type="submit" class="btn">Enregistrer</button>
											</div>
										</form>
									{/if}
								</div>
							</dialog>

							<button
								on:click={() => openEditModal(user)}
								class="btn btn-ghost"
								title="Modifier les informations"
							>
								<Pencil size={18} />
							</button>
							<dialog bind:this={editModal} class="modal">
								<div class="modal-box">
									{#if selectedUser}
										<div class="flex items-center gap-3 mb-6">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"
											>
												<Pencil />
											</div>
											<div>
												<h3 class="text-lg font-semibold">Modifier l'utilisateur</h3>
												<p class="text-sm">{selectedUser.email}</p>
											</div>
										</div>
										<div class="space-y-4">
											<div>
												<label for="edit-name" class="block text-sm font-medium mb-1.5">Nom</label>
												<input
													id="edit-name"
													bind:value={editForm.name}
													type="text"
													class="input"
												/>
											</div>
											<div>
												<label for="edit-email" class="block text-sm font-medium mb-1.5"
													>Email</label
												>
												<input
													id="edit-email"
													bind:value={editForm.email}
													type="email"
													class="input"
												/>
											</div>
											<div>
												<label for="edit-role" class="block text-sm font-medium mb-1.5">Rôle</label>
												<select id="edit-role" bind:value={editForm.role} class="select">
													<option value="user">Utilisateur</option>
													<option value="collaborator">Collaborateur</option>
													<option value="admin">Administrateur</option>
												</select>
											</div>
										</div>
									{/if}
									<div class="modal-action">
										<button type="button" class="btn" on:click={closeEditModal}>Annuler</button>
										<button type="button" class="btn" on:click={saveUserInfo}>Enregistrer</button>
									</div>
								</div>
							</dialog>

							<button
								on:click={() => openPasswordModal(user)}
								class="btn btn-ghost"
								title="Changer le mot de passe"
							>
								<KeyRound size={18} />
							</button>
							<dialog bind:this={passwordModal} class="modal">
								<div class="modal-box">
									{#if selectedUser}
										<div class="flex items-center gap-3 mb-6">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100"
											>
												<Pencil />
											</div>
											<div>
												<h3 class="text-lg font-semibold">Changer le mot de passe</h3>
												<p class="text-sm">{selectedUser.name}</p>
											</div>
										</div>
										<div>
											<label for="new-password" class="block text-sm font-medium mb-1.5"
												>Nouveau mot de passe</label
											>
											<input
												id="new-password"
												bind:value={passwordForm.newPassword}
												type="password"
												autocomplete="new-password"
												placeholder="Entrez le nouveau mot de passe"
												class="input"
											/>
											<p class="mt-2 text-xs">
												Le mot de passe doit contenir au moins 8 caractères.
											</p>
										</div>
									{/if}
									<div class="modal-action">
										<button type="button" class="btn" on:click={closePasswordModal}>Annuler</button>
										<button type="button" class="btn" on:click={setPassword}>Mettre à jour</button>
									</div>
								</div>
							</dialog>

							<button
								on:click={() => openBanModal(user)}
								class="btn btn-ghost transition-colors {user.banned
									? 'text-green-500 hover:bg-green-50 hover:text-green-700'
									: ' hover:bg-amber-50 hover:text-amber-600'}"
								title={user.banned ? 'Réactiver le compte' : 'Clôturer le compte'}
							>
								<Ban />
							</button>
							<dialog bind:this={banModal} class="modal">
								<div class="modal-box">
									{#if selectedUser}
										<div class="flex items-center gap-3 mb-6">
											<div
												class="flex h-10 w-10 items-center justify-center rounded-full {selectedUser.banned
													? 'bg-green-100'
													: 'bg-amber-100'}"
											>
												<X />
											</div>
											<div>
												<h3 class="text-lg font-semibold">
													{selectedUser.banned ? 'Réactiver le compte' : 'Clôturer le compte'}
												</h3>
												<p class="text-sm">{selectedUser.name}</p>
											</div>
										</div>
										{#if selectedUser.banned}
											<p class="text-sm">
												Êtes-vous sûr de vouloir réactiver ce compte ? Il pourra à nouveau accéder à
												la plateforme.
											</p>
										{:else}
											<div>
												<label for="ban-reason" class="block text-sm font-medium mb-1.5"
													>Raison de la clôture (optionnel)</label
												>
												<textarea
													id="ban-reason"
													bind:value={banReason}
													rows="3"
													placeholder="Ex: Violation des conditions d'utilisation..."
													class="input"
												></textarea>
											</div>
										{/if}
										<div class="modal-action">
											<button type="button" class="btn" on:click={closeBanModal}>Annuler</button>
											<button
												type="button"
												class="btn transition-colors {selectedUser.banned
													? 'bg-green-600 hover:bg-green-700'
													: 'bg-amber-600 hover:bg-amber-700'}"
												on:click={confirmBan}
											>
												{selectedUser.banned ? 'Réactiver' : 'Clôturer'}
											</button>
										</div>
									{/if}
								</div>
							</dialog>

							<button
								on:click={() => openDeleteModal(user)}
								class="btn btn-ghost hover:text-red-500 hover:bg-red-50"
								title="Supprimer"
							>
								<X size={18} />
							</button>
							<dialog bind:this={deleteModal} class="modal">
								<div class="modal-box">
									{#if selectedUser}
										<div class="flex items-center gap-3 mb-6">
											<div>
												<h3 class="text-lg font-semibold">Supprimer l'utilisateur</h3>
												<p class="text-sm">{selectedUser.name}</p>
											</div>
										</div>
										<div class="rounded-lg bg-red-50 border border-red-200 p-4">
											<p class="text-sm text-red-800">
												<strong>Attention :</strong> Cette action est irréversible. Toutes les données
												associées à cet utilisateur seront définitivement supprimées.
											</p>
										</div>
									{/if}
									<div class="modal-action">
										<button type="button" class="btn" on:click={closeDeleteModal}>Annuler</button>
										<button type="button" class="btn btn-warning" on:click={confirmDelete}>
											Supprimer définitivement
										</button>
									</div>
								</div>
							</dialog>
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
