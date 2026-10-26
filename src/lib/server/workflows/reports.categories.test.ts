import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { Effect } from "effect";
import type { CerfaPdfData } from "$lib/server/cerfa";
import * as schema from "$lib/server/db/schema";
import type { AppDatabase } from "$lib/server/db/factory";
import { Database, makeDatabaseService } from "$lib/server/services/database";
import { Report, makeReportService } from "$lib/server/services/report";
import { generateCerfaPdfReport } from "$lib/server/workflows/reports";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("CERFA report category query", () => {
  let client: Client;
  let db: AppDatabase;
  const output = new Uint8Array([1, 2, 3]);
  const template = new Uint8Array([4, 5, 6]);
  const renderCerfaPdf = vi.fn<
    (data: CerfaPdfData, template: ArrayBuffer | Uint8Array) => Promise<Uint8Array>
  >(async () => output);

  beforeEach(async () => {
    renderCerfaPdf.mockClear();
    client = createClient({ url: ":memory:" });
    db = drizzle(client, { schema });
    // Query fixtures omit constraints so legacy dangling object references can be exercised.
    for (const table of [
      schema.projet,
      schema.userProjet,
      schema.cerfaDiagnostic,
      schema.cerfaDiagnostiqueur,
      schema.cerfaMtrOuvrage,
      schema.cerfaOperation,
      schema.pemd,
      schema.objets,
      schema.natureV2,
      schema.categorieV2,
      schema.groupe,
    ]) {
      const { name, columns } = getTableConfig(table);
      await client.execute(
        `CREATE TABLE "${name}" (${columns.map((column) => `"${column.name}" ${column.getSQLType()}`).join(", ")})`,
      );
    }
    await client.execute("INSERT INTO projet (id) VALUES ('project-1'), ('project-2')");
    await db.insert(schema.userProjet).values({ userId: "member", projetId: "project-1" });
    await db.insert(schema.groupe).values([
      { id: 1, groupe: "Menuiseries" },
      { id: 2, groupe: "Équipements" },
      { id: 3, groupe: "Famille de la nature sans rapport" },
    ]);
    await db.insert(schema.categorieV2).values([
      { id: 10, groupeId: 1, categoriev2: "Portes" },
      { id: 20, groupeId: 2, categoriev2: "Sanitaires" },
      { id: 90, groupeId: 3, categoriev2: "Catégorie de la nature sans rapport" },
    ]);
    await db.insert(schema.natureV2).values({
      id: 90,
      nature: "Bois traité",
      codeDechet: 170201,
      recyclable: 0,
      nonValorisation: 1,
    });
    await db.insert(schema.objets).values([
      { id: 100, categorieId: 10, objet: "Porte intérieure" },
      { id: 200, categorieId: 20, objet: "Lavabo" },
    ]);
  });

  afterEach(() => client.close());

  function insertPemd(
    values: Pick<typeof schema.pemd.$inferInsert, "id" | "objetId" | "natureId"> &
      Partial<typeof schema.pemd.$inferInsert>,
  ) {
    return db.insert(schema.pemd).values({
      sidId: "project-1",
      anchorPosition: "{}",
      stemVector: "{}",
      ...values,
    });
  }

  function run() {
    return Effect.runPromise(
      generateCerfaPdfReport({
        projectId: "project-1",
        templateBuffer: template,
        user: { id: "member", role: "user" },
      }).pipe(
        Effect.provideService(
          Database,
          makeDatabaseService(() => db),
        ),
        Effect.provideService(Report, makeReportService({ renderCerfaPdf })),
      ),
    );
  }

  it("uses each object's category and family, independently of nature IDs, for a project member", async () => {
    await insertPemd({ id: "door", objetId: 100, natureId: 90 });
    await insertPemd({ id: "basin", objetId: 200, natureId: 10 });
    await insertPemd({ id: "no-nature", objetId: 100, natureId: null });
    await insertPemd({ id: "other-project", objetId: 200, natureId: 90, sidId: "project-2" });

    await run();
    const rows = renderCerfaPdf.mock.calls[0]![0].pemdList;
    expect(rows).toHaveLength(3);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "door",
          categorie: "Portes",
          famille: "Menuiseries",
          codeDechet: 170201,
          recyclable: 0,
          nonValorisation: 1,
        }),
        expect.objectContaining({ id: "basin", categorie: "Sanitaires", famille: "Équipements" }),
        expect.objectContaining({ id: "no-nature", categorie: "Portes", famille: "Menuiseries" }),
      ]),
    );
  });

  it("retains rows with null or missing objects without falling back to a nature category", async () => {
    await insertPemd({ id: "null-object", objetId: null, natureId: 90 });
    await insertPemd({ id: "missing-object", objetId: 999, natureId: 10 });

    await run();
    const rows = renderCerfaPdf.mock.calls[0]![0].pemdList;
    expect(rows).toHaveLength(2);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "null-object", categorie: null, famille: null }),
        expect.objectContaining({ id: "missing-object", categorie: null, famille: null }),
      ]),
    );
  });
});
