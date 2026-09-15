import { Schema } from "effect";

const OptionalString = Schema.optional(Schema.String);

export const RecordIdForm = Schema.Struct({
  id: OptionalString,
  riskType: OptionalString,
});

export type RecordIdFormInput = Schema.Schema.Type<typeof RecordIdForm>;
