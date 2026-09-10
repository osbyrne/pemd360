<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { createEventDispatcher } from "svelte";
  import { authClient } from "$lib/auth-client";
  import { Pencil } from "lucide-svelte";

  type User = {
    id: string;
    email: string;
    name: string;
    role?: string;
  };

  export let user: User;

  const dispatch = createEventDispatcher<{
    updated: { userId: string; name: string; email: string; role: string };
    toast: { message: string; type: "success" | "error" };
  }>();

  let modal: HTMLDialogElement;
  let editForm = {
    name: "",
    email: "",
    role: "user",
  };

  function openModal() {
    editForm.name = user.name || "";
    editForm.email = user.email || "";
    editForm.role = user.role || "user";
    modal?.showModal();
  }

  function closeModal() {
    modal?.close();
  }

  async function saveUserInfo() {
    try {
      const res = await authClient.admin.setRole({
        userId: user.id,
        role: editForm.role as any,
      });
      if (res.error) {
        dispatch("toast", {
          message: "Echec de la mise a jour : " + res.error.message,
          type: "error",
        });
        return;
      }
      dispatch("updated", {
        userId: user.id,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      });
      closeModal();
      dispatch("toast", { message: "Utilisateur mis a jour avec succes", type: "success" });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Echec de la mise a jour";
      dispatch("toast", { message, type: "error" });
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
      backgroundColor: "oklch(93.2% 0.032 255.585)",
    },
    h3: {
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
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
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<button
  on:click={openModal}
  class={stylex.attrs(ui.button, ui.buttonGhost).class}
  title="Modifier les informations"
>
  <Pencil size={18} />
</button>

<dialog bind:this={modal} class={stylex.attrs(ui.dialog).class}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <div class={stylex.attrs(styles.div).class}>
      <div class={stylex.attrs(styles.div2).class}>
        <Pencil />
      </div>
      <div>
        <h3 class={stylex.attrs(styles.h3).class}>Modifier l'utilisateur</h3>
        <p class={stylex.attrs(styles.p).class}>{user.email}</p>
      </div>
    </div>
    <div class={stylex.attrs(styles.div3).class}>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="edit-name-{user.id}" class={stylex.attrs(styles.label).class}>Nom</label>
        <input
          id="edit-name-{user.id}"
          bind:value={editForm.name}
          type="text"
          class={stylex.attrs(ui.input).class}
        />
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="edit-email-{user.id}" class={stylex.attrs(styles.label).class}>Email</label>
        <input
          id="edit-email-{user.id}"
          bind:value={editForm.email}
          type="email"
          class={stylex.attrs(ui.input).class}
        />
      </div>
      <div class={stylex.attrs(styles.stackSpacing1).class}>
        <label for="edit-role-{user.id}" class={stylex.attrs(styles.label).class}>Role</label>
        <select
          id="edit-role-{user.id}"
          bind:value={editForm.role}
          class={stylex.attrs(ui.select).class}
        >
          <option value="user">Utilisateur</option>
          <option value="collaborator">Collaborateur</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button type="button" class={stylex.attrs(ui.button).class} on:click={closeModal}
        >Annuler</button
      >
      <button type="button" class={stylex.attrs(ui.button).class} on:click={saveUserInfo}
        >Enregistrer</button
      >
    </div>
  </div>
</dialog>
