<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import { Info, Box, Trash2, Download } from "lucide-svelte";
  import Tabs from "./Tabs.svelte";

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

  const projetId = $derived($page.url.searchParams.get("projetId"));

  const styles = stylex.create({
    Download: {
      height: "1rem",
      width: "1rem",
    },
  });
</script>

<Tabs {tabs} useTabColorWhenActive={true}>
  {#snippet actions()}
    {#if projetId}
      <a
        href="/api/projects/{projetId}/cerfa"
        target="_blank"
        class={stylex.attrs(ui.button).class}
      >
        <Download class={stylex.attrs(styles.Download).class} />
        Télécharger CERFA
      </a>
    {/if}
  {/snippet}
</Tabs>
