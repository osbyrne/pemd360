<script lang="ts">
  import * as stylex from "@stylexjs/stylex";
  import { ui } from "$lib/styles/ui.stylex";
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";

  interface Tab {
    href: string;
    label: string;
    icon: any;
    color?: stylex.StyleXStyles;
  }

  interface Props {
    tabs: Tab[];
    preserveQueryParams?: boolean;
    useTabColorWhenActive?: boolean;
    actions?: Snippet;
  }

  let {
    tabs,
    preserveQueryParams = true,
    useTabColorWhenActive = false,
    actions,
  }: Props = $props();

  const currentPath = $derived($page.url.pathname);

  function buildHref(baseHref: string): string {
    if (!preserveQueryParams) return baseHref;
    const queryString = $page.url.searchParams.toString();
    return queryString ? `${baseHref}?${queryString}` : baseHref;
  }

  const styles = stylex.create({
    div: {
      position: "sticky",
      top: "0rem",
      zIndex: 10,
      marginInlineStart: "-1.5rem",
      marginInlineEnd: "-1.5rem",
      marginBottom: "1.5rem",
      paddingInlineStart: "1.5rem",
      paddingInlineEnd: "1.5rem",
    },
    div2: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    nav: {
      marginBottom: "-1px",
      display: "flex",
      "--row-gap": "1.5rem",
      overflowX: "auto",
    },
    a: {
      display: "inline-flex",
      alignItems: "center",
      paddingInlineStart: "0.25rem",
      paddingInlineEnd: "0.25rem",
      paddingTop: "1rem",
      paddingBottom: "1rem",
      fontSize: ".875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
      whiteSpace: "nowrap",
    },
    tabicon: {
      marginRight: "0.5rem",
      marginLeft: "-0.125rem",
      height: "1rem",
      width: "1rem",
    },
    rowSpacing15: { marginInlineEnd: { default: "1.5rem", ":last-child": 0 } },
  });
</script>

<div class={stylex.attrs(styles.div).class}>
  <div class={stylex.attrs(styles.div2).class}>
    <nav class={stylex.attrs(styles.nav).class} aria-label="Tabs">
      {#each tabs as tab}
        {@const isActive = currentPath.includes(tab.href)}
        <a
          href={buildHref(tab.href)}
          class={stylex.attrs(
            styles.rowSpacing15,
            styles.a,
            isActive ? [ui.borderEmerald500, ui.textEmerald600] : ui.borderTransparent,
          ).class}
          aria-current={isActive ? "page" : undefined}
        >
          <tab.icon
            class={stylex.attrs(
              styles.tabicon,
              isActive
                ? useTabColorWhenActive && tab.color
                  ? tab.color
                  : ui.textEmerald500
                : false,
            ).class}
          />
          {tab.label}
        </a>
      {/each}
    </nav>

    {#if actions}
      {@render actions()}
    {/if}
  </div>
</div>
