import { Schema } from "effect";

export const RenovationMonth = Schema.String.check(Schema.isPattern(/^\d{4}-(0[1-9]|1[0-2])$/));

export const OperationType = Schema.Literals(["", "demolition", "renovation", "mixte"]);

const operationAliases: Readonly<Record<string, string>> = {
  "Une démolition": "demolition",
  "Une rénovation significative": "renovation",
  "Les deux": "mixte",
};

const previousOperationAliases: Readonly<Record<string, string>> = {
  "Rénovation importante": "renovation",
  "Opération de décontamination": "decontamination",
  "Autre intervention importante": "autre",
  "Aucune opération": "aucune",
  "Ne sait pas": "ne_sait_pas",
};

export function normalizeOperationType(value: string | null | undefined): string {
  const type = value?.trim() ?? "";
  return operationAliases[type] ?? type;
}

export function normalizePreviousOperation(value: string): string {
  return previousOperationAliases[value] ?? value;
}

/** Keep legacy and custom entries instead of throwing or silently discarding them. */
export function storedStringList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed))
      return parsed.filter((item): item is string => typeof item === "string");
    return typeof parsed === "string" ? [parsed] : [value];
  } catch {
    return [value];
  }
}
