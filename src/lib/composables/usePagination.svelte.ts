/**
 * Svelte 5 composable for managing pagination state and filtering.
 * Use this to DRY up repeated pagination logic across admin pages.
 *
 * Usage:
 * ```ts
 * import { usePagination } from '$lib/composables';
 *
 * const pagination = usePagination(
 *   () => data.list,
 *   (item, q) => item.name?.toLowerCase().includes(q) || item.label?.toLowerCase().includes(q)
 * );
 *
 * // Access: pagination.query, pagination.page, pagination.filteredList, etc.
 * ```
 */

type FilterFn<T> = (item: T, query: string) => boolean;

export function usePagination<T>(
	getItems: () => T[],
	filterFn: FilterFn<T>,
	itemsPerPage: number = 25
) {
	let queryState = $state('');
	let pageState = $state(1);
	const perPage = itemsPerPage;

	const filteredList = $derived.by(() => {
		const items = getItems();
		if (!queryState) return items;
		const q = queryState.toLowerCase();
		return items.filter((item) => filterFn(item, q));
	});

	const totalPages = $derived(Math.ceil(filteredList.length / perPage));
	const displayedList = $derived(
		filteredList.slice((pageState - 1) * perPage, pageState * perPage)
	);

	// Reset to page 1 when current page would be out of bounds
	$effect(() => {
		if (pageState > totalPages && totalPages > 0) {
			pageState = 1;
		}
	});

	function setPage(newPage: number) {
		pageState = Math.max(1, Math.min(newPage, totalPages || 1));
	}

	function setQuery(newQuery: string) {
		queryState = newQuery;
		pageState = 1; // Reset to first page on search
	}

	return {
		get query() {
			return queryState;
		},
		set query(value: string) {
			// Reset to page 1 when query changes
			queryState = value;
			pageState = 1;
		},
		get page() {
			return pageState;
		},
		set page(value: number) {
			// Clamp to valid bounds
			pageState = Math.max(1, Math.min(value, totalPages || 1));
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
