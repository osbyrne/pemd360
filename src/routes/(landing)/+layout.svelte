<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import Header from "$lib/components/Header.svelte";
  import Footer from "$lib/components/Footer.svelte";

  let { children, data } = $props();

  const styles = stylex.create({
    div: {
      display: "flex",
      minHeight: "100vh",
      flexDirection: "column",
    },
    main: {
      flex: "1 1 0%",
    },
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.png" />
  <title>PEMD360</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class={stylex.attrs(styles.div).class}>
  <Header user={data.user} />

  <!-- Main Content -->
  <main class={stylex.attrs(styles.main).class}>
    {@render children()}
  </main>

  <Footer />
</div>
