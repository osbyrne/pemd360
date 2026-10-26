import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import ExcelJS from "exceljs";
import { Effect } from "effect";
import { Database, makeDatabaseService } from "$lib/server/services/database";
import { Report, makeReportService } from "$lib/server/services/report";
import * as schema from "$lib/server/db/schema";
import { loadCerfaWaste } from "./cerfa";
import { exportCerfaWaste } from "./exports";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("CERFA waste classification across the page and Excel export", () => {
  let client: Client;
  let database: ReturnType<typeof makeDatabaseService>;
  const input = { projectId: "project-1", user: { id: "admin-1", role: "admin" } };

  beforeEach(async () => {
    // Use a fresh local database and execute the actual workflow queries, including
    // their selected columns, so omitting potentielReemploi in an export also fails.
    client = createClient({ url: "file::memory:" });
    const db = drizzle(client, { schema });
    database = makeDatabaseService(() => db);
    for (const table of [
      schema.projet,
      schema.pemd,
      schema.objets,
      schema.natureV2,
      schema.categorieV2,
    ]) {
      const config = getTableConfig(table);
      await client.execute(
        `CREATE TABLE "${config.name}" (${config.columns
          .map((column) => `"${column.name}" ${column.getSQLType()}`)
          .join(", ")})`,
      );
    }
    await client.execute(
      "INSERT INTO projet (id, libelle, reference) VALUES ('project-1', 'Projet 1', 'P1')",
    );
    await client.execute("INSERT INTO categorie_v2 (id, categoriev2) VALUES (1, 'Bois')");
    await client.execute("INSERT INTO objets (id, categorie_id, objet) VALUES (1, 1, 'Porte')");
    await client.execute(
      "INSERT INTO nature_v2 (id, nature, code_dechet) VALUES (1, 'Bois traité', 170201)",
    );

    const wastePotentials = [null, "0", "Nul", "\t0.", "", " \t ", "unknown"];
    const reusePotentials = ["100", "50", "1", "Fort", "Moyen", "Faible", "\t100", "\t100."];
    await db.insert(schema.pemd).values([
      ...wastePotentials.map((potentielReemploi, index) => ({
        id: `waste-${index}`,
        sidId: "project-1",
        objetId: 1,
        natureId: 1,
        potentielReemploi,
        reemploi: index % 2 === 0 ? null : 0,
        masse: 2,
        volume: 3,
        anchorPosition: "{}",
        stemVector: "{}",
      })),
      ...reusePotentials.map((potentielReemploi, index) => ({
        id: `reuse-${index}`,
        sidId: "project-1",
        objetId: 1,
        natureId: 1,
        potentielReemploi,
        reemploi: index % 2 === 0 ? null : 0,
        masse: 100,
        volume: 100,
        anchorPosition: "{}",
        stemVector: "{}",
      })),
      {
        id: "explicit-reuse",
        sidId: "project-1",
        objetId: 1,
        natureId: 1,
        potentielReemploi: "Nul",
        reemploi: 1,
        masse: 100,
        volume: 100,
        anchorPosition: "{}",
        stemVector: "{}",
      },
      {
        id: "uncategorized-waste",
        sidId: "project-1",
        potentielReemploi: null,
        reemploi: null,
        masse: null,
        volume: null,
        anchorPosition: "{}",
        stemVector: "{}",
      },
      {
        id: "other-project-waste",
        sidId: "project-2",
        objetId: 1,
        natureId: 1,
        potentielReemploi: "Nul",
        reemploi: 0,
        masse: 1000,
        volume: 1000,
        anchorPosition: "{}",
        stemVector: "{}",
      },
    ]);
  });

  afterEach(() => client?.close());

  it("groups only waste, retaining zero/null potentials and aggregating their mass and volume", async () => {
    const result = await Effect.runPromise(
      loadCerfaWaste(input).pipe(Effect.provideService(Database, database)),
    );

    expect(result.projetInfo?.id).toBe("project-1");
    expect(result.dechets).toHaveLength(2);
    expect(result.dechets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categorie: "Bois",
          nature: "Bois traité",
          codeDechet: 170201,
          count: 7,
          masse: 14,
          volume: 21,
        }),
        expect.objectContaining({ categorie: null, count: 1, masse: 0, volume: 0 }),
      ]),
    );
  });

  it("exports the same waste groups and totals to the actual Excel workbook", async () => {
    const buffer = await Effect.runPromise(
      exportCerfaWaste(input).pipe(
        Effect.provideService(Database, database),
        Effect.provideService(Report, makeReportService()),
      ),
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("Caractérisation Déchets")!;

    expect(sheet.rowCount).toBe(3);
    expect(sheet.getRow(2).values).toEqual(
      expect.arrayContaining(["Bois", "Porte", "Bois traité", 170201, 14, 21]),
    );
    expect(sheet.getRow(2).getCell(5).value).toBe(14);
    expect(sheet.getRow(2).getCell(6).value).toBe(21);
    expect(sheet.getRow(3).getCell(5).value).toBe(0);
    expect(sheet.getRow(3).getCell(6).value).toBe(0);
  });
});
