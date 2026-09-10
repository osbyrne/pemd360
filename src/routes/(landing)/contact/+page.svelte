<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { Home, Mail, Phone, MapPin } from "lucide-svelte";

  let formData = $state({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  let isSubmitting = $state(false);
  let submitStatus = $state<"idle" | "success" | "error">("idle");

  const contactInfo = [
    {
      icon: "envelope",
      label: "Email",
      value: "florent.mouriot@depollution-conseil.fr",
      href: "mailto:florent.mouriot@depollution-conseil.fr",
    },
    {
      icon: "phone",
      label: "Téléphone",
      value: "06 31 32 67 15",
      href: "tel:+33631326715",
    },
    {
      icon: "location",
      label: "Adresse",
      value: "7 rue Montespan 91000, Évry-Courcouronnes",
      href: "https://maps.google.com/?q=7+rue+Montespan+91000+Évry-Courcouronnes",
    },
  ];

  async function handleSubmit(e: Event) {
    e.preventDefault();
    isSubmitting = true;
    submitStatus = "idle";

    try {
      // Simuler l'envoi du formulaire
      await new Promise((resolve) => setTimeout(resolve, 1000));
      submitStatus = "success";
      formData = { name: "", email: "", phone: "", subject: "", message: "" };
    } catch {
      submitStatus = "error";
    } finally {
      isSubmitting = false;
    }
  }

  const styles = stylex.create({
    section: {
      position: "relative",
      backgroundSize: "cover",
      backgroundPosition: "center",
      paddingTop: "4rem",
      paddingBottom: "4rem",
    },
    div: {
      position: "absolute",
      inset: 0,
      backgroundColor: "color-mix(in oklab, #000 60%, transparent)",
    },
    div2: {
      position: "relative",
      zIndex: 10,
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
      color: "#fff",
    },
    h1: {
      marginBottom: "1rem",
      fontSize: {
        default: "2.25rem",
        "@media (min-width: 768px)": "3rem",
      },
      lineHeight: {
        default: "2.5rem",
        "@media (min-width: 768px)": 1,
      },
      fontWeight: 700,
    },
    ol: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    a: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(76.5% 0.177 163.223)",
      },
    },
    Home: {
      height: "1rem",
      width: "1rem",
    },
    li: {
      color: "oklch(76.5% 0.177 163.223)",
    },
    section2: {
      paddingTop: {
        default: "4rem",
        "@media (min-width: 1024px)": "6rem",
      },
      paddingBottom: {
        default: "4rem",
        "@media (min-width: 1024px)": "6rem",
      },
    },
    div3: {
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
    },
    div4: {
      display: "grid",
      gap: "3rem",
      gridTemplateColumns: {
        "@media (min-width: 1024px)": "repeat(1, minmax(0, 1fr))",
      },
    },
    span: {
      marginBottom: "0.5rem",
      display: "inline-block",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
      letterSpacing: ".05em",
      color: "oklch(59.6% 0.145 163.225)",
      textTransform: "uppercase",
    },
    h2: {
      marginBottom: "1.5rem",
      fontSize: {
        default: "1.875rem",
        "@media (min-width: 1024px)": "2.25rem",
      },
      lineHeight: {
        default: "2.25rem",
        "@media (min-width: 1024px)": "2.5rem",
      },
      fontWeight: 700,
    },
    p: {
      marginBottom: "2rem",
    },
    div5: {
      "--stack-gap": "1.5rem",
    },
    a2: {
      display: "flex",
      alignItems: "flex-start",
      gap: "1rem",
      borderRadius: ".5rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div6: {
      display: "flex",
      height: "3rem",
      width: "3rem",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(95% 0.052 163.051)",
      color: "oklch(59.6% 0.145 163.225)",
    },
    Mail: {
      height: "1.25rem",
      width: "1.25rem",
    },
    h5: {
      fontWeight: 600,
    },
    div7: {
      marginTop: "2rem",
      overflow: "hidden",
      borderRadius: ".5rem",
      boxShadow: "0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a",
    },
    section3: {
      backgroundColor: "oklch(59.6% 0.145 163.225)",
      paddingTop: "3rem",
      paddingBottom: "3rem",
    },
    div8: {
      display: "flex",
      flexDirection: {
        default: "column",
        "@media (min-width: 1024px)": "row",
      },
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1.5rem",
      textAlign: {
        default: "center",
        "@media (min-width: 1024px)": "left",
      },
    },
    div9: {
      color: "#fff",
    },
    h22: {
      marginBottom: "0.5rem",
      fontSize: {
        default: "1.5rem",
        "@media (min-width: 768px)": "1.875rem",
      },
      lineHeight: {
        default: "2rem",
        "@media (min-width: 768px)": "2.25rem",
      },
      fontWeight: 700,
    },
    p2: {
      color: "oklch(95% 0.052 163.051)",
    },
    stackSpacing15: { marginBlockEnd: { default: "1.5rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>Contact - PEMD 360</title>
  <meta
    name="description"
    content="Contactez Dépollution Conseil pour vos projets de diagnostic PEMD. Nous sommes à votre écoute."
  />
</svelte:head>

<!-- Hero Banner -->
<section
  class={stylex.attrs(styles.section).class}
  style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&auto=format&fit=crop')"
>
  <div class={stylex.attrs(styles.div).class}></div>
  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>Contact</h1>
    <nav aria-label="Fil d'Ariane">
      <ol class={stylex.attrs(styles.ol).class}>
        <li>
          <a href="/" class={stylex.attrs(styles.a).class}>
            <Home class={stylex.attrs(styles.Home).class} />
            Accueil
          </a>
        </li>
        <li>/</li>
        <li class={stylex.attrs(styles.li).class}>Contact</li>
      </ol>
    </nav>
  </div>
</section>

<!-- Contact Section -->
<section class={stylex.attrs(styles.section2).class}>
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div4).class}>
      <!-- Contact Info -->
      <div>
        <span class={stylex.attrs(styles.span).class}> Contactez-nous </span>
        <h2 class={stylex.attrs(styles.h2).class}>Nous sommes à votre écoute</h2>
        <p class={stylex.attrs(styles.p).class}>
          Vous avez un projet de démolition ou de rénovation significative ? N'hésitez pas à nous
          contacter pour obtenir un devis ou des informations sur nos services de diagnostic PEMD.
        </p>

        <!-- Contact Details -->
        <div class={stylex.attrs(styles.div5).class}>
          {#each contactInfo as info}
            <a
              href={info.href}
              target={info.icon === "location" ? "_blank" : undefined}
              rel={info.icon === "location" ? "noopener noreferrer" : undefined}
              class={stylex.attrs(styles.stackSpacing15, styles.a2).class}
            >
              <div class={stylex.attrs(styles.div6).class}>
                {#if info.icon === "envelope"}
                  <Mail class={stylex.attrs(styles.Mail).class} />
                {:else if info.icon === "phone"}
                  <Phone class={stylex.attrs(styles.Mail).class} />
                {:else}
                  <MapPin class={stylex.attrs(styles.Mail).class} />
                {/if}
              </div>
              <div>
                <h5 class={stylex.attrs(styles.h5).class}>{info.label}</h5>
                <p>{info.value}</p>
              </div>
            </a>
          {/each}
        </div>

        <!-- Map -->
        <div class={stylex.attrs(styles.div7).class}>
          <iframe
            title="Localisation Dépollution Conseil"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2638.5!2d2.4297!3d48.6247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDM3JzI5LjAiTiAywrAyNSc0Ni45IkU!5e0!3m2!1sfr!2sfr!4v1234567890"
            width="100%"
            height="250"
            style="border:0;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class={stylex.attrs(styles.section3).class}>
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div8).class}>
      <div class={stylex.attrs(styles.div9).class}>
        <h2 class={stylex.attrs(styles.h22).class}>Besoin d'un diagnostic PEMD ?</h2>
        <p class={stylex.attrs(styles.p2).class}>
          Notre équipe est disponible pour répondre à toutes vos questions.
        </p>
      </div>
      <a href="tel:+33631326715" class={stylex.attrs(ui.button).class}>
        Appelez-nous : 06 31 32 67 15
      </a>
    </div>
  </div>
</section>
