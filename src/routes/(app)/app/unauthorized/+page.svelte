<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { goto } from "$app/navigation";
  import { ShieldAlert } from "lucide-svelte";

  function goBack() {
    goto("/app/projets");
  }

  const styles = stylex.create({
    div: {
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
    },
    div2: {
      width: "100%",
      maxWidth: "28rem",
      textAlign: "center",
    },
    div3: {
      marginBottom: "1.5rem",
      display: "flex",
      justifyContent: "center",
    },
    div4: {
      borderRadius: "9999px",
      backgroundColor: "oklch(93.6% 0.032 17.717)",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
    },
    ShieldAlert: {
      height: "4rem",
      width: "4rem",
      color: "oklch(57.7% 0.245 27.325)",
    },
    h1: {
      marginBottom: "1rem",
      fontSize: "2.25rem",
      lineHeight: "2.5rem",
      fontWeight: 700,
    },
    p: {
      marginBottom: "2rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
    },
    button: {
      borderRadius: ".5rem",
      backgroundColor: {
        default: "oklch(59.6% 0.145 163.225)",
        ":hover": "oklch(50.8% 0.118 165.612)",
      },
      paddingInlineStart: "2rem",
      paddingInlineEnd: "2rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      fontWeight: 500,
      color: "#fff",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: {
        ":focus":
          "0 0 0 var(--focus-offset, 0px) var(--focus-offset-color, #fff), 0 0 0 calc(4px + var(--focus-offset, 0px)) var(--focus-color, currentColor)",
      },
      "--focus-color": {
        ":focus": "oklch(84.5% 0.143 164.978)",
      },
      outlineStyle: {
        ":focus": "none",
      },
    },
  });
</script>

<svelte:head>
  <title>Accès Non Autorisé - PEMD360</title>
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <div class={stylex.attrs(styles.div3).class}>
      <div class={stylex.attrs(styles.div4).class}>
        <ShieldAlert class={stylex.attrs(styles.ShieldAlert).class} />
      </div>
    </div>

    <h1 class={stylex.attrs(styles.h1).class}>Accès Non Autorisé</h1>

    <p class={stylex.attrs(styles.p).class}>
      Vous n'avez pas les permissions nécessaires pour accéder à cette page. Cette section est
      réservée aux administrateurs.
    </p>

    <button on:click={goBack} class={stylex.attrs(styles.button).class}> Retour </button>
  </div>
</div>
