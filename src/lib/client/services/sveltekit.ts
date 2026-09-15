import { deserialize } from "$app/forms";
import { Effect } from "effect";
import { AuthenticationProviderError } from "$lib/effect/errors";

export function submitUserProjects(
  userId: string,
  projectIds: readonly string[],
): Effect.Effect<void, AuthenticationProviderError> {
  return Effect.tryPromise({
    try: async () => {
      const formData = new FormData();
      formData.set("userId", userId);
      for (const projectId of projectIds) formData.append("projetIds", projectId);

      const response = await fetch("?/setProjets", { method: "POST", body: formData });
      const result = deserialize(await response.text());
      if (!response.ok || result.type !== "success") {
        const message =
          result.type === "failure" &&
          isRecord(result.data) &&
          typeof result.data.error === "string"
            ? result.data.error
            : "L'affectation des projets a échoué";
        throw new Error(message);
      }
    },
    catch: (cause) =>
      new AuthenticationProviderError({
        message: "L'affectation des projets a échoué",
        operation: "auth.admin.assign-projects",
        cause,
      }),
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
