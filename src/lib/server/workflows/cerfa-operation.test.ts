import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { Effect } from "effect";
import {
  normalizeOperationType,
  normalizePreviousOperation,
  storedStringList,
} from "$lib/cerfa/operation";
import * as schema from "$lib/server/db/schema";
import { Database, makeDatabaseService } from "$lib/server/services/database";
import { loadOperation, saveOperation } from "./cerfa";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("CERFA operation save round-trip", () => {
  let client: Client;
  let database: ReturnType<typeof makeDatabaseService>;
  const user = { id: "admin", role: "admin" };

  beforeEach(async () => {
    client = createClient({ url: ":memory:" });
    const db = drizzle(client, { schema });
    database = makeDatabaseService(() => db);
    for (const table of [schema.projet, schema.cerfaOperation]) {
      const { name, columns } = getTableConfig(table);
      await client.execute(
        `CREATE TABLE "${name}" (${columns
          .filter((c) => c.name !== "date_renovation")
          .map((c) => `"${c.name}" ${c.getSQLType()}`)
          .join(", ")})`,
      );
    }
    await client.execute("INSERT INTO projet (id) VALUES ('project-1')");
    await client.execute({
      sql: "INSERT INTO cerfa_operation (id, projet_id, operation, typologie_bat, operation_soumis) VALUES (?, ?, ?, ?, ?)",
      args: [
        1,
        "project-1",
        "Une rénovation significative",
        JSON.stringify(["Bureaux", "Atelier spécifique"]),
        JSON.stringify(["Rénovation importante", "Opération de décontamination"]),
      ],
    });
    await client.execute(await readFile("drizzle/0005_cerfa_renovation_date.sql", "utf8"));
  });
  afterEach(() => client.close());

  const run = <A, E>(effect: Effect.Effect<A, E, Database>) =>
    Effect.runPromise(effect.pipe(Effect.provideService(Database, database)));

  it("keeps legacy operation and prior-work selections when the form is opened and saved", async () => {
    const stored = (await run(loadOperation("project-1", user)))!;
    expect(stored.dateRenovation).toBeNull();
    const form = new FormData();
    form.set("operation", normalizeOperationType(stored.operation));
    for (const value of storedStringList(stored.typologieBat)) form.append("typologies", value);
    for (const value of storedStringList(stored.operationSoumis)) {
      form.append("operationsSoumis", normalizePreviousOperation(value));
    }
    form.set("dateRenovation", "2022-06");
    await run(saveOperation("project-1", form, user));
    const saved = (await run(loadOperation("project-1", user)))!;
    expect(saved.operation).toBe("renovation");
    expect(saved.dateRenovation).toBe("2022-06");
    expect(JSON.parse(saved.operationSoumis!)).toEqual(["renovation", "decontamination"]);
    expect(JSON.parse(saved.typologieBat!)).toEqual(["Bureaux", "Atelier spécifique"]);
  });

  it("rejects an unrecognized operation without overwriting the saved record", async () => {
    const form = new FormData();
    form.set("operation", "unrecognized");
    const result = await run(saveOperation("project-1", form, user).pipe(Effect.result));
    expect(result).toMatchObject({ _tag: "Failure", failure: { _tag: "ValidationError" } });
    expect((await run(loadOperation("project-1", user)))?.operation).toBe(
      "Une rénovation significative",
    );
  });
  it("rejects invalid renovation months and impossible dates before writing", async () => {
    for (const values of [
      { dateRenovation: "2022-13" },
      { dateDebut: "2026-02-30" },
      { surfaceRenover: "-1" },
      { nbBatRenovation: "1.5" },
      { dateDebut: "2026-06-01", dateFin: "2026-05-01" },
    ]) {
      const form = new FormData();
      form.set("operation", "renovation");
      form.set("operationsSoumis", "renovation");
      for (const [key, value] of Object.entries(values)) form.set(key, value);
      expect(await run(saveOperation("project-1", form, user).pipe(Effect.result))).toMatchObject({
        _tag: "Failure",
        failure: { _tag: "ValidationError" },
      });
    }
    expect((await run(loadOperation("project-1", user)))?.operation).toBe(
      "Une rénovation significative",
    );
  });
});
