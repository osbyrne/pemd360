<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Info, Box, Trash2, Download } from "lucide-svelte";
  import Tabs from "./Tabs.svelte";

  let {
    projects,
    projectId,
  }: {
    projects: readonly { id: string; libelle: string | null }[];
    projectId: string | null;
  } = $props();

  function selectProject(event: Event) {
    const id = (event.currentTarget as HTMLSelectElement).value;
    if (!id) return;
    const target = new URL($page.url);
    target.searchParams.set("projetId", id);
    void goto(target.pathname + target.search);
  }

  const tabs = [
    {
      href: "/app/cerfa/informations",
      label: "Partie informations",
      icon: Info,
      color: ui.textBlue600,
    },
    { href: "/app/cerfa/pem", label: "Caractérisation PEM", icon: Box, color: ui.textAmber600 },
    {
      href: "/app/cerfa/dechets",
      label: "Caractérisation Déchets",
      icon: Trash2,
      color: undefined,
    },
  ];

  const styles = stylex.create({
    Download: {
      height: "1rem",
      width: "1rem",
    },
  });
</script>

<Tabs {tabs} useTabColorWhenActive={true}>
  {#snippet actions()}
    {#if projects.length > 0}
      <select
        aria-label="Projet"
        value={projectId ?? ""}
        onchange={selectProject}
        class={stylex.attrs(ui.select).class}
      >
        {#each projects as project}
          <option value={project.id}>{project.libelle || "Projet sans nom"}</option>
        {/each}
      </select>
    {/if}
    {#if projectId}
      <a
        href="/api/projects/{projectId}/cerfa"
        target="_blank"
        class={stylex.attrs(ui.button).class}
      >
        <Download class={stylex.attrs(styles.Download).class} />
        Télécharger CERFA
      </a>
    {/if}
  {/snippet}
</Tabs>
