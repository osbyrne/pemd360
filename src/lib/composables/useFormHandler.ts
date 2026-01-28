/**
 * Svelte 5 composable for handling form results.
 * Use this to DRY up the repeated form result handling pattern across admin pages.
 *
 * Usage:
 * ```ts
 * const { handleFormResult } = useFormHandler(closeModal);
 *
 * // In template:
 * <form use:enhance={handleFormResult} ...>
 * ```
 */
export function useFormHandler(onSuccess?: () => void) {
	function handleFormResult() {
		return async ({
			result,
			update
		}: {
			result: { type: string };
			update: () => Promise<void>;
		}) => {
			if (result.type === 'success') {
				onSuccess?.();
				await update();
			}
		};
	}

	return {
		handleFormResult
	};
}
