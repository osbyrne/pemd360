<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { authClient } from "$lib/auth-client";
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
    role: "user",
    projetIds: [] as string[],
  };

  let projectSearch = "";

  $: filteredProjets = projets.filter((p) => {
    if (!projectSearch) return true;
    const search = projectSearch.toLowerCase();
    return p.libelle.toLowerCase().includes(search) || p.reference.toLowerCase().includes(search);
  });

  function open() {
    form = { email: "", password: "", name: "", role: "user", projetIds: [] };
    projectSearch = "";
    modal?.showModal();
  }

  function close() {
    modal?.close();
  }

  async function createUser() {
    try {
      const res = await authClient.admin.createUser({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role as any,
      });

      if (res.data) {
        const newUserId = res.data.user.id;

        if (form.projetIds.length > 0) {
          const formData = new FormData();
          formData.append("userId", newUserId);
          form.projetIds.forEach((id) => formData.append("projetIds", id));

          await fetch("?/setProjets", {
            method: "POST",
            body: formData,
          });
        }

        await invalidateAll();
        close();
        dispatch("created");
        dispatch("toast", { message: "Utilisateur créé avec succès", type: "success" });
      } else if (res.error) {
        dispatch("toast", {
          message: "Échec de la création : " + res.error.message,
          type: "error",
        });
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(e.message || "Échec de la création");
      } else {
        console.log(String(e));
      }
      dispatch("toast", { message: "Échec de la création de l'utilisateur", type: "error" });
    }
  }

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
      </div>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={close}>Annuler</button>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={createUser}
        >Créer</button
      >
    </div>
  </div>
</dialog>
