<script lang="ts">
  import { page } from "$app/stores";
  import { Info, Box, Trash2, Download } from "lucide-svelte";
  import Tabs from "./Tabs.svelte";

  const tabs = [
    {
      href: "/app/cerfa/informations",
      label: "Partie informations",
      icon: Info,
      color: "text-blue-600",
    },
    { href: "/app/cerfa/pem", label: "Caractérisation PEM", icon: Box, color: "text-amber-600" },
    {
      href: "/app/cerfa/dechets",
      label: "Caractérisation Déchets",
      icon: Trash2,
      color: "",
    },
  ];

  const projetId = $derived($page.url.searchParams.get("projetId"));
</script>

<Tabs {tabs} useTabColorWhenActive={true}>
  {#snippet actions()}
    {#if projetId}
      <a href="/api/projects/{projetId}/cerfa" target="_blank" class="btn">
        <Download class="h-4 w-4" />
        Télécharger CERFA
      </a>
    {/if}
  {/snippet}
</Tabs>
