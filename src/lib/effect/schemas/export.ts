import { Effect } from "effect";
import { ValidationError } from "$lib/effect/errors";

export function parseExportProjectId(
  projectId: string | null,
): Effect.Effect<string | null, ValidationError> {
  const normalized = projectId?.trim();
  return normalized ? Effect.succeed(normalized) : Effect.succeed(null);
}

export function requireExportProjectId(
  projectId: string | null,
): Effect.Effect<string, ValidationError> {
  return parseExportProjectId(projectId).pipe(
    Effect.flatMap((normalized) =>
      normalized
        ? Effect.succeed(normalized)
        : Effect.fail(new ValidationError({ message: "Project ID required" })),
    ),
  );
}
