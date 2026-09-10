<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import logoDC from "$lib/assets/depollution_conseil.png";
  import { Home, CheckCircle } from "lucide-svelte";

  const services = [
    "Numérisation de bâtiments",
    "Création d'un jumeau numérique",
    "Plan 2D / DWG",
    "Réalisation du diagnostic PEMD",
    "Estimation de la masse des déchets",
    "Outil collaboratif du chantier",
  ];

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
      alignItems: "center",
      gap: "3rem",
      gridTemplateColumns: {
        "@media (min-width: 1024px)": "repeat(2, minmax(0, 1fr))",
      },
    },
    div5: {
      display: "flex",
      justifyContent: "center",
    },
    div6: {
      overflow: "hidden",
      borderRadius: ".5rem",
      paddingTop: "1.5rem",
      paddingRight: "1.5rem",
      paddingBottom: "1.5rem",
      paddingLeft: "1.5rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    img: {
      height: "auto",
      maxWidth: "24rem",
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
    div7: {
      "--stack-gap": "1rem",
    },
    p: {
      textAlign: "justify",
      lineHeight: 1.625,
    },
    div8: {
      marginTop: "2rem",
      marginBottom: "2rem",
      display: "grid",
      gridTemplateColumns: {
        default: "repeat(1, minmax(0, 1fr))",
        "@media (min-width: 640px)": "repeat(2, minmax(0, 1fr))",
      },
      gap: "0.75rem",
    },
    CheckCircle: {
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
      color: "oklch(69.6% 0.17 162.48)",
    },
    div9: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "1.5rem",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderBottomWidth: "1px",
      borderBottomStyle: "solid",
      borderColor: "oklch(92.8% 0.006 264.531)",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    div10: {
      borderLeftWidth: "2px",
      borderLeftStyle: "solid",
      borderColor: "oklch(69.6% 0.17 162.48)",
      paddingLeft: "1rem",
    },
    h5: {
      fontWeight: 600,
    },
    p2: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div11: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "48rem",
      textAlign: "center",
    },
    p3: {
      fontSize: "1.125rem",
      lineHeight: 1.625,
    },
    div12: {
      marginTop: "2rem",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>À propos - PEMD 360</title>
  <meta
    name="description"
    content="Découvrez Dépollution Conseil, bureau d'études spécialisé en Sites et Sols Pollués depuis 2014."
  />
</svelte:head>

<!-- Hero Banner -->
<section
  class={stylex.attrs(styles.section).class}
  style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&auto=format&fit=crop')"
>
  <div class={stylex.attrs(styles.div).class}></div>
  <div class={stylex.attrs(styles.div2).class}>
    <h1 class={stylex.attrs(styles.h1).class}>À propos de nous</h1>
    <nav aria-label="Fil d'Ariane">
      <ol class={stylex.attrs(styles.ol).class}>
        <li>
          <a href="/" class={stylex.attrs(styles.a).class}>
            <Home class={stylex.attrs(styles.Home).class} />
            Accueil
          </a>
        </li>
        <li>/</li>
        <li class={stylex.attrs(styles.li).class}>À propos de nous</li>
      </ol>
    </nav>
  </div>
</section>

<!-- About Section -->
<section class={stylex.attrs(styles.section2).class}>
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div4).class}>
      <!-- Image -->
      <div class={stylex.attrs(styles.div5).class}>
        <div class={stylex.attrs(styles.div6).class}>
          <img src={logoDC} alt="Dépollution Conseil" class={stylex.attrs(styles.img).class} />
        </div>
      </div>

      <!-- Content -->
      <div>
        <span class={stylex.attrs(styles.span).class}> Qui sommes-nous ? </span>
        <h2 class={stylex.attrs(styles.h2).class}>Dépollution Conseil</h2>

        <div class={stylex.attrs(styles.div7).class}>
          <p class={stylex.attrs(styles.stackSpacing1, styles.p).class}>
            Depuis 2014, Dépollution Conseil, c'est avant tout un savoir-faire rigoureux, des études
            précises et un accompagnement soigné mis en œuvre pour mener à bien vos projets.
          </p>
          <p class={stylex.attrs(styles.stackSpacing1, styles.p).class}>
            Bureau d'études spécialisé en Sites et Sols Pollués, nous vous accompagnons dans la
            prospection de pollution, l'évaluation des risques et l'identification de solutions de
            gestion adaptées à vos besoins.
          </p>
        </div>

        <!-- Services List -->
        <div class={stylex.attrs(styles.div8).class}>
          {#each services as service}
            <div class={stylex.attrs(styles.ol).class}>
              <CheckCircle class={stylex.attrs(styles.CheckCircle).class} />
              <span>{service}</span>
            </div>
          {/each}
        </div>

        <!-- Contact Info -->
        <div class={stylex.attrs(styles.div9).class}>
          <div class={stylex.attrs(styles.div10).class}>
            <h5 class={stylex.attrs(styles.h5).class}>Groupe Dépollution Conseil</h5>
          </div>
          <div class={stylex.attrs(styles.div10).class}>
            <h5 class={stylex.attrs(styles.h5).class}>06 31 32 67 15</h5>
            <p class={stylex.attrs(styles.p2).class}>Vous pouvez nous poser des questions</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Innovation Section -->
<section class={stylex.attrs(styles.section2).class}>
  <div class={stylex.attrs(styles.div3).class}>
    <div class={stylex.attrs(styles.div11).class}>
      <span class={stylex.attrs(styles.span).class}> Vers une économie circulaire </span>
      <h2 class={stylex.attrs(styles.h2).class}>
        Dépollution Conseil vous propose une solution innovante
      </h2>
      <p class={stylex.attrs(styles.p3).class}>
        Depuis 2021, nous proposons un nouveau service dans le domaine de l'économie circulaire.
        Cette nouvelle branche a permis la création d'une application web permettant d'élaborer des
        diagnostics Produits, Équipements, Matériaux et Déchets (PEMD) en ligne.
      </p>

      <!-- CTA Button -->
      <div class={stylex.attrs(styles.div12).class}>
        <a href="/contact" class={stylex.attrs(ui.button).class}> Nous contacter </a>
      </div>
    </div>
  </div>
</section>
