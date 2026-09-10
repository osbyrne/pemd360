<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { goto } from "$app/navigation";
  import { page as pageStore } from "$app/stores";

  interface Project {
    id: string;
    libelle: string;
  }

  interface Props {
    projects: Project[];
    selectedProjectId: string | null;
  }

  let { projects, selectedProjectId }: Props = $props();

  function handleProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    const url = new URL($pageStore.url);
    if (value) {
      url.searchParams.set("projectId", value);
    } else {
      url.searchParams.delete("projectId");
    }
    url.searchParams.delete("page");
    goto(url, { keepFocus: true, noScroll: true });
  }

  const styles = stylex.create({
    div: {
      width: {
        default: "100%",
        "@media (min-width: 640px)": "16rem",
      },
    },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <select
    class={stylex.attrs(ui.select).class}
    value={selectedProjectId || ""}
    onchange={handleProjectChange}
  >
    <option value="">Tous les projets</option>
    {#each projects as project}
      <option value={project.id}>{project.libelle}</option>
    {/each}
  </select>
</div>
