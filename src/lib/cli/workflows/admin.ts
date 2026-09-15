import { Effect } from "effect";
import {
  AdminAlreadyExistsError,
  AuthenticationProviderError,
  DatabaseError,
} from "../../effect/errors";
import { AdminDatabase } from "../services/database";
import { AdminAuthentication, type AdminUserInput } from "../services/authentication";

export type CreateAdminResult = { readonly email: string };

export function createAdmin(
  input: AdminUserInput,
): Effect.Effect<
  CreateAdminResult,
  AdminAlreadyExistsError | DatabaseError | AuthenticationProviderError,
  AdminDatabase | AdminAuthentication
> {
  return Effect.gen(function* () {
    const database = yield* AdminDatabase;
    const authentication = yield* AdminAuthentication;

    return yield* database.transaction((transaction) =>
      Effect.gen(function* () {
        const existing = yield* database.findUserByEmail(transaction, input.email);
        if (existing.length > 0) {
          return yield* Effect.fail(
            new AdminAlreadyExistsError({
              message: `An account already exists for ${input.email}; it was not modified`,
            }),
          );
        }
        return yield* authentication.createUser(transaction, input);
      }),
    );
  });
}
