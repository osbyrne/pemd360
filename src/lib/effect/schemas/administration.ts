import { Schema } from "effect";

const OptionalString = Schema.optional(Schema.String);

export const EstablishmentForm = Schema.Struct({
  nom: OptionalString,
  societeId: OptionalString,
  raisonSocial: OptionalString,
  rue: OptionalString,
  cp: OptionalString,
  ville: OptionalString,
  tel: OptionalString,
  fax: OptionalString,
  email: OptionalString,
  siret: OptionalString,
});

export const ProjectForm = Schema.Struct({
  id: OptionalString,
  libelle: OptionalString,
  reference: OptionalString,
  etablissementId: OptionalString,
  codeInsee: OptionalString,
  rue: OptionalString,
  cp: OptionalString,
  ville: OptionalString,
  dateDemarrage: OptionalString,
  section: OptionalString,
  parcelle: OptionalString,
  typeOperation: OptionalString,
  maitreDOuvrage: OptionalString,
  dateDeFin: OptionalString,
});

export const CompanyForm = Schema.Struct({
  id: OptionalString,
  nom: OptionalString,
  raisonSocial: OptionalString,
  rue: OptionalString,
  cp: OptionalString,
  ville: OptionalString,
  tel: OptionalString,
  fax: OptionalString,
  email: OptionalString,
  siren: OptionalString,
  type: OptionalString,
});

export const UserProjectAssignmentForm = Schema.Struct({
  userId: OptionalString,
});

export type EstablishmentFormInput = typeof EstablishmentForm.Type;
export type ProjectFormInput = typeof ProjectForm.Type;
export type CompanyFormInput = typeof CompanyForm.Type;
