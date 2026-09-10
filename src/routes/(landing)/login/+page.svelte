<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { AlertError } from "$lib/components";
  import { AtSign, Lock, Eye, EyeOff, Loader } from "lucide-svelte";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);
  let showPassword = $state(false);

  async function handleLogin() {
    error = "";

    if (!email || !password) {
      error = "Tous les champs sont requis";
      return;
    }

    loading = true;

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        error = response.error.message || "Email ou mot de passe incorrect";
      } else {
        // Connexion réussie, rediriger vers le tableau de bord
        goto("/app/projets");
      }
    } catch (e) {
      error = "Une erreur est survenue. Veuillez réessayer.";
      console.error(e);
    } finally {
      loading = false;
    }
  }
  const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

  const styles = stylex.create({
    div: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "3rem",
      paddingBottom: "1rem",
    },
    div2: {
      marginBottom: "1rem",
      width: "100%",
      maxWidth: "28rem",
    },
    div3: {
      borderRadius: "1rem",
      paddingTop: "2rem",
      paddingRight: "2rem",
      paddingBottom: "2rem",
      paddingLeft: "2rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div4: {
      marginBottom: "1.5rem",
    },
    h1: {
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    p: {
      marginTop: "0.5rem",
    },
    form: {
      "--stack-gap": "1.5rem",
    },
    label: {
      marginBottom: "0.5rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div5: {
      position: "relative",
    },
    div6: {
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "0rem",
      display: "flex",
      alignItems: "center",
      paddingLeft: "0.75rem",
    },
    AtSign: {
      height: "1.25rem",
      width: "1.25rem",
    },
    input: {
      width: "100%",
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: {
        default: "oklch(87.2% 0.01 258.338)",
        ":focus": "oklch(69.6% 0.17 162.48)",
      },
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      paddingRight: "1rem",
      paddingLeft: "2.5rem",
      "::placeholder": {
        color: "oklch(70.7% 0.022 261.325)",
      },
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: {
        ":focus":
          "0 0 0 var(--focus-offset, 0px) var(--focus-offset-color, #fff), 0 0 0 calc(2px + var(--focus-offset, 0px)) var(--focus-color, currentColor)",
      },
      "--focus-color": {
        ":focus": "color-mix(in oklab, oklch(69.6% 0.17 162.48) 20%, transparent)",
      },
      outlineStyle: {
        ":focus": "none",
      },
    },
    input2: {
      width: "100%",
      borderRadius: ".5rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: {
        default: "oklch(87.2% 0.01 258.338)",
        ":focus": "oklch(69.6% 0.17 162.48)",
      },
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      paddingRight: "3rem",
      paddingLeft: "2.5rem",
      "::placeholder": {
        color: "oklch(70.7% 0.022 261.325)",
      },
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: {
        ":focus":
          "0 0 0 var(--focus-offset, 0px) var(--focus-offset-color, #fff), 0 0 0 calc(2px + var(--focus-offset, 0px)) var(--focus-color, currentColor)",
      },
      "--focus-color": {
        ":focus": "color-mix(in oklab, oklch(69.6% 0.17 162.48) 20%, transparent)",
      },
      outlineStyle: {
        ":focus": "none",
      },
    },
    button: {
      position: "absolute",
      top: 0,
      bottom: 0,
      right: "0rem",
      display: "flex",
      alignItems: "center",
      paddingRight: "0.75rem",
    },
    Loader: {
      height: "1.25rem",
      width: "1.25rem",
      animationName: spin,
      animationDuration: "1s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationName: "none",
      },
    },
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <!-- Card -->
    <div class={stylex.attrs(styles.div3).class}>
      <div class={stylex.attrs(styles.div4).class}>
        <h1 class={stylex.attrs(styles.h1).class}>Bienvenue</h1>
        <p class={stylex.attrs(styles.p).class}>Connectez-vous à votre compte</p>
      </div>

      {#if error}
        <AlertError message={error} />
      {/if}

      <form
        onsubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        class={stylex.attrs(styles.form).class}
      >
        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="email" class={stylex.attrs(styles.label).class}> Adresse email </label>
          <div class={stylex.attrs(styles.div5).class}>
            <div class={stylex.attrs(styles.div6).class}>
              <AtSign class={stylex.attrs(styles.AtSign).class} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              class={stylex.attrs(styles.input).class}
              bind:value={email}
              required
            />
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing15).class}>
          <label for="password" class={stylex.attrs(styles.label).class}> Mot de passe </label>
          <div class={stylex.attrs(styles.div5).class}>
            <div class={stylex.attrs(styles.div6).class}>
              <Lock class={stylex.attrs(styles.AtSign).class} />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              class={stylex.attrs(styles.input2).class}
              bind:value={password}
              required
            />
            <button
              type="button"
              class={stylex.attrs(styles.button).class}
              onclick={() => (showPassword = !showPassword)}
            >
              {#if showPassword}
                <EyeOff class={stylex.attrs(styles.AtSign).class} />
              {:else}
                <Eye class={stylex.attrs(styles.AtSign).class} />
              {/if}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class={stylex.attrs(styles.stackSpacing15, ui.button).class}
          disabled={loading}
        >
          {#if loading}
            <Loader class={stylex.attrs(styles.Loader).class} />
            <span>Connexion en cours...</span>
          {:else}
            <span>Se connecter</span>
          {/if}
        </button>
      </form>
    </div>

    <!-- Footer -->
    <div class={stylex.attrs(ui.button).class}>
      <a href="/">Retour à l'accueil </a>
    </div>
  </div>
</div>
