import { Context, Effect, Layer } from "effect";
import { retryTransientRead } from "$lib/server/effect/transient-read";
import { DatabaseError } from "$lib/effect/errors";
import { getDatabase, type AppDatabase } from "$lib/server/db/client";

export interface DatabaseService {
  readonly read: <A>(
    operation: string,
    execute: (database: AppDatabase) => PromiseLike<A>,
  ) => Effect.Effect<A, DatabaseError>;
  readonly run: <A>(
    operation: string,
    execute: (database: AppDatabase) => PromiseLike<A>,
  ) => Effect.Effect<A, DatabaseError>;
}

export class Database extends Context.Service<Database, DatabaseService>()("pemd360/Database") {}

export function makeDatabaseService(getClient: () => AppDatabase = getDatabase): DatabaseService {
  const run: DatabaseService["run"] = (operation, execute) =>
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
    );
  return {
    run,
    read: (operation, execute) =>
      retryTransientRead(run(operation, execute)).pipe(
        Effect.timeoutOrElse({
          duration: "15 seconds",
          orElse: () =>
            Effect.fail(
              new DatabaseError({
                message: "Le délai de lecture de la base de données est dépassé",
                operation,
                cause: new Error("Database read timed out"),
              }),
            ),
        }),
      ),
  };
}

export const DatabaseLive = Layer.succeed(Database, makeDatabaseService());
