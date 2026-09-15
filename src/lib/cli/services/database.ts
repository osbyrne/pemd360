import { Cause, Context, Effect, Exit, Layer } from "effect";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq, type ExtractTablesWithRelations } from "drizzle-orm";
import type { LibSQLTransaction } from "drizzle-orm/libsql";
import { DatabaseError } from "../../effect/errors";
import type { AppDatabase, DatabaseConfig } from "../../server/db/factory";
import * as schema from "../../server/db/schema";

export type AdminTransaction = LibSQLTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export interface AdminDatabaseService {
  readonly findUserByEmail: (
    database: AdminTransaction,
    email: string,
  ) => Effect.Effect<ReadonlyArray<{ readonly id: string }>, DatabaseError>;
  readonly transaction: <A, E>(
    operation: (database: AdminTransaction) => Effect.Effect<A, E>,
  ) => Effect.Effect<A, E | DatabaseError>;
}

export class AdminDatabase extends Context.Tag("pemd360/cli/AdminDatabase")<
  AdminDatabase,
  AdminDatabaseService
>() {}

export function makeAdminDatabaseService(database: AppDatabase): AdminDatabaseService {
  return {
    findUserByEmail: (transaction, email) =>
      Effect.tryPromise({
        try: () =>
          transaction
            .select({ id: schema.user.id })
            .from(schema.user)
            .where(eq(schema.user.email, email))
            .limit(1),
        catch: (cause) =>
          new DatabaseError({
            message: "La base de données n'est pas disponible",
            operation: "cli.admin.find-user",
            cause,
          }),
      }),
    transaction: (operation) => runTransaction(database, operation),
  };
}

export function makeAdminDatabaseLayer(database: AppDatabase): Layer.Layer<AdminDatabase> {
  return Layer.succeed(AdminDatabase, makeAdminDatabaseService(database));
}

export function createCliDatabase(config: DatabaseConfig): {
  readonly database: AppDatabase;
  readonly close: () => void;
} {
  const client = createClient({ url: config.url, authToken: config.authToken });
  return {
    database: drizzle(client, { schema }),
    close: () => client.close(),
  };
}

class TransactionFailure extends Error {
  constructor(readonly failure: Cause.Cause<unknown>) {
    super("The transaction effect failed");
  }
}

function runTransaction<A, E>(
  database: AppDatabase,
  operation: (transaction: AdminTransaction) => Effect.Effect<A, E>,
): Effect.Effect<A, E | DatabaseError> {
  return Effect.async<A, E | DatabaseError>((resume) => {
    void Promise.resolve()
      .then(() =>
        database.transaction(async (transaction) => {
          const exit = await Effect.runPromiseExit(operation(transaction));
          if (Exit.isSuccess(exit)) return exit.value;
          throw new TransactionFailure(exit.cause);
        }),
      )
      .then(
        (value) => resume(Effect.succeed(value)),
        (cause: unknown) => {
          if (cause instanceof TransactionFailure) {
            resume(Effect.failCause(cause.failure as Cause.Cause<E>));
            return;
          }
          resume(
            Effect.fail(
              new DatabaseError({
                message: "Une erreur de base de données est survenue",
                operation: "cli.admin.transaction",
                cause,
              }),
            ),
          );
        },
      );
  });
}
