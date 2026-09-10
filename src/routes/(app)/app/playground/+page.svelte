<script lang="ts">
  import { theme } from "../../../../lib/styles/tokens.stylex";
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

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
      paddingTop: "2rem",
      paddingRight: "2rem",
      paddingBottom: "2rem",
      paddingLeft: "2rem",
    },
    h1: {
      marginBottom: "1.5rem",
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontWeight: 700,
    },
    div2: {
      maxWidth: "42rem",
      backgroundColor: theme.base100,
      boxShadow: "0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a",
    },
    figure: {
      paddingInlineStart: "1rem",
      paddingInlineEnd: "1rem",
      paddingTop: "1rem",
    },
    img: {
      width: "100%",
      borderRadius: ".75rem",
    },
    p: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      wordBreak: "break-all",
    },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <h1 class={stylex.attrs(styles.h1).class}>Test Image S3</h1>

  {#if data.imageUrl}
    <div class={stylex.attrs(ui.card, styles.div2).class}>
      <figure class={stylex.attrs(styles.figure).class}>
        <img src={data.imageUrl} alt="Test" class={stylex.attrs(styles.img).class} />
      </figure>
      <div class={stylex.attrs(ui.cardBody).class}>
        <h2 class={stylex.attrs(ui.cardTitle).class}>Image chargée avec succès</h2>
        {#if data.imageKey}
          <p class={stylex.attrs(styles.p).class}>Objet: {data.imageKey}</p>
        {/if}
        <p class={stylex.attrs(styles.p).class}>{data.imageUrl}</p>
      </div>
    </div>
  {:else if data.error}
    <div class={stylex.attrs(ui.alert, ui.alertError).class}>
      <span>Erreur: {data.error}</span>
    </div>
  {:else}
    <div class={stylex.attrs(ui.alert, ui.alertWarning).class}>
      <span>Aucune image disponible</span>
    </div>
  {/if}
</div>
