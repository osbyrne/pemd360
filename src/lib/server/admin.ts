import { redirect } from "@sveltejs/kit";

/**
 * Framework-only admin guard for page loads.
 *
 * Better Auth admin API calls belong to browser adapters/workflows; keeping this
 * helper limited to parent-load authorization avoids hiding provider promises in
 * a reusable server utility.
 */
export async function requireAdmin(
  parent: () => Promise<{ isAdmin: boolean; [key: string]: unknown }>,
): Promise<void> {
  const { isAdmin } = await parent();
  if (!isAdmin) {
    throw redirect(303, "/app/unauthorized");
  }
}
