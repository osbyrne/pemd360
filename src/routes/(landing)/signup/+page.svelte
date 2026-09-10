<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import logoPEMD from "$lib/assets/pemd360.png";
  import { AlertError } from "$lib/components";
  import { User, AtSign, Lock, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-svelte";

  let { form }: { form?: { error?: string; success?: boolean } } = $props();

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let error = $state("");
  let loading = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  // Password strength indicator
  const passwordStrength = $derived.by(() => {
    if (!password) return { level: 0, text: "", color: undefined };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: "Faible", color: ui.bgRed500 };
    if (strength <= 3) return { level: 2, text: "Moyen", color: ui.bgYellow500 };
    return { level: 3, text: "Fort", color: ui.bgEmerald500 };
  });

  // Afficher les erreurs du serveur
  $effect(() => {
    if (form?.error) {
      error = form.error;
    } else if (form?.success) {
      goto("/login");
    }
  });

  function validateForm() {
    error = "";

    if (!name || !email || !password) {
      error = "Tous les champs sont requis";
      return false;
    }

    if (password !== confirmPassword) {
      error = "Les mots de passe ne correspondent pas";
      return false;
    }

    if (password.length < 8) {
      error = "Le mot de passe doit contenir au moins 8 caractères";
      return false;
    }

    return true;
  }
  const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

  const styles = stylex.create({
    div: {
      display: "flex",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      backgroundImage:
        "linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via, var(--gradient-from)), var(--gradient-to))",
      "--gradient-from": "oklch(97.9% 0.021 166.113)",
      "--gradient-via": "#fff",
      "--gradient-to": "oklch(97.9% 0.021 166.113)",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "3rem",
      paddingBottom: "3rem",
    },
    div2: {
      width: "100%",
      maxWidth: "28rem",
    },
    div3: {
      marginBottom: "2rem",
      textAlign: "center",
    },
    a: {
      display: "inline-block",
    },
    img: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      height: "5rem",
      width: "auto",
    },
    div4: {
      borderRadius: "1rem",
      paddingTop: "2rem",
      paddingRight: "2rem",
      paddingBottom: "2rem",
      paddingLeft: "2rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    div5: {
      marginBottom: "2rem",
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
      "--stack-gap": "1.25rem",
    },
    label: {
      marginBottom: "0.5rem",
      display: "block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
    div6: {
      position: "relative",
    },
    div7: {
      pointerEvents: "none",
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "0rem",
      display: "flex",
      alignItems: "center",
      paddingLeft: "0.75rem",
    },
    User: {
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
    div8: {
      marginBottom: "0.25rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    span: {
      fontWeight: 500,
    },
    div9: {
      display: "flex",
      gap: "0.25rem",
    },
    div10: {
      height: "0.25rem",
      flex: "1 1 0%",
      borderRadius: "9999px",
    },
    div11: {
      height: "100%",
      borderRadius: "9999px",
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    button2: {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: ".5rem",
      backgroundColor: {
        default: "oklch(59.6% 0.145 163.225)",
        ":hover": "oklch(50.8% 0.118 165.612)",
      },
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      fontWeight: 600,
      color: "#fff",
      transitionProperty: "all",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: {
        ":focus":
          "0 0 0 var(--focus-offset, 0px) var(--focus-offset-color, #fff), 0 0 0 calc(2px + var(--focus-offset, 0px)) var(--focus-color, currentColor)",
      },
      "--focus-color": {
        ":focus": "oklch(69.6% 0.17 162.48)",
      },
      "--focus-offset": {
        ":focus": "2px",
      },
      outlineStyle: {
        ":focus": "none",
      },
      cursor: {
        ":disabled": "not-allowed",
      },
      opacity: {
        ":disabled": 0.6,
      },
    },
    Loader2: {
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
    div12: {
      marginTop: "2rem",
      textAlign: "center",
    },
    p2: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    a2: {
      fontWeight: 600,
      color: {
        default: "oklch(59.6% 0.145 163.225)",
        ":hover": "oklch(50.8% 0.118 165.612)",
      },
    },
    a3: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      color: {
        ":hover": "oklch(59.6% 0.145 163.225)",
      },
    },
    stackSpacing125: { marginBlockEnd: { default: "1.25rem", ":last-child": 0 } },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <!-- Logo -->
    <div class={stylex.attrs(styles.div3).class}>
      <a href="/" class={stylex.attrs(styles.a).class}>
        <img src={logoPEMD} alt="PEMD 360" class={stylex.attrs(styles.img).class} />
      </a>
    </div>

    <!-- Card -->
    <div class={stylex.attrs(styles.div4).class}>
      <div class={stylex.attrs(styles.div5).class}>
        <h1 class={stylex.attrs(styles.h1).class}>Créer un compte</h1>
        <p class={stylex.attrs(styles.p).class}>Rejoignez PEMD 360 dès aujourd'hui</p>
      </div>

      {#if error}
        <AlertError message={error} />
      {/if}

      <form
        method="POST"
        use:enhance={() => {
          if (!validateForm()) {
            return async ({ update }) => {
              await update({ reset: false });
            };
          }
          loading = true;
          return async ({ result, update }) => {
            loading = false;
            await update();
          };
        }}
        class={stylex.attrs(styles.form).class}
      >
        <div class={stylex.attrs(styles.stackSpacing125).class}>
          <label for="name" class={stylex.attrs(styles.label).class}> Nom complet </label>
          <div class={stylex.attrs(styles.div6).class}>
            <div class={stylex.attrs(styles.div7).class}>
              <User class={stylex.attrs(styles.User).class} />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jean Dupont"
              class={stylex.attrs(styles.input).class}
              bind:value={name}
              required
            />
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing125).class}>
          <label for="email" class={stylex.attrs(styles.label).class}> Adresse email </label>
          <div class={stylex.attrs(styles.div6).class}>
            <div class={stylex.attrs(styles.div7).class}>
              <AtSign class={stylex.attrs(styles.User).class} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              class={stylex.attrs(styles.input).class}
              bind:value={email}
              required
            />
          </div>
        </div>

        <div class={stylex.attrs(styles.stackSpacing125).class}>
          <label for="password" class={stylex.attrs(styles.label).class}> Mot de passe </label>
          <div class={stylex.attrs(styles.div6).class}>
            <div class={stylex.attrs(styles.div7).class}>
              <Lock class={stylex.attrs(styles.User).class} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères"
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
                <EyeOff class={stylex.attrs(styles.User).class} />
              {:else}
                <Eye class={stylex.attrs(styles.User).class} />
              {/if}
            </button>
          </div>
          {#if password}
            <div class={stylex.attrs(styles.p).class}>
              <div class={stylex.attrs(styles.div8).class}>
                <span>Force du mot de passe</span>
                <span class={stylex.attrs(styles.span).class}>{passwordStrength.text}</span>
              </div>
              <div class={stylex.attrs(styles.div9).class}>
                {#each Array(3) as _, i}
                  <div class={stylex.attrs(styles.div10).class}>
                    <div
                      class={stylex.attrs(
                        styles.div11,
                        i < passwordStrength.level ? passwordStrength.color : false,
                      ).class}
                      style="width: 100%"
                    ></div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <div class={stylex.attrs(styles.stackSpacing125).class}>
          <label for="confirmPassword" class={stylex.attrs(styles.label).class}>
            Confirmer le mot de passe
          </label>
          <div class={stylex.attrs(styles.div6).class}>
            <div class={stylex.attrs(styles.div7).class}>
              <CheckCircle class={stylex.attrs(styles.User).class} />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer votre mot de passe"
              class={stylex.attrs(styles.input2).class}
              bind:value={confirmPassword}
              required
            />
            <button
              type="button"
              class={stylex.attrs(styles.button).class}
              onclick={() => (showConfirmPassword = !showConfirmPassword)}
            >
              {#if showConfirmPassword}
                <EyeOff class={stylex.attrs(styles.User).class} />
              {:else}
                <Eye class={stylex.attrs(styles.User).class} />
              {/if}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class={stylex.attrs(styles.stackSpacing125, styles.button2).class}
          disabled={loading}
        >
          {#if loading}
            <Loader2 class={stylex.attrs(styles.Loader2).class} />
            <span>Inscription en cours...</span>
          {:else}
            <span>Créer mon compte</span>
          {/if}
        </button>
      </form>

      <div class={stylex.attrs(styles.div12).class}>
        <p class={stylex.attrs(styles.p2).class}>
          Vous avez déjà un compte ?
          <a href="/login" class={stylex.attrs(styles.a2).class}> Se connecter </a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class={stylex.attrs(styles.div12).class}>
      <a href="/" class={stylex.attrs(styles.a3).class}>Retour à l'accueil </a>
    </div>
  </div>
</div>
