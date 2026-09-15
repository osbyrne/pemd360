import { Schema } from "effect";

const OptionalString = Schema.optional(Schema.String);
const StringOrStringArray = Schema.Union(Schema.String, Schema.Array(Schema.String));

export const DiagnostiqueurForm = Schema.Struct({
  typePersonne: OptionalString,
  adresse: OptionalString,
  cp: OptionalString,
  commune: OptionalString,
  nom: OptionalString,
  prenom: OptionalString,
  raisonSociale: OptionalString,
  siretSiren: OptionalString,
  engagementAssurance: OptionalString,
  nomAssurance: OptionalString,
  numeroPolice: OptionalString,
  dateDebutAssurance: OptionalString,
  dateFinAssurance: OptionalString,
  competences: OptionalString,
});

export const MaitreOuvrageForm = Schema.Struct({
  typePersonne: OptionalString,
  adresse: OptionalString,
  cp: OptionalString,
  commune: OptionalString,
  nom: OptionalString,
  prenom: OptionalString,
  raisonSociale: OptionalString,
  siretSiren: OptionalString,
});

export const DiagnosticForm = Schema.Struct({
  derniereVisite: OptionalString,
  batVisite: OptionalString,
  batNonVisite: OptionalString,
  raisonsNePasVisite: OptionalString,
  desordres: OptionalString,
  precaution: OptionalString,
  documentsConsultes: Schema.optional(StringOrStringArray),
});

export const OperationForm = Schema.Struct({
  adresse: OptionalString,
  cp: OptionalString,
  commune: OptionalString,
  dateDebut: OptionalString,
  dateFin: OptionalString,
  operation: OptionalString,
  nbBatDemolition: OptionalString,
  surfaceDemolir: OptionalString,
  nbBatRenovation: OptionalString,
  surfaceRenover: OptionalString,
  typologies: Schema.optional(StringOrStringArray),
  datePermis: OptionalString,
  operationsSoumis: Schema.optional(StringOrStringArray),
});

export type DiagnostiqueurFormInput = Schema.Schema.Type<typeof DiagnostiqueurForm>;
export type MaitreOuvrageFormInput = Schema.Schema.Type<typeof MaitreOuvrageForm>;
export type DiagnosticFormInput = Schema.Schema.Type<typeof DiagnosticForm>;
export type OperationFormInput = Schema.Schema.Type<typeof OperationForm>;
