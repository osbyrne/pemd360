import { Context, Effect, Layer } from "effect";
import { DatabaseError } from "$lib/effect/errors";
import { getDatabase, type AppDatabase } from "$lib/server/db/client";

export interface DatabaseService {
  readonly run: <A>(
    operation: string,
    execute: (database: AppDatabase) => PromiseLike<A>,
  ) => Effect.Effect<A, DatabaseError>;
}

export class Database extends Context.Tag("pemd360/Database")<Database, DatabaseService>() {}

export function makeDatabaseService(getClient: () => AppDatabase = getDatabase): DatabaseService {
  return {
    run: (operation, execute) =>
      Effect.try({
        try: getClient,
        catch: (cause) =>
          new DatabaseError({
            message: "La base de données n'est pas disponible",
            operation: `${operation}:connect`,
            cause,
          }),
      }).pipe(
        Effect.flatMap((database) =>
          Effect.tryPromise({
            try: () => execute(database),
            catch: (cause) =>
              new DatabaseError({
                message: "Une erreur de base de données est survenue",
                operation,
                cause,
              }),
          }),
        ),
      ),
  };
}

export const DatabaseLive = Layer.succeed(Database, makeDatabaseService());
