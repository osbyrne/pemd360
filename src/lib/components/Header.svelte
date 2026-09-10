<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import logoDC from "$lib/assets/depollution_conseil.png";
  import logoPEMD from "$lib/assets/pemd360.png";
  import { Menu, X } from "lucide-svelte";

  let { user = null } = $props<{ user: any }>();
  let mobileMenuOpen = $state(false);

  const styles = stylex.create({
    header: {
      position: "sticky",
      top: "0rem",
      zIndex: 50,
      boxShadow: "0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a",
    },
    nav: {
      width: "100%",
      maxWidth: {
        "@media (min-width: 640px)": "640px",
        "@media (min-width: 768px)": "768px",
        "@media (min-width: 1024px)": "1024px",
        "@media (min-width: 1280px)": "1280px",
        "@media (min-width: 1536px)": "1536px",
      },
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
    },
    div: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    div2: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    img: {
      height: "4rem",
      width: "auto",
      objectFit: "contain",
    },
    img2: {
      height: "3.5rem",
      width: "auto",
      objectFit: "contain",
    },
    div3: {
      display: {
        default: "none",
        "@media (min-width: 768px)": "flex",
      },
      alignItems: "center",
      gap: "1.5rem",
    },
    a: {
      fontWeight: 500,
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(59.6% 0.145 163.225)",
      },
    },
    button: {
      borderRadius: ".375rem",
      paddingTop: "0.5rem",
      paddingRight: "0.5rem",
      paddingBottom: "0.5rem",
      paddingLeft: "0.5rem",
      display: {
        "@media (min-width: 768px)": "none",
      },
    },
    X: {
      height: "1.5rem",
      width: "1.5rem",
    },
    div4: {
      marginTop: "1rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      paddingTop: "1rem",
      display: {
        "@media (min-width: 768px)": "none",
      },
    },
    div5: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    a2: {
      width: "fit-content",
      borderRadius: ".375rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "oklch(59.6% 0.145 163.225)",
      backgroundColor: {
        default: "oklch(59.6% 0.145 163.225)",
        ":hover": "oklch(50.8% 0.118 165.612)",
      },
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      fontWeight: 500,
      color: "#fff",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    a3: {
      width: "fit-content",
    },
  });
</script>

<header class={stylex.attrs(styles.header).class}>
  <nav class={stylex.attrs(styles.nav).class}>
    <div class={stylex.attrs(styles.div).class}>
      <!-- Logos -->
      <div class={stylex.attrs(styles.div2).class}>
        <a href="/">
          <img src={logoPEMD} alt="PEMD 360" class={stylex.attrs(styles.img).class} />
        </a>
        <a href="https://depollution-conseil.fr" target="_blank" rel="noopener noreferrer">
          <img src={logoDC} alt="Dépollution Conseil" class={stylex.attrs(styles.img2).class} />
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class={stylex.attrs(styles.div3).class}>
        <a href="/" class={stylex.attrs(styles.a).class}>Accueil</a>
        <a href="/about" class={stylex.attrs(styles.a).class}>À propos</a>
        <a href="/contact" class={stylex.attrs(styles.a).class}>Contact</a>
        {#if user}
          <a href="/app/projets" class={stylex.attrs(ui.button).class}>Tableau de bord</a>
        {:else}
          <a href="/login" class={stylex.attrs(ui.button).class}>Se connecter</a>
        {/if}
      </div>

      <!-- Mobile menu button -->
      <button
        class={stylex.attrs(styles.button).class}
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {#if mobileMenuOpen}
          <X class={stylex.attrs(styles.X).class} />
        {:else}
          <Menu class={stylex.attrs(styles.X).class} />
        {/if}
      </button>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class={stylex.attrs(styles.div4).class}>
        <div class={stylex.attrs(styles.div5).class}>
          <a href="/" class={stylex.attrs(styles.a).class} onclick={() => (mobileMenuOpen = false)}
            >Accueil</a
          >
          <a
            href="/about"
            class={stylex.attrs(styles.a).class}
            onclick={() => (mobileMenuOpen = false)}>À propos</a
          >
          <a
            href="/contact"
            class={stylex.attrs(styles.a).class}
            onclick={() => (mobileMenuOpen = false)}>Contact</a
          >
          {#if user}
            <a
              href="/app/projets"
              class={stylex.attrs(styles.a2).class}
              onclick={() => (mobileMenuOpen = false)}
            >
              Tableau de bord
            </a>
          {:else}
            <a
              href="/login"
              class={stylex.attrs(ui.button, ui.buttonSuccess, ui.buttonOutline, styles.a3).class}
              onclick={() => (mobileMenuOpen = false)}
            >
              Se connecter
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </nav>
</header>
