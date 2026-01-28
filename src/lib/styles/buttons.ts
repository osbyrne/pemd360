/**
 * Shared Tailwind CSS class strings for consistent styling across the app.
 * Use these to DRY up repeated CSS class strings.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { buttonStyles, cardStyles, tableStyles } from '$lib/styles';
 * </script>
 *
 * <button class={buttonStyles.primary}>Save</button>
 * <button class={buttonStyles.secondary}>Cancel</button>
 * <div class={cardStyles.card}>...</div>
 * ```
 */

export const buttonStyles = {
	/** Primary emerald button - for main actions */
	primary:
		'flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm',

	/** Secondary outline button - for secondary actions */
	secondary:
		'inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm',

	/** Danger button - for destructive actions */
	danger:
		'flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm',

	/** Icon-only action button - for table row actions */
	iconAction:
		'p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors',

	/** Icon-only delete button */
	iconDelete: 'p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors',

	/** Modal cancel button */
	cancel:
		'px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors',

	/** Modal confirm/submit button */
	submit:
		'px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm'
};

/**
 * Shared card/container styles
 */
export const cardStyles = {
	/** Main card container */
	card: 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',

	/** Card with padding */
	cardPadded: 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6'
};

/**
 * Shared table styles
 */
export const tableStyles = {
	/** Table wrapper */
	wrapper: 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',

	/** Table element */
	table: 'w-full text-left text-sm text-gray-600',

	/** Table header */
	thead: 'bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200',

	/** Table header cell */
	th: 'px-6 py-4',

	/** Table body */
	tbody: 'divide-y divide-gray-100',

	/** Table row */
	tr: 'hover:bg-gray-50 transition-colors',

	/** Table cell */
	td: 'px-6 py-4',

	/** Table cell with font-medium */
	tdBold: 'px-6 py-4 font-medium text-gray-900'
};
