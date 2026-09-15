import { isBoundarySuccess } from "$lib/server/effect/sveltekit";
import { runServerEffect } from "$lib/server/effect/runtime";
import { loadPlaygroundImage } from "$lib/server/workflows/storage";

export async function load() {
  const result = await runServerEffect(loadPlaygroundImage());
  if (!isBoundarySuccess(result)) {
    if (result._tag === "defect")
      console.error("Unexpected playground storage defect:", result.cause);
    else console.error("Playground storage failure:", result.error.cause);
    return {
      imageUrl: null,
      imageKey: null,
      error: "Le stockage des images est indisponible",
    };
  }
  return result.value;
}
