import { error, fail, type ActionFailure } from "@sveltejs/kit";
import { isApplicationError, safeErrorMessage } from "$lib/effect/errors";
import type { BoundaryDefect, BoundaryFailure, BoundaryResult, BoundarySuccess } from "./runtime";

export type ActionErrorKey = "message" | "error";
export type ActionFailureData = Readonly<
  Record<string, string | number | boolean | null | string[]>
>;

export function isBoundarySuccess<A, E>(
  result: BoundaryResult<A, E>,
): result is BoundarySuccess<A> {
  return result._tag === "success";
}

export function isBoundaryFailure<A, E>(
  result: BoundaryResult<A, E>,
): result is BoundaryFailure<E> {
  return result._tag === "failure";
}

export function actionFailure<E>(
  result: BoundaryResult<unknown, E>,
  key: ActionErrorKey = "message",
  fallback = "Une erreur inattendue est survenue",
  data?: ActionFailureData,
): ActionFailure<{
  message?: string;
  error?: string;
  data?: ActionFailureData;
  success?: boolean;
}> {
  const makeFailure = (status: number, message: string) => {
    const payload: {
      message?: string;
      error?: string;
      data?: ActionFailureData;
      success?: boolean;
    } = {
      [key]: message,
      success: false,
    };
    if (data) payload.data = data;
    return fail(status, payload);
  };

  if (result._tag === "defect") {
    logDefect(result);
    return makeFailure(500, fallback);
  }

  if (result._tag === "failure") {
    const applicationError = result.error as unknown;
    const status = statusForError(applicationError);
    const message = isIntegrationError(applicationError)
      ? fallback
      : safeErrorMessage(applicationError, fallback);
    return makeFailure(status, message);
  }

  return makeFailure(500, fallback);
}

export function responseFailure(
  result: BoundaryResult<unknown, unknown>,
  fallback = "Une erreur inattendue est survenue",
): Response {
  if (result._tag === "defect") {
    logDefect(result);
    return new Response(fallback, { status: 500 });
  }

  if (result._tag === "failure") {
    const message = isIntegrationError(result.error)
      ? fallback
      : safeErrorMessage(result.error, fallback);
    return new Response(message, {
      status: statusForError(result.error),
    });
  }

  return new Response(fallback, { status: 500 });
}

export function errorFailure(result: BoundaryResult<unknown, unknown>): never {
  if (result._tag === "defect") {
    logDefect(result);
    throw error(500, "Une erreur inattendue est survenue");
  }

  if (result._tag === "failure") {
    throw error(statusForError(result.error), safeErrorMessage(result.error));
  }

  throw error(500, "Une erreur inattendue est survenue");
}

function statusForError(value: unknown): number {
  if (!isApplicationError(value)) return 500;

  switch (value._tag) {
    case "UnauthenticatedError":
      return 401;
    case "ForbiddenError":
      return 403;
    case "NotFoundError":
      return 404;
    case "ValidationError":
      return 400;
    case "DatabaseError":
    case "StorageError":
    case "EmailError":
    case "AuthenticationProviderError":
    case "ReportGenerationError":
    case "MatterportError":
      return 500;
    case "AdminAlreadyExistsError":
      return 409;
  }
}

function logDefect(result: BoundaryDefect) {
  console.error("Unexpected Effect defect at SvelteKit boundary:", result.cause);
}

function isIntegrationError(value: unknown): boolean {
  return (
    isApplicationError(value) &&
    [
      "DatabaseError",
      "StorageError",
      "EmailError",
      "AuthenticationProviderError",
      "ReportGenerationError",
      "MatterportError",
    ].includes(value._tag)
  );
}
