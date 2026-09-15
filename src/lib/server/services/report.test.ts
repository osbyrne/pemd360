import { describe, expect, it, vi } from "vitest";
import ExcelJS from "exceljs";
import { Effect } from "effect";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { EmailError } from "$lib/effect/errors";
import { makeEmailService } from "$lib/server/services/email";
import { makeReportService } from "$lib/server/services/report";

vi.mock("$env/dynamic/private", () => ({ env: {} }));

describe("report and email adapters", () => {
  it("returns a parseable workbook with the existing sheet and values", async () => {
    const report = makeReportService();
    const buffer = await Effect.runPromise(
      report.generateDechetsExcel([
        {
          categorie: "Bois",
          objet: "Porte",
          nature: "Bois traité",
          codeDechet: 170201,
          masse: 12,
          volume: 2,
          ecoOrganisme: null,
          reutilisation: 1,
          recyclable: 1,
          valorisationMatiere: 1,
          valorisationEnergetique: 0,
          incinerationSansValo: 0,
          nonValorisation: 0,
          stockage: "À l'abri",
        },
      ]),
    );
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(["Caractérisation Déchets"]);
    expect(workbook.worksheets[0]?.getRow(2).getCell(1).value).toBe("Bois");
    expect(workbook.worksheets[0]?.getRow(2).getCell(4).value).toBe(170201);
  });

  it("converts a returned Resend error into a typed email failure", async () => {
    const email = makeEmailService(async () => {
      throw new Error("Resend returned an error");
    });
    const result = await Effect.runPromise(
      email
        .sendPasswordResetEmail({
          to: "user@example.com",
          resetUrl: "https://example.com/reset",
        })
        .pipe(Effect.either),
    );

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(EmailError);
      expect(result.left.operation).toBe("email.password-reset");
    }
  });

  it("renders the fixed CERFA fixture with the same page count", async () => {
    const template = await readFile("static/CERFA_Exemple.pdf");
    const report = makeReportService();
    const output = await Effect.runPromise(
      report.renderCerfaPdf(
        {
          diagnostic: null,
          diagnostiqueur: null,
          ouvrage: null,
          operation: {
            id: 1,
            projetId: "project-1",
            adresse: "1 rue du Test",
            cp: "75001",
            commune: "Paris",
            dateDeDebut: Date.now(),
            dateDeFin: null,
            operation: "Une rénovation significative",
            nbBatDemolition: null,
            surfaceADemolir: null,
            nbBatRenovation: 1,
            surfaceARenover: 100,
            typologieBat: null,
            datePermisDeConstruire: null,
            operationSoumis: null,
          },
          pemdList: [],
        },
        template,
      ),
    );
    const outputDocument = await PDFDocument.load(output);
    const templateDocument = await PDFDocument.load(template);

    expect(outputDocument.getPageCount()).toBe(templateDocument.getPageCount());
    expect(output.byteLength).toBeGreaterThan(0);
    expect(output).not.toEqual(template);
    expect(templateDocument.getForm().getFields()).toHaveLength(0);
  });
});
