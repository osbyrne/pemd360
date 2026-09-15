import { Data } from "effect";

export class UnauthenticatedError extends Data.TaggedError("UnauthenticatedError")<{
  readonly message: string;
}> {}

export class ForbiddenError extends Data.TaggedError("ForbiddenError")<{
  readonly message: string;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly message: string;
}> {}

export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly fields?: Readonly<Record<string, string>>;
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
}> {}

export class StorageError extends Data.TaggedError("StorageError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
  readonly notFound?: boolean;
}> {}

export class EmailError extends Data.TaggedError("EmailError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
}> {}

export class AuthenticationProviderError extends Data.TaggedError("AuthenticationProviderError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
}> {}

export class ReportGenerationError extends Data.TaggedError("ReportGenerationError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
}> {}

export class MatterportError extends Data.TaggedError("MatterportError")<{
  readonly message: string;
  readonly operation: string;
  readonly cause: unknown;
}> {}

export class AdminAlreadyExistsError extends Data.TaggedError("AdminAlreadyExistsError")<{
  readonly message: string;
}> {}

export type ApplicationError =
  | UnauthenticatedError
  | ForbiddenError
  | NotFoundError
  | ValidationError
  | DatabaseError
  | StorageError
  | EmailError
  | AuthenticationProviderError
  | ReportGenerationError
  | MatterportError
  | AdminAlreadyExistsError;

export function isApplicationError(value: unknown): value is ApplicationError {
  if (typeof value !== "object" || value === null || !("_tag" in value)) {
    return false;
  }

  const tag = value._tag;
  return (
    tag === "UnauthenticatedError" ||
    tag === "ForbiddenError" ||
    tag === "NotFoundError" ||
    tag === "ValidationError" ||
    tag === "DatabaseError" ||
    tag === "StorageError" ||
    tag === "EmailError" ||
    tag === "AuthenticationProviderError" ||
    tag === "ReportGenerationError" ||
    tag === "MatterportError" ||
    tag === "AdminAlreadyExistsError"
  );
}

export function safeErrorMessage(value: unknown, fallback = "Une erreur inattendue est survenue") {
  return isApplicationError(value) ? value.message : fallback;
}
