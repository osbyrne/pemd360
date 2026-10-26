import { Effect, Schedule } from "effect";

const transientCodes = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "FAILED_TO_GET_SESSION",
]);

/** Inspect wrapped integration errors without logging queries or credentials. */
function isTransient(error: unknown): boolean {
  const visited = new Set<unknown>();
  let current = error;
  for (let depth = 0; depth < 8 && current && typeof current === "object"; depth++) {
    if (visited.has(current)) return false;
    visited.add(current);
    const value = current as { code?: unknown; cause?: unknown; body?: { code?: unknown } };
    if (typeof value.code === "string" && transientCodes.has(value.code)) return true;
    if (typeof value.body?.code === "string" && transientCodes.has(value.body.code)) return true;
    current = value.cause;
  }
  return false;
}

/** Only use for idempotent reads; mutation retries can duplicate a completed write. */
export function retryTransientRead<A, E, R>(effect: Effect.Effect<A, E, R>) {
  return effect.pipe(
    Effect.retry({ times: 2, while: isTransient, schedule: Schedule.exponential("100 millis") }),
  );
}
