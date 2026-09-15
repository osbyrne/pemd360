<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { onDestroy } from "svelte";
  import { createOperation, isOperationSuccess } from "$lib/client/effect/operation.svelte";
  import { signOut } from "$lib/client/workflows/auth";
  import { page } from "$app/stores";
  import logoPEMD from "$lib/assets/pemd360.png";
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
    Hammer,
  } from "lucide-svelte";

  let { children, data } = $props();

  // Récupérer les données de session
  const session = authClient.useSession();
  const logoutOperation = createOperation<void, unknown>();

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
      href: "/app/projets",
      label: "Projets",
      icon: Hammer,
    },
    {
      label: "Administration",
      icon: Settings,
      adminOnly: true,
      subItems: [
        {
          href: "/app/admin/utilisateurs",
          label: "Utilisateurs",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/societes",
          label: "Sociétés",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/etablissements",
          label: "Etablissements",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/projets",
          label: "Projets",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/nature",
          label: "Nature",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/macro-categories",
          label: "Macro-categories",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/categories",
          label: "Categories",
          icon: null,
          adminOnly: true,
        },
        {
          href: "/app/admin/objets",
          label: "Objets",
          icon: null,
          adminOnly: true,
        },
      ],
    },
    {
      label: "Inventaires",
      icon: Files,
      subItems: [
        {
          href: "/app/admin/risques",
          label: "Inventaire risques",
          icon: ClipboardList,
        },
        {
          href: "/app/admin/pemd-tableau",
          label: "Inventaire PEMD",
          icon: ClipboardListAlt,
        },
      ],
    },
    {
      label: "Synthèse",
      icon: Grid3x3,
      subItems: [
        {
          href: "/app/tableau-synthese",
          label: "Tableau Synthèse PEMD",
          icon: null,
        },
        {
          href: "/app/tableau-synthese-reemploi",
          label: "Tableau Synthèse Réemploi",
          icon: null,
        },
      ],
    },
  ];

  // Fonction pour vérifier si un lien est actif
  function isActive(href: string): boolean {
    return $page.url.pathname === href || $page.url.pathname.startsWith(href + "/");
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
    }),
  );

  async function handleLogout() {
    if (logoutOperation.state.pending) return;
    const result = await logoutOperation.execute(signOut());
    if (!isOperationSuccess(result)) {
      console.error("Sign-out failed", logoutOperation.state.error);
    }
    console.log("signing out");
    goto("/login");
  }

  onDestroy(() => logoutOperation.dispose());

  const styles = stylex.create({
    div: {
      position: "relative",
      display: "flex",
      height: "100vh",
      overflow: "hidden",
    },
    div2: {
      position: "absolute",
      inset: 0,
      zIndex: 40,
      display: {
        "@media (min-width: 1024px)": "none",
      },
    },
    aside: {
      position: {
        default: "absolute",
        "@media (min-width: 1024px)": "static",
      },
      top: 0,
      bottom: 0,
      left: "0rem",
      zIndex: 50,
      display: "flex",
      width: "16rem",
      flexDirection: "column",
      transitionProperty: "transform, translate, scale, rotate",
      transitionDuration: "300ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      "--translate-x": {
        "@media (min-width: 1024px)": "0rem",
      },
      translate: {
        "@media (min-width: 1024px)": "var(--translate-x, 0px) var(--translate-y, 0px)",
      },
    },
    div3: {
      display: "flex",
      height: "5rem",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
    },
    img: {
      height: "4rem",
      width: "auto",
      objectFit: "contain",
    },
    nav: {
      flex: "1 1 0%",
      "--stack-gap": "0.25rem",
      overflowY: "auto",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div4: {
      overflow: "hidden",
      borderRadius: ".5rem",
    },
    div5: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    IconComponent: {
      height: "1.25rem",
      width: "1.25rem",
    },
    span: {
      fontWeight: 500,
    },
    ChevronDown: {
      height: "1rem",
      width: "1rem",
    },
    div6: {
      "--stack-gap": "0.25rem",
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem",
    },
    a: {
      display: "flex",
    },
    div7: {
      flexShrink: 0,
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div8: {
      marginBottom: "1rem",
      borderRadius: ".5rem",
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
    },
    div9: {
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div10: {
      flex: "1 1 0%",
      overflow: "hidden",
    },
    p: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 600,
    },
    p2: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    LogOut: {
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
    },
    main: {
      position: "relative",
      width: "100%",
      minWidth: "0rem",
      flex: "1 1 0%",
      overflowY: "auto",
    },
    div11: {
      position: "sticky",
      top: "0rem",
      zIndex: 30,
      display: {
        default: "flex",
        "@media (min-width: 1024px)": "none",
      },
      alignItems: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
    },
    Menu: {
      height: "1.5rem",
      width: "1.5rem",
    },
    span2: {
      marginLeft: "0.75rem",
      fontWeight: 600,
    },
    div12: {
      paddingTop: {
        default: "1rem",
        "@media (min-width: 1024px)": "1.5rem",
      },
      paddingRight: {
        default: "1rem",
        "@media (min-width: 1024px)": "1.5rem",
      },
      paddingBottom: {
        default: "1rem",
        "@media (min-width: 1024px)": "1.5rem",
      },
      paddingLeft: {
        default: "1rem",
        "@media (min-width: 1024px)": "1.5rem",
      },
    },
    stackSpacing025: { marginBlockEnd: { default: "0.25rem", ":last-child": 0 } },
  });
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

<div class={stylex.attrs(styles.div).class}>
  <!-- Mobile Sidebar Overlay -->
  {#if sidebarOpen}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class={stylex.attrs(styles.div2).class} onclick={() => (sidebarOpen = false)}></div>
  {/if}

  <!-- Sidebar -->
  <aside
    class={stylex.attrs(styles.aside, sidebarOpen ? ui.translateX0 : ui.negativeTranslateXFull)
      .class}
  >
    <!-- Logo -->
    <div class={stylex.attrs(styles.div3).class}>
      <a
        href="/"
        onclick={() => {
          if (window.innerWidth < 1024) sidebarOpen = false;
        }}
      >
        <img src={logoPEMD} alt="PEMD 360" class={stylex.attrs(styles.img).class} />
      </a>
    </div>

    <!-- Navigation - scrollable -->
    <nav class={stylex.attrs(styles.nav).class}>
      {#each navLinks as link (link.label)}
        {@const IconComponent = link.icon}

        {#if link.subItems && link.subItems.length > 0}
          <div class={stylex.attrs(styles.stackSpacing025, styles.div4).class}>
            <button
              class={stylex.attrs(ui.button, ui.buttonGhost).class}
              onclick={() => toggleMenu(link.label)}
            >
              <div class={stylex.attrs(styles.div5).class}>
                <IconComponent class={stylex.attrs(styles.IconComponent).class} />
                <span class={stylex.attrs(styles.span).class}>{link.label}</span>
              </div>
              {#if expandedMenus[link.label]}
                <ChevronDown class={stylex.attrs(styles.ChevronDown).class} />
              {:else}
                <ChevronRight class={stylex.attrs(styles.ChevronDown).class} />
              {/if}
            </button>

            {#if expandedMenus[link.label]}
              <div class={stylex.attrs(styles.div6).class}>
                {#each link.subItems as subLink (subLink.href)}
                  {#if !subLink.adminOnly || isAdmin}
                    <a
                      href={subLink.href}
                      class={stylex.attrs(
                        styles.stackSpacing025,
                        ui.button,
                        ui.buttonGhost,
                        styles.a,
                      ).class}
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
            class={stylex.attrs(styles.stackSpacing025, ui.button, ui.buttonGhost).class}
            onclick={() => {
              if (window.innerWidth < 1024) sidebarOpen = false;
            }}
          >
            <IconComponent class={stylex.attrs(styles.IconComponent).class} />
            <span class={stylex.attrs(styles.span).class}>{link.label}</span>
          </a>
        {/if}
      {/each}
    </nav>

    <!-- User Profile Section - Fixed at bottom -->
    <div class={stylex.attrs(styles.div7).class}>
      {#if data.user}
        <div class={stylex.attrs(styles.div8).class}>
          <div class={stylex.attrs(styles.div9).class}>
            <div class={stylex.attrs(styles.div10).class}>
              <p class={stylex.attrs(styles.p).class}>{data.user.name}</p>
              <p class={stylex.attrs(styles.p2).class}>
                {data.user.role || "Utilisateur"}
              </p>
            </div>
          </div>
          <p class={stylex.attrs(styles.p2).class}>{data.user.email}</p>
        </div>
      {/if}

      <button onclick={handleLogout} class={stylex.attrs(ui.button, ui.buttonGhost).class}>
        <LogOut class={stylex.attrs(styles.LogOut).class} />
        Déconnexion
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main class={stylex.attrs(styles.main).class}>
    <!-- Mobile Header for Hamburger -->
    <div class={stylex.attrs(styles.div11).class}>
      <button class={stylex.attrs(ui.button).class} onclick={() => (sidebarOpen = !sidebarOpen)}>
        <Menu class={stylex.attrs(styles.Menu).class} />
      </button>
      <span class={stylex.attrs(styles.span2).class}>Menu</span>
    </div>

    <!-- Page Content -->
    <div class={stylex.attrs(styles.div12).class}>
      {@render children()}
    </div>
  </main>
</div>
