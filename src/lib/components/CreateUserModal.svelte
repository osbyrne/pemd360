<script lang="ts">
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
</script>

<button on:click={open} class="btn">
  <UserPen size={24} />
  Nouvel utilisateur
</button>

<dialog bind:this={modal} class="modal">
  <div class="modal-box">
    <div class="mb-6 flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
        <UserPlus />
      </div>
      <h3 class="text-lg font-semibold">Créer un utilisateur</h3>
    </div>
    <div class="space-y-4">
      <div>
        <label for="create-name" class="mb-1.5 block text-sm font-medium">Nom</label>
        <input
          id="create-name"
          bind:value={form.name}
          type="text"
          placeholder="Jean Dupont"
          class="input"
        />
      </div>
      <div>
        <label for="create-email" class="mb-1.5 block text-sm font-medium">Email</label>
        <input
          id="create-email"
          bind:value={form.email}
          type="email"
          placeholder="jean.dupont@exemple.com"
          class="input"
        />
      </div>
      <div>
        <label for="create-password" class="mb-1.5 block text-sm font-medium">Mot de passe</label>
        <input
          id="create-password"
          bind:value={form.password}
          type="password"
          autocomplete="new-password"
          placeholder="••••••••"
          class="input"
        />
      </div>
      <div>
        <label for="create-role" class="mb-1.5 block text-sm font-medium">Rôle</label>
        <select id="create-role" bind:value={form.role} class="select">
          <option value="user">Utilisateur</option>
          <option value="collaborator">Collaborateur</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>
      <div>
        <label for="create-projets" class="mb-1.5 block text-sm font-medium">Projets</label>
        <label class="relative mb-2">
          <Search />
          <input type="search" bind:value={projectSearch} placeholder="Rechercher un projet..." />
        </label>
        <div class="max-h-40 overflow-y-auto rounded-lg border border-slate-300 p-2">
          {#if projets.length === 0}
            <p class="px-2 py-2 text-sm">Aucun projet disponible</p>
          {:else if filteredProjets.length === 0}
            <p class="px-2 py-2 text-sm">Aucun projet trouvé</p>
          {:else}
            {#each filteredProjets as p (p.id)}
              <label class="hover: flex cursor-pointer items-center gap-2 rounded px-2 py-1.5">
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
                  class="checkbox"
                />
                <span class="text-sm">{p.libelle} <span>({p.reference})</span></span>
              </label>
            {/each}
          {/if}
        </div>
        {#if form.projetIds.length > 0}
          <p class="mt-1 text-xs">
            {form.projetIds.length} projet(s) sélectionné(s)
          </p>
        {/if}
      </div>
    </div>
    <div class="modal-action">
      <button type="button" class="btn" on:click={close}>Annuler</button>
      <button type="button" class="btn" on:click={createUser}>Créer</button>
    </div>
  </div>
</dialog>
