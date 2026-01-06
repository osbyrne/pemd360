import { redirect } from '@sveltejs/kit';

export function load() {
    redirect(307, '/app/admin/pemd-tableau');
}
