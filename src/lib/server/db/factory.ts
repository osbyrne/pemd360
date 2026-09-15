import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

export type AppDatabase = LibSQLDatabase<typeof schema>;

export type DatabaseConfig = {
  readonly url: string;
  readonly authToken: string;
};

export function createDatabase(config: DatabaseConfig): AppDatabase {
  const turso = createClient({
    url: config.url,
    authToken: config.authToken,
  });

  return drizzle(turso, { schema });
}
