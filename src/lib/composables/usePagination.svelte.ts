/**
 * Svelte 5 composable for managing pagination state and filtering.
 * Use this to DRY up repeated pagination logic across admin pages.
 *
 * Usage:
 * ```ts
 * const { query, page, perPage, filteredList, totalPages, displayedList } = usePagination(
 *   () => data.list,
 *   (item, q) => item.name?.toLowerCase().includes(q) || item.label?.toLowerCase().includes(q)
 * );
 * ```
 */

type FilterFn<T> = (item: T, query: string) => boolean;

export function usePagination<T>(
	getItems: () => T[],
	filterFn: FilterFn<T>,
	itemsPerPage: number = 25
) {
	let query = $state('');
	let page = $state(1);
	const perPage = itemsPerPage;

	const filteredList = $derived.by(() => {
		const items = getItems();
		if (!query) return items;
		const q = query.toLowerCase();
		return items.filter((item) => filterFn(item, q));
	});

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(filteredList.slice((page - 1) * perPage, page * perPage));

	// Reset to page 1 when query changes and current page would be out of bounds
	$effect(() => {
		if (page > totalPages && totalPages > 0) {
			page = 1;
		}
	});

	function setPage(newPage: number) {
		page = Math.max(1, Math.min(newPage, totalPages || 1));
	}

	function setQuery(newQuery: string) {
		query = newQuery;
		page = 1; // Reset to first page on search
	}

	return {
		get query() {
			return query;
		},
		set query(value: string) {
			query = value;
		},
		get page() {
			return page;
		},
		set page(value: number) {
			page = value;
		},
		perPage,
		get filteredList() {
			return filteredList;
		},
		get totalPages() {
			return totalPages;
		},
		get displayedList() {
			return displayedList;
		},
		setPage,
		setQuery
	};
}
