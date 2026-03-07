<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import logoPEMD from '$lib/assets/pemd360.png';
	import {
		Menu,
		ClipboardList,
		ClipboardList as ClipboardListAlt,
		Grid3x3,
		LogOut,
		ChevronDown,
		ChevronRight,
		Settings,
		Files,
		Hammer
	} from 'lucide-svelte';
	import { slide } from 'svelte/transition';

	let { children, data } = $props();

	// Récupérer les données de session
	const session = authClient.useSession();

	// Récupérer isAdmin depuis les données du serveur avec $derived
	const isAdmin = $derived(data.isAdmin);

	// Sidebar state
	let sidebarOpen = $state(true);

	// Type definition for navigation links
	type NavLink = {
		href?: string;
		label: string;
		icon:
			| null
			| typeof ClipboardList
			| typeof ClipboardListAlt
			| typeof Grid3x3
			| typeof LogOut
			| typeof ChevronDown
			| typeof ChevronRight
			| typeof Settings
			| typeof Files
			| typeof Hammer
			| typeof Menu;
		adminOnly?: boolean;
		subItems?: Array<{
			href: string;
			label: string;
			icon:
				| null
				| typeof Menu
				| typeof ClipboardList
				| typeof ClipboardListAlt
				| typeof Grid3x3
				| typeof LogOut
				| typeof ChevronDown
				| typeof ChevronRight
				| typeof Settings
				| typeof Files
				| typeof Hammer;
			adminOnly?: boolean;
		}>;
	};

	// Configuration centralisée des liens de navigation
	const allNavLinks: NavLink[] = [
		{
			href: '/app/projets',
			label: 'Projets',
			icon: Hammer
		},
		{
			label: 'Administration',
			icon: Settings,
			adminOnly: true,
			subItems: [
				{
					href: '/app/admin/utilisateurs',
					label: 'Utilisateurs',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/societes',
					label: 'Sociétés',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/etablissements',
					label: 'Etablissements',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/projets',
					label: 'Projets',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/nature',
					label: 'Nature',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/macro-categories',
					label: 'Macro-categories',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/categories',
					label: 'Categories',
					icon: null,
					adminOnly: true
				},
				{
					href: '/app/admin/objets',
					label: 'Objets',
					icon: null,
					adminOnly: true
				}
			]
		},
		{
			label: 'Inventaires',
			icon: Files,
			subItems: [
				{
					href: '/app/admin/amiante',
					label: 'Inventaire risques',
					icon: ClipboardList
				},
				{
					href: '/app/admin/pemd-tableau',
					label: 'Inventaire PEMD',
					icon: ClipboardListAlt
				}
			]
		},
		{
			label: 'Synthèse',
			icon: Grid3x3,
			subItems: [
				{
					href: '/app/tableau-synthese',
					label: 'Tableau Synthèse PEMD',
					icon: null
				},
				{
					href: '/app/tableau-synthese-reemploi',
					label: 'Tableau Synthèse Réemploi',
					icon: null
				}
			]
		}
	];

	// Fonction pour vérifier si un lien est actif
	function isActive(href: string): boolean {
		return $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');
	}

	// Fonction pour vérifier si un menu contient la page active
	function hasActiveSubItem(link: NavLink): boolean {
		if (!link.subItems) return false;
		return link.subItems.some((sub) => isActive(sub.href));
	}

	// Initialiser les menus étendus en fonction de la page active
	function initExpandedMenus() {
		const expanded: Record<string, boolean> = {};
		for (const link of allNavLinks) {
			if (link.subItems) {
				expanded[link.label] = hasActiveSubItem(link);
			}
		}
		return expanded;
	}

	// State for expanded submenus
	let expandedMenus = $state<Record<string, boolean>>(initExpandedMenus());

	// Mettre à jour les menus quand la route change
	$effect(() => {
		const currentPath = $page.url.pathname;
		// Recalculer quels menus doivent être ouverts
		for (const link of allNavLinks) {
			if (link.subItems) {
				expandedMenus[link.label] = hasActiveSubItem(link);
			}
		}
	});

	function toggleMenu(label: string) {
		expandedMenus[label] = !expandedMenus[label];
	}

	// Filtrer les liens selon le rôle de l'utilisateur
	const navLinks = $derived(
		allNavLinks.filter((link) => {
			if (link.adminOnly && !isAdmin) return false;
			// If it has subItems, check if at least one visible subItem exists
			if (link.subItems) {
				const visibleSubItems = link.subItems.filter((sub) => !sub.adminOnly || isAdmin);
				return visibleSubItems.length > 0;
			}
			return true;
		})
	);

	async function handleLogout() {
		await authClient.signOut();
		console.log('signing out');
		goto('/login');
	}
</script>

<svelte:head>
	<meta name="color-scheme" content="light dark" />
	<link rel="icon" href="/favicon.png" />
	<title>PEMD360</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative flex h-screen overflow-hidden font-[Poppins]">
	<!-- Mobile Sidebar Overlay -->
	{#if sidebarOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="absolute inset-0 z-40 lg:hidden"
			onclick={() => (sidebarOpen = false)}
			transition:fade={{ duration: 200 }}
		></div>
	{/if}

	<!-- Sidebar -->
	<aside
		class="absolute inset-y-0 left-0 z-50 flex w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0 {sidebarOpen
			? 'translate-x-0'
			: '-translate-x-full'}"
	>
		<!-- Logo -->
		<div class="flex h-20 shrink-0 items-center justify-center px-4">
			<a
				href="/"
				onclick={() => {
					if (window.innerWidth < 1024) sidebarOpen = false;
				}}
			>
				<img src={logoPEMD} alt="PEMD 360" class="h-16 w-auto object-contain" />
			</a>
		</div>

		<!-- Navigation - scrollable -->
		<nav class="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
			{#each navLinks as link (link.label)}
				{@const IconComponent = link.icon}

				{#if link.subItems && link.subItems.length > 0}
					<div class="rounded-lg overflow-hidden">
						<button class="btn btn-ghost" onclick={() => toggleMenu(link.label)}>
							<div class="flex items-center gap-3">
								<IconComponent class="h-5 w-5" />
								<span class="font-medium">{link.label}</span>
							</div>
							{#if expandedMenus[link.label]}
								<ChevronDown class="h-4 w-4" />
							{:else}
								<ChevronRight class="h-4 w-4" />
							{/if}
						</button>

						{#if expandedMenus[link.label]}
							<div class="space-y-1 py-1" transition:slide={{ duration: 200 }}>
								{#each link.subItems as subLink (subLink.href)}
									{#if !subLink.adminOnly || isAdmin}
										<a
											href={subLink.href}
											class="flex items-center gap-3 pl-11 pr-4 py-2 text-sm transition-colors {isActive(
												subLink.href
											)
												? 'text-emerald-600 font-medium'
												: 'hover:text-emerald-600'}"
											onclick={() => {
												if (window.innerWidth < 1024) sidebarOpen = false;
											}}
										>
											<span>{subLink.label}</span>
										</a>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{:else}
					<a
						href={link.href}
						class="btn btn-ghost"
						onclick={() => {
							if (window.innerWidth < 1024) sidebarOpen = false;
						}}
					>
						<IconComponent class="h-5 w-5" />
						<span class="font-medium">{link.label}</span>
					</a>
				{/if}
			{/each}
		</nav>

		<!-- User Profile Section - Fixed at bottom -->
		<div class="shrink-0 p-4">
			{#if data.user}
				<div class="mb-4 rounded-lg p-3">
					<div class="mb-2 flex items-center gap-3">
						<div class="flex-1 overflow-hidden">
							<p class="truncate font-semibold">{data.user.name}</p>
							<p class="truncate text-xs">
								{data.user.role || 'Utilisateur'}
							</p>
						</div>
					</div>
					<p class="truncate text-xs">{data.user.email}</p>
				</div>
			{/if}

			<button onclick={handleLogout} class="btn btn-soft btn-warning">
				<LogOut class="h-5 w-5 shrink-0" />
				<span class="font-medium">Déconnexion</span>
			</button>
		</div>
	</aside>

	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto min-w-0 w-full relative">
		<!-- Mobile Header for Hamburger -->
		<div class="sticky top-0 z-30 flex items-center px-4 py-2 lg:hidden">
			<button class="btn" onclick={() => (sidebarOpen = !sidebarOpen)}>
				<Menu class="h-6 w-6" />
			</button>
			<span class="ml-3 font-semibold">Menu</span>
		</div>

		<!-- Page Content -->
		<div class="p-4 lg:p-6">
			{@render children()}
		</div>
	</main>
</div>
