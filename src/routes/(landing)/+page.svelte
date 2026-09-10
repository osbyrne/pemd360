<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { onMount } from "svelte";
  import logoPEMD from "$lib/assets/pemd360.png";
  import slideNumerisation from "$lib/assets/depollution.jpeg";
  import slideSuivi from "$lib/assets/suivi.jpeg";
  import slideDiagnostic from "$lib/assets/model_accueil.jpeg";
  import { ChevronLeft, ChevronRight, Play } from "lucide-svelte";

  // Carousel state
  let currentSlide = $state(0);
  let autoplayInterval: ReturnType<typeof setInterval>;

  const slides = [
    {
      title: "NUMÉRISATION",
      description:
        "A l'aide d'une caméra 3D, nous réalisons une numérisation de vos bâtiments afin de concevoir un jumeau numérique de ces derniers.",
      image: slideNumerisation,
    },
    {
      title: "SUIVI DE CHANTIER",
      description:
        "Accompagnement des acteurs sur les différentes phases du chantier, des diagnostics au suivi de chantier.",
      image: slideSuivi,
    },
    {
      title: "DIAGNOSTIC PEMD",
      description:
        "Réalisation du diagnostic Produits, Équipements, Matériaux et Déchets à l'aide de notre application web.",
      image: slideDiagnostic,
    },
  ];

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  }

  function goToSlide(index: number) {
    currentSlide = index;
  }

  onMount(() => {
    autoplayInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(autoplayInterval);
  });

  const styles = stylex.create({
    section: {
      position: "relative",
      height: "37.5rem",
      width: "100%",
      overflow: "hidden",
    },
    div: {
      position: "absolute",
      inset: 0,
      transitionProperty: "opacity",
      transitionDuration: "700ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div2: {
      position: "absolute",
      inset: 0,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    div3: {
      position: "absolute",
      inset: 0,
    },
    div4: {
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
      display: "flex",
      height: "100%",
      alignItems: "center",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
    },
    div5: {
      maxWidth: "42rem",
      borderRadius: "1rem",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "color-mix(in oklab, #fff 30%, transparent)",
      backgroundColor: "color-mix(in oklab, #000 25%, transparent)",
      paddingInlineStart: {
        default: "1.5rem",
        "@media (min-width: 768px)": "3rem",
      },
      paddingInlineEnd: {
        default: "1.5rem",
        "@media (min-width: 768px)": "3rem",
      },
      paddingTop: "1.5rem",
      paddingBottom: "1.5rem",
      color: "#fff",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
      backdropFilter: "blur(12px)",
    },
    h1: {
      marginBottom: "1rem",
      fontSize: {
        default: "2.25rem",
        "@media (min-width: 768px)": "3rem",
        "@media (min-width: 1024px)": "3.75rem",
      },
      lineHeight: {
        default: "2.5rem",
        "@media (min-width: 768px)": 1,
        "@media (min-width: 1024px)": 1,
      },
      fontWeight: 700,
    },
    p: {
      marginBottom: "2rem",
      fontSize: {
        default: "1.125rem",
        "@media (min-width: 768px)": "1.25rem",
      },
      lineHeight: {
        default: 1.625,
        "@media (min-width: 768px)": "1.75rem",
      },
    },
    div6: {
      display: "flex",
      flexDirection: "row",
      gap: "1rem",
    },
    button: {
      position: "absolute",
      top: "50%",
      left: "1rem",
      zIndex: 20,
      display: {
        default: "none",
        "@media (min-width: 768px)": "block",
      },
      "--translate-y": "-50%",
      translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
      borderRadius: "9999px",
      backgroundColor: {
        default: "color-mix(in oklab, #fff 20%, transparent)",
        ":hover": "color-mix(in oklab, #fff 40%, transparent)",
      },
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
      color: "#fff",
      backdropFilter: "blur(8px)",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    ChevronLeft: {
      height: "1.5rem",
      width: "1.5rem",
    },
    button2: {
      position: "absolute",
      top: "50%",
      right: "1rem",
      zIndex: 20,
      display: {
        default: "none",
        "@media (min-width: 768px)": "block",
      },
      "--translate-y": "-50%",
      translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
      borderRadius: "9999px",
      backgroundColor: {
        default: "color-mix(in oklab, #fff 20%, transparent)",
        ":hover": "color-mix(in oklab, #fff 40%, transparent)",
      },
      paddingTop: "0.75rem",
      paddingRight: "0.75rem",
      paddingBottom: "0.75rem",
      paddingLeft: "0.75rem",
      color: "#fff",
      backdropFilter: "blur(8px)",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    div7: {
      position: "absolute",
      bottom: "1.5rem",
      left: "50%",
      zIndex: 20,
      display: "flex",
      "--translate-x": "-50%",
      translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
      gap: "0.5rem",
    },
    button3: {
      height: "0.75rem",
      width: "0.75rem",
      borderRadius: "9999px",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
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
    div8: {
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
      marginBottom: "1.5rem",
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
    },
    div9: {
      display: "grid",
      alignItems: "center",
      gap: "3rem",
      gridTemplateColumns: {
        "@media (min-width: 1024px)": "repeat(2, minmax(0, 1fr))",
      },
    },
    div10: {
      order: {
        default: 2,
        "@media (min-width: 1024px)": 1,
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
    div11: {
      "--stack-gap": "1rem",
    },
    p2: {
      textAlign: "justify",
      lineHeight: 1.625,
    },
    a: {
      color: "oklch(59.6% 0.145 163.225)",
      textDecorationLine: {
        ":hover": "underline",
      },
    },
    ul: {
      listStylePosition: "inside",
      listStyleType: "disc",
    },
    div12: {
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
      fontSize: {
        default: ".875rem",
        "@media (min-width: 768px)": "1rem",
      },
      lineHeight: {
        default: "1.25rem",
        "@media (min-width: 768px)": "1.5rem",
      },
    },
    div13: {
      borderLeftWidth: "2px",
      borderLeftStyle: "solid",
      borderColor: "oklch(69.6% 0.17 162.48)",
      paddingLeft: "1rem",
    },
    h5: {
      fontWeight: 600,
    },
    p3: {
      fontSize: ".75rem",
      lineHeight: "1rem",
    },
    div14: {
      order: {
        default: 1,
        "@media (min-width: 1024px)": 2,
      },
    },
    div15: {
      overflow: "hidden",
      borderRadius: ".5rem",
      borderWidth: "4px",
      borderStyle: "solid",
      borderColor: "#fff",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    img: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      marginBottom: "1rem",
      height: "auto",
      width: "100%",
      maxWidth: "28rem",
    },
    section3: {
      backgroundImage:
        "linear-gradient(to right, var(--gradient-from), var(--gradient-via, var(--gradient-from)), var(--gradient-to))",
      "--gradient-from": "oklch(59.6% 0.145 163.225)",
      "--gradient-to": "oklch(50.8% 0.118 165.612)",
      paddingTop: "3rem",
      paddingBottom: "3rem",
    },
    div16: {
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
    div17: {
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
      color: "#fff",
    },
    p4: {
      color: "oklch(95% 0.052 163.051)",
    },
    div18: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      maxWidth: "56rem",
      borderRadius: "1rem",
      paddingTop: {
        default: "2rem",
        "@media (min-width: 1024px)": "3rem",
      },
      paddingRight: {
        default: "2rem",
        "@media (min-width: 1024px)": "3rem",
      },
      paddingBottom: {
        default: "2rem",
        "@media (min-width: 1024px)": "3rem",
      },
      paddingLeft: {
        default: "2rem",
        "@media (min-width: 1024px)": "3rem",
      },
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    h23: {
      marginBottom: "2.5rem",
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
    ol: {
      "--stack-gap": "2rem",
    },
    li: {
      display: "flex",
      gap: "1.5rem",
    },
    div19: {
      display: "flex",
      height: "3rem",
      width: "3rem",
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(95% 0.052 163.051)",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 700,
      color: "oklch(59.6% 0.145 163.225)",
    },
    h52: {
      marginBottom: "0.25rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    section4: {
      position: "relative",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundPosition: "center",
      paddingTop: {
        default: "5rem",
        "@media (min-width: 1024px)": "8rem",
      },
      paddingBottom: {
        default: "5rem",
        "@media (min-width: 1024px)": "8rem",
      },
    },
    div20: {
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
    },
    div21: {
      marginInlineStart: "auto",
      marginInlineEnd: "auto",
      display: "flex",
      maxWidth: "48rem",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    a2: {
      marginBottom: "1.5rem",
      display: "inline-flex",
      height: "5rem",
      width: "5rem",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      backgroundColor: "oklch(59.6% 0.145 163.225)",
      color: "#fff",
      transitionProperty: "transform, translate, scale, rotate",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      scale: {
        ":hover": 1.1,
      },
    },
    Play: {
      height: "2rem",
      width: "2rem",
      "--translate-x": "0.125rem",
      translate: "var(--translate-x, 0px) var(--translate-y, 0px)",
      fill: "currentColor",
    },
    span2: {
      marginBottom: "0.75rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 600,
      letterSpacing: ".05em",
      color: "oklch(76.5% 0.177 163.223)",
    },
    h24: {
      marginBottom: "2rem",
      fontSize: {
        default: "1.875rem",
        "@media (min-width: 768px)": "2.25rem",
        "@media (min-width: 1024px)": "3rem",
      },
      lineHeight: {
        default: "2.25rem",
        "@media (min-width: 768px)": "2.5rem",
        "@media (min-width: 1024px)": 1,
      },
      fontWeight: 700,
      color: "#fff",
    },
    stackSpacing1: { marginBlockEnd: { default: "1rem", ":last-child": 0 } },
    stackSpacing2: { marginBlockEnd: { default: "2rem", ":last-child": 0 } },
  });
</script>

<svelte:head>
  <title>PEMD 360</title>
  <meta
    name="description"
    content="Contactez Dépollution Conseil pour vos projets de diagnostic PEMD. Nous sommes à votre écoute."
  />
</svelte:head>

<!-- Hero Carousel -->
<section class={stylex.attrs(styles.section).class}>
  {#each slides as slide, index (index)}
    <div
      class={stylex.attrs(
        styles.div,
        index === currentSlide ? ui.opacity100 : [ui.pointerEventsNone, ui.opacity0],
      ).class}
    >
      <!-- Background Image -->
      <div class={stylex.attrs(styles.div2).class} style="background-image: url('{slide.image}')">
        <div class={stylex.attrs(styles.div3).class}></div>
      </div>

      <!-- Content -->
      <div class={stylex.attrs(styles.div4).class}>
        <div class={stylex.attrs(styles.div5).class}>
          <h1 class={stylex.attrs(styles.h1).class}>{slide.title}</h1>
          <p class={stylex.attrs(styles.p).class}>{slide.description}</p>
          <div class={stylex.attrs(styles.div6).class}>
            <a class={stylex.attrs(ui.button).class} href="/#pemd">En savoir plus</a>
            <a class={stylex.attrs(ui.button).class} href="/about">Notre entreprise</a>
          </div>
        </div>
      </div>
    </div>
  {/each}

  <!-- Navigation Arrows -->
  <button onclick={prevSlide} class={stylex.attrs(styles.button).class} aria-label="Previous slide">
    <ChevronLeft class={stylex.attrs(styles.ChevronLeft).class} />
  </button>
  <button onclick={nextSlide} class={stylex.attrs(styles.button2).class} aria-label="Next slide">
    <ChevronRight class={stylex.attrs(styles.ChevronLeft).class} />
  </button>

  <!-- Pagination Dots -->
  <div class={stylex.attrs(styles.div7).class}>
    {#each slides as _, index (index)}
      <button
        onclick={() => goToSlide(index)}
        class={stylex.attrs(
          styles.button3,
          index === currentSlide ? ui.bgEmerald500 : [ui.bgWhiteOver50, ui.hoverBgWhiteOver80],
        ).class}
        aria-label="Go to slide {index + 1}"
      ></button>
    {/each}
  </div>
</section>

<!-- Diagnostic PEMD Section -->
<section id="pemd" class={stylex.attrs(styles.section2).class}>
  <div class={stylex.attrs(styles.div8).class}>
    <div class={stylex.attrs(styles.div9).class}>
      <!-- Content -->
      <div class={stylex.attrs(styles.div10).class}>
        <span class={stylex.attrs(styles.span).class}>NOTRE ACTIVITÉ</span>
        <h2 class={stylex.attrs(styles.h2).class}>Le Diagnostic PEMD</h2>
        <div class={stylex.attrs(styles.div11).class}>
          <p class={stylex.attrs(styles.stackSpacing1, styles.p2).class}>
            <a
              href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047506328"
              target="_blank"
              rel="noopener noreferrer"
              class={stylex.attrs(styles.a).class}
            >
              L'arrêté d'application du <b>26 mars 2023</b>
            </a>
            impose au maître d'ouvrage, depuis le 1<sup>er</sup> juillet 2023, la réalisation d'un
            diagnostic Produits, Équipements, Matériaux et Déchets (PEMD) pour tout projet de
            démolition ou de rénovation significative de bâtiments.
            <br />
          </p>
          <p class={stylex.attrs(styles.stackSpacing1, styles.p2).class}>
            Dans un contexte de transition vers l’économie circulaire, ce diagnostic vise à réduire
            la quantité de déchets issus des chantiers du BTP, en favorisant en priorité le
            réemploi, puis le recyclage et la valorisation des matériaux, conformément à la
            hiérarchie des modes de traitement des déchets.
          </p>
          <p class={stylex.attrs(styles.stackSpacing1, styles.p2).class}>
            Conformément au décret n°2021-872 du 30 juin 2021, recodifiant la partie réglementaire
            du livre I<sup>er</sup> du code de la construction et de l'habitation, le diagnostic PEMD
            permet de réaliser un inventaire exhaustif des éléments constitutifs d'un bâtiment en intégrant
            notamment :
          </p>

          <ul class={stylex.attrs(styles.stackSpacing1, styles.ul).class}>
            <li>les produits, équipements et matériaux présents,</li>
            <li>leur quantification et leur devenir prévisionnel,</li>
            <li>l’identification des potentiels de réemploi,</li>
            <li>la prise en compte des risques et contraintes sanitaires et structurelles.</li>
          </ul>
        </div>
        <br />

        <p>
          Depuis fin 2025, la réalisation du diagnostic PEMD s’appuie également sur la norme AFNOR
          XP X46-039, qui définit le cadre méthodologique, le contenu de la mission et la structure
          des livrables, garantissant une approche homogène, fiable et conforme aux exigences
          réglementaires et opérationnelles. Le diagnostic PEMD intègre notamment les diagnostics et
          investigations suivants :
        </p>
        <br />

        <ul class={stylex.attrs(styles.ul).class}>
          <li>Diagnostic amiante</li>
          <li>Diagnostic plomb</li>
          <li>Diagnostic termites</li>
        </ul>
        <br />

        <p>
          Dépollution Conseil vous accompagne dans la réalisation complète de votre diagnostic PEMD
          grâce à l’utilisation d’une solution innovante et numérique, permettant :
        </p>
        <br />

        <ul class={stylex.attrs(styles.ul).class}>
          <li>une collecte terrain optimisée,</li>
          <li>une traçabilité renforcée des données,</li>
          <li>une exploitation facilitée pour la maîtrise d’ouvrage et les entreprises,</li>
          <li>une intégration directe dans les démarches d’économie circulaire et de réemploi.</li>
        </ul>
        <br />

        <!-- Contact Info -->
        <div class={stylex.attrs(styles.div12).class}>
          <div class={stylex.attrs(styles.div13).class}>
            <h5 class={stylex.attrs(styles.h5).class}>Dépollution Conseil</h5>
          </div>
          <div class={stylex.attrs(styles.div13).class}>
            <h5 class={stylex.attrs(styles.h5).class}>06 31 32 67 15</h5>
            <p class={stylex.attrs(styles.p3).class}>Vous pouvez nous poser des questions</p>
          </div>
        </div>
      </div>

      <!-- Image -->
      <div class={stylex.attrs(styles.div14).class}>
        <div class={stylex.attrs(styles.div15).class}>
          <img src={logoPEMD} alt="PEMD 360" class={stylex.attrs(styles.img).class} />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class={stylex.attrs(styles.section3).class}>
  <div class={stylex.attrs(styles.div16).class}>
    <div class={stylex.attrs(styles.div17).class}>
      <div>
        <h2 class={stylex.attrs(styles.h22).class}>Nous vous guidons au mieux</h2>
        <p class={stylex.attrs(styles.p4).class}>
          Pour tous vos projets de démolition ou de rénovation significative, nous pouvons répondre
          à vos besoins.
        </p>
      </div>
      <a href="/contact" class={stylex.attrs(ui.button, ui.buttonSecondary).class}>
        Demander un devis
      </a>
    </div>
  </div>
</section>

<!-- Why Us Section -->
<section id="services" class={stylex.attrs(styles.section2).class}>
  <div class={stylex.attrs(styles.div16).class}>
    <div class={stylex.attrs(styles.div18).class}>
      <span class={stylex.attrs(styles.span).class}> POURQUOI DÉPOLLUTION CONSEIL ? </span>
      <h2 class={stylex.attrs(styles.h23).class}>
        Nous révolutionnons les anciennes méthodes de travail
      </h2>

      <ol class={stylex.attrs(styles.ol).class}>
        {#each [{ num: "01", title: "Digitalisation de vos chantiers", desc: "A l'aide d'une caméra 3D, nous digitalisons vos chantiers pour leur créer un jumeau numérique" }, { num: "02", title: "Centralisation de vos données", desc: "Nous regroupons l'ensemble de vos données sur notre plateforme afin de vous en faciliter l'accès" }, { num: "03", title: "Collaboration entre partenaires", desc: "Vous avez un accès facile à notre réseau de partenaires pour une collaboration optimale" }, { num: "04", title: "Réduction de vos coûts", desc: "Réduisez vos coûts grâce à notre solution digitale" }] as item (item.num)}
          <li class={stylex.attrs(styles.stackSpacing2, styles.li).class}>
            <div class={stylex.attrs(styles.div19).class}>
              {item.num}
            </div>
            <div>
              <h5 class={stylex.attrs(styles.h52).class}>{item.title}</h5>
              <p>{item.desc}</p>
            </div>
          </li>
        {/each}
      </ol>
    </div>
  </div>
</section>

<!-- Video/CTA Section -->
<section
  class={stylex.attrs(styles.section4).class}
  style="background-image: url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80&auto=format&fit=crop')"
>
  <div class={stylex.attrs(styles.div3).class}></div>
  <div class={stylex.attrs(styles.div20).class}>
    <div class={stylex.attrs(styles.div21).class}>
      <!-- Play Button -->
      <a
        href="https://www.youtube.com/watch?v=JZrKEvf6SVY"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Regarder la vidéo"
        class={stylex.attrs(styles.a2).class}
      >
        <Play class={stylex.attrs(styles.Play).class} />
      </a>

      <span class={stylex.attrs(styles.span2).class}> NOUS FAISONS LA DIFFÉRENCE </span>
      <h2 class={stylex.attrs(styles.h24).class}>
        La meilleure solution pour réaliser votre diagnostic
      </h2>
      <a href="#pemd" class={stylex.attrs(ui.button, ui.buttonSecondary).class}> En savoir plus </a>
    </div>
  </div>
</section>
