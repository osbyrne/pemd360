<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import "./layout.css";
  if (import.meta.env.DEV) {
    $effect(() => {
      void import("virtual:stylex:runtime");
    });
  }
  import { authClient } from "$lib/auth-client";
  import { pwaInfo } from "virtual:pwa-info";
  import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";
  injectSpeedInsights();

  let { children } = $props();
  let mobileMenuOpen = $state(false);

  // Vérifier si l'utilisateur est connecté
  const session = authClient.useSession();

  const styles = stylex.create({
    div: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
    },
    main: {
      flex: "1 1 0%",
    },
  });
</script>

<svelte:head>
  {#if import.meta.env.DEV}
    <link rel="stylesheet" href="/virtual:stylex.css" />
  {/if}
  <link rel="icon" href="/favicon.png" />
  <title>PEMD360</title>
  {@html pwaInfo!.webManifest.linkTag}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <!-- Main Content -->
  <main class={stylex.attrs(styles.main).class}>
    {@render children()}
  </main>
</div>
