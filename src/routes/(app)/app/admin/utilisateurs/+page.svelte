<script lang="ts">
  import { theme } from "../../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { onDestroy, onMount } from "svelte";
  import {
    createOperation,
    isOperationSuccess,
    operationErrorMessage,
  } from "$lib/client/effect/operation.svelte";
  import type { ClientUserPage } from "$lib/client/services/authentication";
  import { listUsers } from "$lib/client/workflows/auth";
  import Pagination from "$lib/components/Pagination.svelte";
  import { Users, Bug, RefreshCcw, Search } from "lucide-svelte";
  import CreateUserModal from "$lib/components/CreateUserModal.svelte";
  import UserProjetsModal from "$lib/components/UserProjetsModal.svelte";
  import EditUserModal from "$lib/components/EditUserModal.svelte";
  import UserPasswordModal from "$lib/components/UserPasswordModal.svelte";
  import UserBanModal from "$lib/components/UserBanModal.svelte";
  import DeleteUserModal from "$lib/components/DeleteUserModal.svelte";

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
  const loadOperation = createOperation<ClientUserPage, unknown>();
  let loading = true;
  let error: string | null = null;

  // Projets from server
  $: projets = (data.projets || []) as Projet[];
  $: usersWithProjets = (data.usersWithProjets || []) as { userId: string; projetId: string }[];

  // Pagination & Search
  let query = "";
  let perPage = 25;
  let page = 1;

  // Toast/Notification
  let toast: { message: string; type: "success" | "error" } | null = null;

  // Show toast
  function showToast(message: string, type: "success" | "error" = "success") {
    toast = { message, type };
    setTimeout(() => (toast = null), 3000);
  }

  // Get user's projets
  function getUserProjets(userId: string): string[] {
    return usersWithProjets.filter((up) => up.userId === userId).map((up) => up.projetId);
  }

  // Get projets names
  function getProjetsNames(projetIds: string[]): string {
    if (!projetIds || projetIds.length === 0) return "Aucun";
    const names = projetIds.map((id) => {
      const p = projets.find((proj) => proj.id === id);
      return p?.libelle || "Inconnu";
    });
    if (names.length <= 2) return names.join(", ");
    return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }

  // Get projets count
  function getProjetsCount(userId: string): number {
    return getUserProjets(userId).length;
  }

  async function loadUsers() {
    if (loadOperation.state.pending) return;
    loading = true;
    error = null;
    const result = await loadOperation.execute(
      listUsers({
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
      }),
      { mode: "latest" },
    );

    if (isOperationSuccess(result)) {
      users = result.value.users.map((user) => ({
        ...user,
        image: user.image ?? undefined,
        projetIds: getUserProjets(user.id),
      }));
    } else {
      error = operationErrorMessage(result, "Une erreur est survenue");
    }
    loading = loadOperation.state.pending;
  }

  onMount(() => {
    void loadUsers();
  });

  onDestroy(() => loadOperation.dispose());

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
      ...projetIds.map((projetId) => ({ userId, projetId })),
    ];
    users = users.map((u) => (u.id === userId ? { ...u, projetIds } : u));
  }

  function handleUserUpdated(
    event: CustomEvent<{ userId: string; name: string; email: string; role: string }>,
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
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }
  const pulse = stylex.keyframes({ "50%": { opacity: 0.5 } });

  const styles = stylex.create({
    main: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "80rem",
    },
    div: {
      marginBottom: "2rem",
    },
    div2: {
      display: {
        "@media (min-width: 640px)": "flex",
      },
      alignItems: {
        "@media (min-width: 640px)": "center",
      },
      justifyContent: {
        "@media (min-width: 640px)": "space-between",
      },
    },
    h1: {
      fontSize: {
        default: "1.5rem",
        "@media (min-width: 640px)": "1.875rem",
      },
      lineHeight: {
        default: "2rem",
        "@media (min-width: 640px)": "2.25rem",
      },
      fontWeight: 700,
      letterSpacing: "-.025em",
    },
    p: {
      marginTop: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div3: {
      marginTop: {
        default: "1rem",
        "@media (min-width: 640px)": "0rem",
      },
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
    },
    label: {
      position: "relative",
      marginBottom: "1.5rem",
    },
    div4: {
      marginBottom: "1.5rem",
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(88.5% 0.062 18.334)",
      backgroundColor: "oklch(97.1% 0.013 17.38)",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div5: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
    },
    h3: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
      color: "oklch(44.4% 0.177 26.899)",
    },
    p2: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: "oklch(50.5% 0.213 27.518)",
    },
    ul: {
      borderRadius: ".5rem",
      backgroundColor: theme.base100,
      boxShadow: "0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a",
    },
    div6: {
      "--divider-width": "1px",
      "--divider-color": "oklch(96.8% 0.007 247.896)",
    },
    div7: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    div8: {
      height: "3rem",
      width: "3rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: "9999px",
    },
    div9: {
      flex: "1 1 0%",
      "--stack-gap": "0.5rem",
    },
    div10: {
      height: "1rem",
      width: "8rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: ".25rem",
    },
    div11: {
      height: "0.75rem",
      width: "12rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: ".25rem",
    },
    div12: {
      height: "1.5rem",
      width: "4rem",
      animationName: pulse,
      animationDuration: "2s",
      animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
      borderRadius: "9999px",
    },
    div13: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
    p3: {
      fontWeight: 500,
    },
    p4: {
      marginTop: "0.25rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div14: {
      minWidth: "0rem",
      flex: "1 1 0%",
    },
    div15: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    p5: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontWeight: 600,
    },
    span: {
      borderRadius: "9999px",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.125rem",
      paddingBottom: "0.125rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    p6: {
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div16: {
      display: {
        default: "none",
        "@media (min-width: 768px)": "flex",
      },
      flexDirection: {
        "@media (min-width: 768px)": "column",
      },
      alignItems: {
        "@media (min-width: 768px)": "flex-end",
      },
    },
    p7: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    p8: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
    div17: {
      marginRight: "1rem",
      display: {
        default: "none",
        "@media (min-width: 1024px)": "flex",
      },
      width: "8rem",
      flexDirection: {
        "@media (min-width: 1024px)": "column",
      },
      alignItems: {
        "@media (min-width: 1024px)": "flex-end",
      },
    },
    p9: {
      maxWidth: "7.5rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div18: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      borderLeftWidth: "1px",
      borderLeftStyle: "solid",
      borderColor: "oklch(92.9% 0.013 255.508)",
      paddingLeft: "0.5rem",
    },
    span2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Admin · Utilisateurs</title>
</svelte:head>

<main class={stylex.attrs(styles.main).class}>
  <!-- Header -->
  <div class={stylex.attrs(styles.div).class}>
    <div class={stylex.attrs(styles.div2).class}>
      <div>
        <h1 class={stylex.attrs(styles.h1).class}>Gestion des utilisateurs</h1>
        <p class={stylex.attrs(styles.p).class}>
          Gérez les utilisateurs, leurs rôles et leurs accès.
        </p>
      </div>
      <div class={stylex.attrs(styles.div3).class}>
        <CreateUserModal
          {projets}
          on:created={loadUsers}
          on:toast={(e) => showToast(e.detail.message, e.detail.type)}
        />
      </div>
    </div>
  </div>

  <!-- Search Bar -->
  <label class={stylex.attrs(ui.input, styles.label).class}>
    <Search />
    <input type="search" bind:value={query} placeholder="Rechercher par nom ou email..." />
  </label>

  <!-- Error State -->
  {#if error}
    <div class={stylex.attrs(styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <Bug size={24} />
        <div>
          <h3 class={stylex.attrs(styles.h3).class}>Erreur de chargement</h3>
          <p class={stylex.attrs(styles.p2).class}>{error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Users Grid -->
  <ul class={stylex.attrs(ui.list, styles.ul).class}>
    {#if loading}
      <div class={stylex.attrs(styles.div6).class}>
        {#each [...Array(5).keys()] as i (i)}
          <div class={stylex.attrs(ui.divideChild, styles.div7).class}>
            <div class={stylex.attrs(styles.div8).class}></div>
            <div class={stylex.attrs(styles.div9).class}>
              <div class={stylex.attrs(styles.stackSpacing05, styles.div10).class}></div>
              <div class={stylex.attrs(styles.stackSpacing05, styles.div11).class}></div>
            </div>
            <div class={stylex.attrs(styles.div12).class}></div>
          </div>
        {/each}
      </div>
    {:else if displayedUsers.length === 0}
      <div class={stylex.attrs(styles.div13).class}>
        <Users />
        <p class={stylex.attrs(styles.p3).class}>Aucun utilisateur trouvé</p>
        <p class={stylex.attrs(styles.p4).class}>Essayez de modifier vos critères de recherche</p>
      </div>
    {:else}
      <div>
        {#each displayedUsers as user (user.id)}
          <li class={stylex.attrs(ui.listRow).class}>
            <div class={stylex.attrs(styles.div14).class}>
              <div class={stylex.attrs(styles.div15).class}>
                <p class={stylex.attrs(styles.p5).class}>{user.name}</p>
                {#if user.role === "admin"}
                  <span class={stylex.attrs(styles.span).class}> Administrateur </span>
                {:else if user.role === "collaborator"}
                  <span class={stylex.attrs(styles.span).class}> Collaborateur </span>
                {:else}
                  <span class={stylex.attrs(styles.span).class}> Utilisateur </span>
                {/if}
              </div>
              <p class={stylex.attrs(styles.p6).class}>{user.email}</p>
            </div>

            <!-- Date -->
            <div class={stylex.attrs(styles.div16).class}>
              <p class={stylex.attrs(styles.p7).class}>Inscrit le</p>
              <p class={stylex.attrs(styles.p8).class}>
                {formatDate(user.createdAt)}
              </p>
            </div>

            <!-- Projets -->
            <div class={stylex.attrs(styles.div17).class}>
              <p class={stylex.attrs(styles.p7).class}>Projets</p>
              {#if user.role === "admin"}
                <p class={stylex.attrs(styles.p9).class}>tous</p>
              {:else}
                <p
                  class={stylex.attrs(styles.p9).class}
                  title={getProjetsNames(getUserProjets(user.id))}
                >
                  {getProjetsCount(user.id)} projet{getProjetsCount(user.id) > 1 ? "s" : ""}
                </p>
              {/if}
            </div>

            <!-- Actions -->
            <div class={stylex.attrs(styles.div18).class}>
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
  <div class={stylex.attrs(ui.toast).class}>
    <div class={stylex.attrs(ui.alert, ui.alertInfo).class}>
      <span class={stylex.attrs(styles.span2).class}>{toast.message}</span>
    </div>
  </div>
{/if}
