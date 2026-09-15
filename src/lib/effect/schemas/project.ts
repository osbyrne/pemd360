import { Schema } from "effect";

const OptionalString = Schema.optional(Schema.String);

export const ProjectIdParam = Schema.Struct({
  id: Schema.String.pipe(Schema.minLength(1)),
});

export const PemdTagForm = Schema.Struct({
  anchorPosition: OptionalString,
  stemVector: OptionalString,
  objetId: OptionalString,
  natureId: OptionalString,
  description: OptionalString,
  quantite: OptionalString,
  etage: OptionalString,
  etat: OptionalString,
  longueur: OptionalString,
  largeur: OptionalString,
  epaisseur: OptionalString,
  potentielReemploi: OptionalString,
});

export const DeletePemdTagForm = Schema.Struct({
  tagId: Schema.optional(Schema.String),
});

export type PemdTagFormInput = Schema.Schema.Type<typeof PemdTagForm>;
