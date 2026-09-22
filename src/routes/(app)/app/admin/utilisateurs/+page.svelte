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
  $: usersWithProjets = (data.usersWithProjets || []) as {
    userId: string;
    projetId: string;
  }[];

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
    event: CustomEvent<{
      userId: string;
      name: string;
      email: string;
      role: string;
    }>,
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
  const styles = stylex.create({
    main: {
      width: "100%",
      maxWidth: "80rem",
      marginInline: "auto",
    },
    header: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 640px)": "row",
      },
      alignItems: {
        default: "flex-start",
        "@media (min-width: 640px)": "center",
      },
      justifyContent: "space-between",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    title: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
      letterSpacing: "-.025em",
    },
    description: {
      marginTop: ".375rem",
      fontSize: ".875rem",
      color: `color-mix(in oklab, ${theme.baseContent} 65%, transparent)`,
    },
    search: {
      position: "relative",
      width: "100%",
      maxWidth: "26rem",
      marginBottom: "1.5rem",
    },
    searchIcon: {
      position: "absolute",
      insetInlineStart: ".875rem",
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: `color-mix(in oklab, ${theme.baseContent} 55%, transparent)`,
    },
    searchInput: {
      width: "100%",
      paddingInlineStart: "2.75rem",
    },
    error: {
      display: "flex",
      alignItems: "flex-start",
      gap: ".75rem",
      marginBottom: "1.5rem",
      padding: "1rem",
      borderRadius: ".75rem",
      backgroundColor: theme.error,
      color: theme.errorContent,
    },
    errorTitle: { fontWeight: 600 },
    errorMessage: { marginTop: ".25rem", fontSize: ".875rem" },
    tableCard: {
      overflow: "hidden",
      borderRadius: ".75rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: `color-mix(in oklab, ${theme.baseContent} 12%, transparent)`,
      backgroundColor: theme.base100,
      boxShadow: "0 1px 3px #0000001a",
    },
    tableScroll: { overflowX: "auto" },
    table: {
      width: "100%",
      minWidth: "58rem",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      textAlign: "left",
      fontSize: ".875rem",
    },
    heading: {
      padding: ".875rem 1rem",
      backgroundColor: theme.base200,
      color: `color-mix(in oklab, ${theme.baseContent} 65%, transparent)`,
      fontSize: ".75rem",
      fontWeight: 600,
      letterSpacing: ".04em",
    },
    userColumn: { width: "26%" },
    roleColumn: { width: "15%" },
    projectsColumn: { width: "15%" },
    dateColumn: { width: "17%" },
    actionsColumn: { width: "27%", textAlign: "right" },
    row: {
      backgroundColor: {
        default: "transparent",
        ":hover": theme.base200,
      },
    },
    cell: {
      padding: ".875rem 1rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderTopColor: `color-mix(in oklab, ${theme.baseContent} 9%, transparent)`,
      verticalAlign: "middle",
    },
    userName: { fontWeight: 600 },
    userEmail: {
      marginTop: ".25rem",
      color: `color-mix(in oklab, ${theme.baseContent} 65%, transparent)`,
      fontSize: ".8125rem",
      overflowWrap: "anywhere",
    },
    roleBadge: {
      display: "inline-flex",
      maxWidth: "100%",
      padding: ".25rem .625rem",
      borderRadius: "9999px",
      backgroundColor: theme.base200,
      fontSize: ".75rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
    },
    projectValue: { fontWeight: 500 },
    dateValue: { whiteSpace: "nowrap" },
    actions: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: ".125rem",
    },
    statusCell: {
      padding: "3rem 1rem",
      textAlign: "center",
      color: `color-mix(in oklab, ${theme.baseContent} 65%, transparent)`,
    },
    statusIcon: { marginInline: "auto", marginBottom: ".75rem" },
    statusTitle: { color: theme.baseContent, fontWeight: 600 },
    statusDescription: { marginTop: ".25rem", fontSize: ".875rem" },
    pagination: {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderTopColor: `color-mix(in oklab, ${theme.baseContent} 9%, transparent)`,
    },
  });
</script>

<svelte:head>
  <title>Admin · Utilisateurs</title>
</svelte:head>

<main class={stylex.attrs(styles.main).class}>
  <header class={stylex.attrs(styles.header).class}>
    <div>
      <h1 class={stylex.attrs(styles.title).class}>Gestion des utilisateurs</h1>
      <p class={stylex.attrs(styles.description).class}>
        Gérez les utilisateurs, leurs rôles et leurs accès.
      </p>
    </div>
    <CreateUserModal
      {projets}
      on:created={loadUsers}
      on:toast={(e) => showToast(e.detail.message, e.detail.type)}
    />
  </header>

  <div class={stylex.attrs(styles.search).class}>
    <Search size={18} class={stylex.attrs(styles.searchIcon).class} aria-hidden="true" />
    <input
      type="search"
      bind:value={query}
      on:input={() => (page = 1)}
      aria-label="Rechercher par nom ou email"
      placeholder="Rechercher par nom ou email..."
      class={stylex.attrs(ui.input, styles.searchInput).class}
    />
  </div>

  {#if error}
    <div class={stylex.attrs(styles.error).class} role="alert">
      <Bug size={24} />
      <div>
        <h2 class={stylex.attrs(styles.errorTitle).class}>Erreur de chargement</h2>
        <p class={stylex.attrs(styles.errorMessage).class}>{error}</p>
      </div>
    </div>
  {/if}

  <div class={stylex.attrs(styles.tableCard).class}>
    <div class={stylex.attrs(styles.tableScroll).class}>
      <table class={stylex.attrs(styles.table).class} aria-label="Utilisateurs" aria-busy={loading}>
        <thead>
          <tr>
            <th scope="col" class={stylex.attrs(styles.heading, styles.userColumn).class}
              >Utilisateur</th
            >
            <th scope="col" class={stylex.attrs(styles.heading, styles.roleColumn).class}>Rôle</th>
            <th scope="col" class={stylex.attrs(styles.heading, styles.projectsColumn).class}
              >Projets</th
            >
            <th scope="col" class={stylex.attrs(styles.heading, styles.dateColumn).class}
              >Inscription</th
            >
            <th scope="col" class={stylex.attrs(styles.heading, styles.actionsColumn).class}
              >Actions</th
            >
          </tr>
        </thead>
        <tbody>
          {#if loading}
            <tr>
              <td colspan="5" class={stylex.attrs(styles.cell, styles.statusCell).class}>
                Chargement des utilisateurs…
              </td>
            </tr>
          {:else if displayedUsers.length === 0}
            <tr>
              <td colspan="5" class={stylex.attrs(styles.cell, styles.statusCell).class}>
                <Users size={28} class={stylex.attrs(styles.statusIcon).class} aria-hidden="true" />
                <p class={stylex.attrs(styles.statusTitle).class}>Aucun utilisateur trouvé</p>
                <p class={stylex.attrs(styles.statusDescription).class}>
                  Essayez de modifier vos critères de recherche
                </p>
              </td>
            </tr>
          {:else}
            {#each displayedUsers as user (user.id)}
              <tr class={stylex.attrs(styles.row).class}>
                <th scope="row" class={stylex.attrs(styles.cell).class}>
                  <div class={stylex.attrs(styles.userName).class}>
                    {user.name}
                  </div>
                  <div class={stylex.attrs(styles.userEmail).class}>
                    {user.email}
                  </div>
                </th>
                <td class={stylex.attrs(styles.cell).class}>
                  <span class={stylex.attrs(styles.roleBadge).class}>
                    {#if user.role === "admin"}
                      Administrateur
                    {:else if user.role === "collaborator"}
                      Collaborateur
                    {:else}
                      Utilisateur
                    {/if}
                  </span>
                </td>
                <td class={stylex.attrs(styles.cell).class}>
                  {#if user.role === "admin"}
                    <span class={stylex.attrs(styles.projectValue).class}>Tous</span>
                  {:else}
                    <span
                      class={stylex.attrs(styles.projectValue).class}
                      title={getProjetsNames(getUserProjets(user.id))}
                    >
                      {getProjetsCount(user.id)} projet{getProjetsCount(user.id) > 1 ? "s" : ""}
                    </span>
                  {/if}
                </td>
                <td class={stylex.attrs(styles.cell, styles.dateValue).class}>
                  {formatDate(user.createdAt)}
                </td>
                <td class={stylex.attrs(styles.cell).class}>
                  <div class={stylex.attrs(styles.actions).class}>
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
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
    {#if !loading && totalPages > 1}
      <div class={stylex.attrs(styles.pagination).class}>
        <Pagination
          {page}
          {totalPages}
          totalItems={filteredUsers.length}
          {perPage}
          onPageChange={(p) => (page = p)}
        />
      </div>
    {/if}
  </div>
</main>
{#if toast}
  <div class={stylex.attrs(ui.toast).class}>
    <div class={stylex.attrs(ui.alert, ui.alertInfo).class}>
      <span>{toast.message}</span>
    </div>
  </div>
{/if}
