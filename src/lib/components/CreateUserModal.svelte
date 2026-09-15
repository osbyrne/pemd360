<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { onDestroy } from "svelte";
  import {
    createOperation,
    isOperationSuccess,
    operationErrorMessage,
  } from "$lib/client/effect/operation.svelte";
  import { submitUserProjects } from "$lib/client/services/sveltekit";
  import type { ClientRole } from "$lib/client/services/authentication";
  import { createUserWithAssignments } from "$lib/client/workflows/auth";
  import { UserPlus, UserPen, Search } from "lucide-svelte";

  type Projet = {
    id: string;
    libelle: string;
    reference: string;
  };

  export let projets: Projet[] = [];

  const dispatch = createEventDispatcher<{
    created: void;
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;

  let form = {
    email: "",
    password: "",
    name: "",
    role: "user" as ClientRole,
    projetIds: [] as string[],
  };

  let projectSearch = "";
  const createOperationState = createOperation<
    {
      readonly userId: string;
      readonly assignment: "not-requested" | "succeeded" | "partial";
      readonly assignmentError?: unknown;
    },
    unknown
  >();
  const assignmentOperation = createOperation<void, unknown>();
  let createdUserId: string | null = null;
  let assignmentProjectIds: string[] = [];
  let isCreating = false;
  let isAssigning = false;

  $: filteredProjets = projets.filter((p) => {
    if (!projectSearch) return true;
    const search = projectSearch.toLowerCase();
    return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
  });

  function open() {
    form = { email: "", password: "", name: "", role: "user", projetIds: [] };
    projectSearch = "";
    createdUserId = null;
    assignmentProjectIds = [];
    modal?.showModal();
  }

  function close() {
    modal?.close();
  }

  async function createUser() {
    if (isCreating || isAssigning) return;
    isCreating = true;
    const projectIds = [...form.projetIds];
    const result = await createOperationState.execute(
      createUserWithAssignments({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        projectIds,
        assignProjects: submitUserProjects,
      }),
    );
    isCreating = false;

    if (!isOperationSuccess(result)) {
      dispatch("toast", { message: "Échec de la création de l'utilisateur", type: "error" });
      return;
    }

    if (result.value.assignment === "partial") {
      createdUserId = result.value.userId;
      assignmentProjectIds = projectIds;
      dispatch("toast", {
        message:
          "Utilisateur créé, mais l'affectation des projets a échoué. Réessayez l'affectation.",
        type: "error",
      });
      return;
    }

    await finishCreation();
  }

  async function retryAssignment() {
    if (!createdUserId || isAssigning || isCreating) return;
    isAssigning = true;
    const userId = createdUserId;
    const result = await assignmentOperation.execute(
      submitUserProjects(userId, assignmentProjectIds),
    );
    isAssigning = false;
    if (!isOperationSuccess(result)) {
      dispatch("toast", {
        message: operationErrorMessage(result, "Échec de l'affectation des projets"),
        type: "error",
      });
      return;
    }
    await finishCreation();
  }

  async function finishCreation() {
    close();
    dispatch("created");
    try {
      await invalidateAll();
      dispatch("toast", { message: "Utilisateur créé avec succès", type: "success" });
    } catch (cause) {
      console.error("User creation succeeded but refreshing the user list failed", cause);
      dispatch("toast", {
        message: "Utilisateur créé, mais la liste n'a pas pu être actualisée",
        type: "error",
      });
    }
  }

  onDestroy(() => {
    createOperationState.dispose();
    assignmentOperation.dispose();
  });

  const styles = stylex.create({
    div: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    div2: {
      display: "flex",
      height: "2.5rem",
      width: "2.5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(95% 0.052 163.051)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div3: {
      "--stack-gap": "1rem",
    },
    label: {
      marginBottom: "0.375rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    label2: {
      position: "relative",
      marginBottom: "0.5rem",
    },
    div4: {
      maxHeight: "10rem",
      overflowY: "auto",
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "oklch(86.9% 0.022 252.894)",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
    },
    p: {
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    label3: {
      display: "flex",
      cursor: "pointer",
      alignItems: "center",
      gap: "0.5rem",
      borderRadius: ".25rem",
      paddingInlineStart: "0.5rem",
      paddingInlineEnd: "0.5rem",
      paddingTop: "0.375rem",
      paddingBottom: "0.375rem",
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    p2: {
      marginTop: "0.25rem",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<button on:click={open} class={stylex.attrs(ui.button).class}>
  <UserPen size={24} />
  Nouvel utilisateur
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <div class={stylex.attrs(styles.div).class}>
      <div class={stylex.attrs(styles.div2).class}>
        <UserPlus />
      </div>
      <h3 class={stylex.attrs(styles.h3).class}>Créer un utilisateur</h3>
    </div>
    <div class={stylex.attrs(styles.div3).class}>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="create-name" class={stylex.attrs(styles.label).class}>Nom</label>
        <input
          id="create-name"
          bind:value={form.name}
          type="text"
          placeholder="Jean Dupont"
          class={stylex.attrs(ui.input).class}
        />
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="create-email" class={stylex.attrs(styles.label).class}>Email</label>
        <input
          id="create-email"
          bind:value={form.email}
          type="email"
          placeholder="jean.dupont@exemple.com"
          class={stylex.attrs(ui.input).class}
        />
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="create-password" class={stylex.attrs(styles.label).class}>Mot de passe</label>
        <input
          id="create-password"
          bind:value={form.password}
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          class={stylex.attrs(ui.input).class}
        />
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="create-role" class={stylex.attrs(styles.label).class}>Rôle</label>
        <select id="create-role" bind:value={form.role} class={stylex.attrs(ui.select).class}>
          <option value="user">Utilisateur</option>
          <option value="collaborator">Collaborateur</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="create-projets" class={stylex.attrs(styles.label).class}>Projets</label>
        <label class={stylex.attrs(styles.label2).class}>
          <Search />
          <input type="search" bind:value={projectSearch} placeholder="Rechercher un projet..." />
        </label>
        <div class={stylex.attrs(styles.div4).class}>
          {#if projets.length === 0}
            <p class={stylex.attrs(styles.p).class}>Aucun projet disponible</p>
          {:else if filteredProjets.length === 0}
            <p class={stylex.attrs(styles.p).class}>Aucun projet trouvé</p>
          {:else}
            {#each filteredProjets as p (p.id)}
              <label class={stylex.attrs(styles.label3).class}>
                <input
                  type="checkbox"
                  value={p.id}
                  checked={form.projetIds.includes(p.id)}
                  on:change={(e) => {
                    if (e.currentTarget.checked) {
                      form.projetIds = [...form.projetIds, p.id];
                    } else {
                      form.projetIds = form.projetIds.filter((id) => id !== p.id);
                    }
                  }}
                  class={stylex.attrs(ui.checkbox).class}
                />
                <span class={stylex.attrs(styles.span).class}
                  >{p.libelle} <span>({p.reference})</span></span
                >
              </label>
            {/each}
          {/if}
        </div>
        {#if form.projetIds.length > 0}
          <p class={stylex.attrs(styles.p2).class}>
            {form.projetIds.length} projet(s) sélectionné(s)
          </p>
        {/if}
        {#if createdUserId}
          <p class={stylex.attrs(styles.p2).class}>
            Utilisateur créé. Les projets n'ont pas encore été affectés.
          </p>
        {/if}
      </div>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={close}>Annuler</button>
      {#if createdUserId}
        <button type="button" class={stylex.attrs(ui.button).class} on:click={retryAssignment}>
          {isAssigning ? "Affectation..." : "Réessayer l'affectation"}
        </button>
      {:else}
        <button
          type="button"
          class={stylex.attrs(ui.button).class}
          disabled={isCreating}
          on:click={createUser}>{isCreating ? "Création..." : "Créer"}</button
        >
      {/if}
    </div>
  </div>
</dialog>
