<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	interface Tab {
		href: string;
		label: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		actions
	}: Props = $props();

	const currentPath = $derived($page.url.pathname);

	function buildHref(baseHref: string): string {
		if (!preserveQueryParams) return baseHref;
		const queryString = $page.url.searchParams.toString();
		return queryString ? `${baseHref}?${queryString}` : baseHref;
	}
</script>

<div class="border-b border-gray-200 mb-6 -mx-6 px-6 bg-white sticky top-0 z-10">
	<div class="flex justify-between items-center">
		<nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
			{#each tabs as tab}
				{@const isActive = currentPath.includes(tab.href)}
				<a
					href={buildHref(tab.href)}
					class="
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    {isActive
						? 'border-emerald-500 text-emerald-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                "
					aria-current={isActive ? 'page' : undefined}
				>
					<tab.icon
						class="
                        -ml-0.5 mr-2 h-4 w-4 
                        {isActive
							? useTabColorWhenActive && tab.color
								? tab.color
								: 'text-emerald-500'
							: 'text-gray-400 group-hover:text-gray-500'}
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
