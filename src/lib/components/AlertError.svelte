<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { CircleAlert } from "lucide-svelte";

  interface Props {
    message: string;
    class?: string;
  }

  let { message, class: className = "" }: Props = $props();

  const styles = stylex.create({
    div: {
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      borderRadius: ".5rem",
      paddingTop: "1rem",
      paddingRight: "1rem",
      paddingBottom: "1rem",
      paddingLeft: "1rem",
    },
    CircleAlert: {
      marginTop: "0.125rem",
      height: "1.25rem",
      width: "1.25rem",
      flexShrink: 0,
    },
    span: {
      fontSize: ".875rem",
      lineHeight: "1.25rem",
    },
  });
</script>

<div class={[stylex.attrs(styles.div).class, className]} role="alert">
  <CircleAlert class={stylex.attrs(styles.CircleAlert).class} aria-hidden="true" />
  <span class={stylex.attrs(styles.span).class}>{message}</span>
</div>
