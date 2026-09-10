<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import { Home, AlertTriangle } from "lucide-svelte";

  // SvelteKit automatically passes 'status' and 'message' in the 'page' store for error pages
  // or as props if using $props within the error boundary, but globally page store is reliable.

  const styles = stylex.create({
    div: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
      justifyContent: "center",
      paddingTop: "3rem",
      paddingBottom: "3rem",
      paddingInlineStart: {
        "@media (min-width: 640px)": "1.5rem",
        "@media (min-width: 1024px)": "2rem",
      },
      paddingInlineEnd: {
        "@media (min-width: 640px)": "1.5rem",
        "@media (min-width: 1024px)": "2rem",
      },
    },
    div2: {
      textAlign: "center",
      marginInlineStart: {
        "@media (min-width: 640px)": "auto",
      },
      marginInlineEnd: {
        "@media (min-width: 640px)": "auto",
      },
      width: {
        "@media (min-width: 640px)": "100%",
      },
      maxWidth: {
        "@media (min-width: 640px)": "28rem",
      },
    },
    div3: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      marginBottom: "1.5rem",
      display: "flex",
      height: "6rem",
      width: "6rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(93.6% 0.032 17.717)",
    },
    AlertTriangle: {
      height: "3rem",
      width: "3rem",
      color: "oklch(57.7% 0.245 27.325)",
    },
    h1: {
      marginBottom: "0.5rem",
      fontSize: {
        default: "2.25rem",
        "@media (min-width: 640px)": "3rem",
      },
      lineHeight: {
        default: "2.5rem",
        "@media (min-width: 640px)": 1,
      },
      fontWeight: 800,
      letterSpacing: "-.025em",
    },
    h2: {
      marginBottom: "2rem",
      fontSize: "1.25rem",
      lineHeight: "1.75rem",
      fontWeight: 500,
    },
    div4: {
      display: "flex",
      justifyContent: "center",
      gap: "1rem",
    },
    Home: {
      height: "1rem",
      width: "1rem",
    },
    div5: {
      marginTop: "2rem",
      marginInlineStart: {
        "@media (min-width: 640px)": "auto",
      },
      marginInlineEnd: {
        "@media (min-width: 640px)": "auto",
      },
      width: {
        "@media (min-width: 640px)": "100%",
      },
      maxWidth: {
        "@media (min-width: 640px)": "28rem",
      },
    },
    div6: {
      paddingInlineStart: {
        default: "1rem",
        "@media (min-width: 640px)": "2.5rem",
      },
      paddingInlineEnd: {
        default: "1rem",
        "@media (min-width: 640px)": "2.5rem",
      },
      paddingTop: "2rem",
      paddingBottom: "2rem",
      textAlign: "center",
      boxShadow: "0 1px 3px #0000001a, 0 1px 2px #0000001a",
      borderRadius: {
        "@media (min-width: 640px)": ".5rem",
      },
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
  });
</script>

<svelte:head>
  <title>{$page.status} - Erreur</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <div class={stylex.attrs(styles.div3).class}>
      <AlertTriangle class={stylex.attrs(styles.AlertTriangle).class} />
    </div>

    <h1 class={stylex.attrs(styles.h1).class}>
      {$page.status}
    </h1>

    <h2 class={stylex.attrs(styles.h2).class}>
      {$page.error?.message || "Une erreur inattendue s'est produite."}
    </h2>

    <div class={stylex.attrs(styles.div4).class}>
      <a href="/" class={stylex.attrs(ui.button).class}>
        <Home class={stylex.attrs(styles.Home).class} />
        Retour à l'accueil
      </a>
      <button
        onclick={() => history.back()}
        class={stylex.attrs(ui.button, ui.buttonOutline).class}
      >
        Page précédente
      </button>
    </div>
  </div>

  <div class={stylex.attrs(styles.div5).class}>
    <div class={stylex.attrs(styles.div6).class}>
      <p class={stylex.attrs(styles.p).class}>
        Si le problème persiste, veuillez contacter le support.
      </p>
    </div>
  </div>
</div>
