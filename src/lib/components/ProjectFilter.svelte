<script lang="ts">
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
</script>

<div class="w-full sm:w-64">
  <select class="select" value={selectedProjectId || ""} onchange={handleProjectChange}>
    <option value="">Tous les projets</option>
    {#each projects as project}
      <option value={project.id}>{project.libelle}</option>
    {/each}
  </select>
</div>
