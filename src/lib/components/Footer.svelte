<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { Mail, Phone, MapPin } from "lucide-svelte";

  const styles = stylex.create({
    div: {
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
      paddingTop: "3rem",
      paddingBottom: "3rem",
    },
    div2: {
      display: "grid",
      gap: "2rem",
      gridTemplateColumns: {
        "@media (min-width: 768px)": "repeat(2, minmax(0, 1fr))",
        "@media (min-width: 1024px)": "repeat(3, minmax(0, 1fr))",
      },
    },
    h5: {
      marginBottom: "1rem",
      fontSize: "1.125rem",
      lineHeight: "1.75rem",
      fontWeight: 600,
    },
    ul: {
      "--stack-gap": "0.75rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    a: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(69.6% 0.17 162.48)",
      },
    },
    Mail: {
      height: "1rem",
      width: "1rem",
    },
    a2: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(69.6% 0.17 162.48)",
      },
    },
    MapPin: {
      marginTop: "0.125rem",
      height: "1rem",
      width: "1rem",
    },
    ul2: {
      "--stack-gap": "0.5rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    a3: {
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(69.6% 0.17 162.48)",
      },
    },
    div3: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
    },
    a4: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      transitionProperty:
        "color, background-color, border-color, text-decoration-color, fill, stroke",
      transitionDuration: "150ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      color: {
        ":hover": "oklch(69.6% 0.17 162.48)",
      },
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    div4: {
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      borderColor: "oklch(27.8% 0.033 256.848)",
      paddingTop: "1rem",
      paddingBottom: "1rem",
    },
    div5: {
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
      textAlign: "center",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
    stackSpacing075: { marginBlockEnd: { default: "0.75rem", ":last-child": 0 } },
    stackSpacing05: { marginBlockEnd: { default: "0.5rem", ":last-child": 0 } },
  });
</script>

<footer>
  <div class={stylex.attrs(styles.div).class}>
    <div class={stylex.attrs(styles.div2).class}>
      <!-- Contact -->
      <div>
        <h5 class={stylex.attrs(styles.h5).class}>Contact</h5>
        <ul class={stylex.attrs(styles.ul).class}>
          <li class={stylex.attrs(styles.stackSpacing075).class}>
            <a
              href="mailto:florent.mouriot@depollution-conseil.fr"
              class={stylex.attrs(styles.a).class}
            >
              <Mail class={stylex.attrs(styles.Mail).class} />
              <span>florent.mouriot@depollution-conseil.fr</span>
            </a>
          </li>
          <li class={stylex.attrs(styles.stackSpacing075).class}>
            <a href="tel:+33631326715" class={stylex.attrs(styles.a).class}>
              <Phone class={stylex.attrs(styles.Mail).class} />
              <span>06 31 32 67 15</span>
            </a>
          </li>
          <li class={stylex.attrs(styles.stackSpacing075).class}>
            <a
              href="https://maps.google.com/?q=7+rue+Montespan+91000+Évry-Courcouronnes"
              target="_blank"
              rel="noopener noreferrer"
              class={stylex.attrs(styles.a2).class}
            >
              <MapPin class={stylex.attrs(styles.MapPin).class} />
              <span>7 rue Montespan 91000, Évry-Courcouronnes</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Liens utiles -->
      <div>
        <h5 class={stylex.attrs(styles.h5).class}>Liens utiles</h5>
        <ul class={stylex.attrs(styles.ul2).class}>
          <li class={stylex.attrs(styles.stackSpacing05).class}>
            <a href="/" class={stylex.attrs(styles.a3).class}>Accueil</a>
          </li>
          <li class={stylex.attrs(styles.stackSpacing05).class}>
            <a href="/about" class={stylex.attrs(styles.a3).class}>À propos</a>
          </li>
          <li class={stylex.attrs(styles.stackSpacing05).class}>
            <a href="/contact" class={stylex.attrs(styles.a3).class}>Contact</a>
          </li>
          <li class={stylex.attrs(styles.stackSpacing05).class}>
            <a href="/mentions" class={stylex.attrs(styles.a3).class}>Mentions légales</a>
          </li>
        </ul>
      </div>

      <!-- Réseaux sociaux -->
      <div>
        <h5 class={stylex.attrs(styles.h5).class}>Réseaux sociaux</h5>
        <div class={stylex.attrs(styles.div3).class}>
          <a
            href="https://fr.linkedin.com/company/depollution-conseil"
            target="_blank"
            rel="noopener noreferrer"
            class={stylex.attrs(styles.a4).class}
          >
            <span class={stylex.attrs(styles.span).class}>LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Copyright -->
  <div class={stylex.attrs(styles.div4).class}>
    <div class={stylex.attrs(styles.div5).class}>
      © {new Date().getFullYear()} PEMD 360 - Dépollution Conseil. Tous droits réservés.
    </div>
  </div>
</footer>
