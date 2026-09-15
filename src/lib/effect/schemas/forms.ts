import { Either, Effect, ParseResult, Schema } from "effect";
import { ValidationError } from "../errors";

export type FormSchema<A, I = unknown> = Schema.Schema<A, I, never>;

/** Preserve repeated form fields as arrays and reject File values through the schema. */
export function formDataToRecord(formData: FormData): Record<string, unknown> {
  const entries = new Map<string, unknown>();

  for (const [key, value] of formData.entries()) {
    const previous = entries.get(key);
    if (previous === undefined) {
      entries.set(key, value);
    } else if (Array.isArray(previous)) {
      entries.set(key, [...previous, value]);
    } else {
      entries.set(key, [previous, value]);
    }
  }

  return Object.fromEntries(entries);
}

/** A safe, serializable snapshot for SvelteKit action failures. */
export function formDataForFailure(formData: FormData): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const previous = result[key];
    if (previous === undefined) {
      result[key] = value;
    } else if (Array.isArray(previous)) {
      result[key] = [...previous, value];
    } else {
      result[key] = [previous, value];
    }
  }

  return result;
}

export function decodeFormData<A, I>(schema: FormSchema<A, I>, formData: FormData) {
  return decodeFormRecord(schema, formDataToRecord(formData));
}

export function decodeFormRecord<A, I>(
  schema: FormSchema<A, I>,
  input: unknown,
): Effect.Effect<A, ValidationError> {
  return Effect.sync(() => Schema.decodeUnknownEither(schema)(input)).pipe(
    Effect.flatMap((result) => {
      if (Either.isRight(result)) {
        return Effect.succeed(result.right);
      }

      return Effect.fail(
        new ValidationError({
          message: formatParseError(result.left),
        }),
      );
    }),
  );
}

function formatParseError(error: ParseResult.ParseError): string {
  try {
    return ParseResult.TreeFormatter.formatErrorSync(error);
  } catch {
    return "Données invalides";
  }
}

export function requiredString(
  value: string | undefined,
  message: string,
): Effect.Effect<string, ValidationError> {
  return value && value.trim().length > 0
    ? Effect.succeed(value)
    : Effect.fail(new ValidationError({ message }));
}

export function optionalNumber(
  value: string | undefined,
  message: string,
): Effect.Effect<number | null, ValidationError> {
  if (!value) return Effect.succeed(null);

  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Effect.succeed(parsed)
    : Effect.fail(new ValidationError({ message }));
}

export function optionalInteger(
  value: string | undefined,
  message: string,
): Effect.Effect<number | null, ValidationError> {
  if (!value) return Effect.succeed(null);

  const parsed = Number(value);
  return Number.isInteger(parsed)
    ? Effect.succeed(parsed)
    : Effect.fail(new ValidationError({ message }));
}

export function requiredFormString(
  formData: FormData,
  field: string,
  message: string,
): Effect.Effect<string, ValidationError> {
  const value = formData.get(field);
  if (typeof value !== "string" || value.trim().length === 0) {
    return Effect.fail(new ValidationError({ message }));
  }

  return Effect.succeed(value);
}

export function formId(
  formData: FormData,
  field: string,
  idType: "number" | "string",
  message: string,
): Effect.Effect<number | string, ValidationError> {
  const value = formData.get(field);
  if (typeof value !== "string" || value.length === 0) {
    return Effect.fail(new ValidationError({ message }));
  }

  if (idType === "string") return Effect.succeed(value);

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed !== 0
    ? Effect.succeed(parsed)
    : Effect.fail(new ValidationError({ message }));
}
