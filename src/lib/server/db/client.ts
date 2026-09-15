import { env } from "$env/dynamic/private";
import { createDatabase, type AppDatabase } from "./factory";

export type { AppDatabase, DatabaseConfig } from "./factory";
export { createDatabase } from "./factory";

let cachedDatabase: AppDatabase | undefined;

/** Lazily initialize the shared server database; request-specific data never lives here. */
export function getDatabase(): AppDatabase {
  cachedDatabase ??= createDatabase({
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  return cachedDatabase;
}
