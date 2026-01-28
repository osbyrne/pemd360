/**
 * Composable for managing admin CRUD modal state.
 * Provides consistent modal behavior across admin pages.
 *
 * @example
 * const modal = useAdminModal<Category>({ id: 0, name: '' });
 *
 * // In template:
 * <button onclick={() => modal.openCreate()}>Add</button>
 * <button onclick={() => modal.openEdit(item)}>Edit</button>
 *
 * {#if modal.isOpen}
 *   <Modal>
 *     <form use:enhance={modal.handleFormResult(update)}>
 *       <input name="name" bind:value={modal.form.name} />
 *     </form>
 *   </Modal>
 * {/if}
 */
export function useAdminModal<T extends Record<string, unknown>>(initialForm: T) {
	let isOpen = $state(false);
	let isEditMode = $state(false);
	let form = $state<T>({ ...initialForm });
	let deleteItem = $state<T | null>(null);
	let isDeleteOpen = $state(false);

	return {
		// Getters
		get isOpen() {
			return isOpen;
		},
		get isEditMode() {
			return isEditMode;
		},
		get form() {
			return form;
		},
		get isDeleteOpen() {
			return isDeleteOpen;
		},
		get deleteItem() {
			return deleteItem;
		},

		// Setters
		setForm(newForm: T) {
			form = { ...newForm };
		},

		// Actions
		openCreate() {
			form = { ...initialForm };
			isEditMode = false;
			isOpen = true;
		},

		openEdit(item: T) {
			form = { ...item };
			isEditMode = true;
			isOpen = true;
		},

		close() {
			isOpen = false;
			form = { ...initialForm };
		},

		openDelete(item: T) {
			deleteItem = item;
			isDeleteOpen = true;
		},

		closeDelete() {
			isDeleteOpen = false;
			deleteItem = null;
		},

		/**
		 * Creates a form result handler for use:enhance
		 * @param updateFn - The update function from use:enhance
		 */
		handleFormResult(updateFn: () => Promise<void>) {
			return async ({
				result
			}: {
				result: { type: string; data?: { success?: boolean } };
			}) => {
				if (result.type === 'success' && result.data?.success) {
					isOpen = false;
					form = { ...initialForm };
					await updateFn();
				} else if (result.type === 'success') {
					// Still a success response, refresh
					await updateFn();
				}
			};
		},

		/**
		 * Creates a delete result handler for use:enhance
		 * @param updateFn - The update function from use:enhance
		 */
		handleDeleteResult(updateFn: () => Promise<void>) {
			return async ({
				result
			}: {
				result: { type: string; data?: { success?: boolean } };
			}) => {
				if (result.type === 'success') {
					isDeleteOpen = false;
					deleteItem = null;
					await updateFn();
				}
			};
		}
	};
}
