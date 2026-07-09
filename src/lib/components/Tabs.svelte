<script lang="ts">
  import { page } from "$app/stores";
  import type { Snippet } from "svelte";

  interface Tab {
    href: string;
    label: string;
    icon: any;
    color?: string;
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
</script>

<div class="sticky top-0 z-10 -mx-6 mb-6 px-6">
  <div class="flex items-center justify-between">
    <nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
      {#each tabs as tab}
        {@const isActive = currentPath.includes(tab.href)}
        <a
          href={buildHref(tab.href)}
          class="
                    group inline-flex items-center px-1 py-4 text-sm font-medium whitespace-nowrap
                    {isActive
            ? 'border-emerald-500 text-emerald-600'
            : 'hover: border-transparent '}
                "
          aria-current={isActive ? "page" : undefined}
        >
          <tab.icon
            class="
                        mr-2 -ml-0.5 h-4 w-4
                        {isActive
              ? useTabColorWhenActive && tab.color
                ? tab.color
                : 'text-emerald-500'
              : ' group-hover:'}
                    "
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
