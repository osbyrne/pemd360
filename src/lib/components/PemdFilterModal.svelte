<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  interface Props {
    show: boolean;
    groups: { id: number | null; name: string | null }[];
    categoriesV2: App.CategoriesV2[];
    allPemdObjects: { id: number | null; name: string | null; categorieId: number | null }[];
    hasTags: boolean;
    onApply: (allowedIds: number[]) => void;
    onRemove: () => void;
  }

  let {
    show = $bindable(),
    groups,
    categoriesV2,
    allPemdObjects,
    hasTags,
    onApply,
    onRemove,
  }: Props = $props();

  let dialog: HTMLDialogElement;

  let selectedGroup = $state("");
  let selectedCategory = $state("");
  let selectedObject = $state("");
  let categoriesFiltered: App.CategoriesV2[] = $state([]);
  let objectsFiltered = $state(
    [] as { id: number | null; name: string | null; categorieId: number | null }[],
  );

  $effect(() => {
    if (!dialog) return;
    if (show) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  });

  function handleGroupChange() {
    if (selectedGroup && selectedGroup.trim() !== "") {
      const group = groups.find((g) => g.name === selectedGroup || String(g.id) === selectedGroup);
      if (group) {
        categoriesFiltered = categoriesV2.filter((c) => c.groupeId === group.id);
      } else {
        categoriesFiltered = [];
      }
      selectedCategory = "";
      selectedObject = "";
    } else {
      categoriesFiltered = categoriesV2;
      objectsFiltered = allPemdObjects;
      selectedCategory = "";
      selectedObject = "";
    }
  }

  function handleCategoryChange() {
    if (selectedCategory && selectedCategory.trim() !== "") {
      const cat = categoriesV2.find(
        (c) => c.name === selectedCategory || String(c.id) === selectedCategory,
      );
      if (cat) {
        objectsFiltered = allPemdObjects.filter((o) => o.categorieId === cat.id);
      } else {
        objectsFiltered = [];
      }
      selectedObject = "";
    } else {
      objectsFiltered = allPemdObjects;
      selectedObject = "";
    }
  }

  function getAllowedObjetIds(): number[] {
    const allowed = new Set<number>();

    if (selectedObject.trim() !== "") {
      for (const o of allPemdObjects) {
        if (o.name === selectedObject && o.id != null) allowed.add(o.id);
      }
      return Array.from(allowed);
    }

    if (selectedCategory.trim() !== "") {
      const cat = categoriesV2.find(
        (c) => c.id === Number(selectedCategory) || c.name === selectedCategory,
      );
      if (cat) {
        for (const o of allPemdObjects) {
          if (o.categorieId === cat.id && o.id != null) allowed.add(o.id);
        }
      }
      return Array.from(allowed);
    }

    if (selectedGroup.trim() !== "") {
      const group = groups.find((g) => g.name === selectedGroup || String(g.id) === selectedGroup);
      if (group) {
        const allowedCatIds = categoriesV2.filter((c) => c.groupeId === group.id).map((c) => c.id);
        for (const o of allPemdObjects) {
          if (o.categorieId != null && allowedCatIds.includes(o.categorieId) && o.id != null) {
            allowed.add(o.id);
          }
        }
      }
      return Array.from(allowed);
    }

    // No filter — return all object IDs
    for (const o of allPemdObjects) {
      if (o.id != null) allowed.add(o.id);
    }
    return Array.from(allowed);
  }

  const styles = stylex.create({
    h3: {
      marginBottom: "0.75rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    div: {
      marginBottom: "0.75rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      display: "flex",
      flexDirection: "column",
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
  });
</script>

<dialog bind:this={dialog} class={stylex.attrs(ui.dialog).class} onclose={() => (show = false)}>
  <div class={stylex.attrs(ui.dialogPanel).class}>
    <h3 class={stylex.attrs(styles.h3).class}>Filtrer PEMD</h3>
    <div class={stylex.attrs(styles.div).class}>
      <label class={stylex.attrs(styles.label).class}>
        <span class={stylex.attrs(styles.span).class}>Groupe</span>
        <select
          bind:value={selectedGroup}
          onchange={handleGroupChange}
          class={stylex.attrs(ui.select).class}
        >
          <option value="">Tous groupes</option>
          {#each groups as group (group.id)}
            <option value={group.name}>{group.name}</option>
          {/each}
        </select>
      </label>
      <label class={stylex.attrs(styles.label).class}>
        <span class={stylex.attrs(styles.span).class}>Catégorie</span>
        <select
          bind:value={selectedCategory}
          onchange={handleCategoryChange}
          class={stylex.attrs(ui.select).class}
        >
          <option value="">Toutes catégories</option>
          {#each categoriesFiltered as category (category.id)}
            <option value={category.name}>{category.name}</option>
          {/each}
        </select>
      </label>
      <label class={stylex.attrs(styles.label).class}>
        <span class={stylex.attrs(styles.span).class}>Objet</span>
        <select bind:value={selectedObject} class={stylex.attrs(ui.select).class}>
          <option value="">Tous objets</option>
          {#each objectsFiltered as object (object.id)}
            <option value={object.name}>{object.name}</option>
          {/each}
        </select>
      </label>
    </div>
    <div class={stylex.attrs(ui.dialogActions).class}>
      <button class={stylex.attrs(ui.button).class} onclick={() => (show = false)}>Fermer</button>
      <button
        class={stylex.attrs(ui.button, ui.buttonWarning).class}
        onclick={onRemove}
        disabled={!hasTags}
      >
        Supprimer les tags PEMD
      </button>
      <button class={stylex.attrs(ui.button).class} onclick={() => onApply(getAllowedObjetIds())}>
        Ajouter dans le modèle
      </button>
    </div>
  </div>
  <form method="dialog" class={stylex.attrs(ui.dialogBackdrop).class}>
    <button onclick={() => (show = false)}>close</button>
  </form>
</dialog>
