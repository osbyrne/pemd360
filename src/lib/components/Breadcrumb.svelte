<script lang="ts">
	import ChevronRight from 'lucide-svelte/icons/chevron-right';

	interface BreadcrumbItem {
		label: string;
		href?: string;
	}

	let { items }: { items: BreadcrumbItem[] } = $props();
</script>

<nav aria-label="Breadcrumb" class="mb-6">
	<ol class="flex items-center space-x-2 text-sm text-gray-500">
		{#each items as item, i}
			{#if i > 0}
				<li class="flex items-center">
					<ChevronRight class="h-4 w-4 text-gray-400" />
				</li>
			{/if}
			<li>
				{#if item.href}
					<a href={item.href} class="hover:text-gray-700">{item.label}</a>
				{:else}
					<span class="font-medium text-gray-900">{item.label}</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
