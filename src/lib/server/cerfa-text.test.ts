import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { beforeAll, describe, expect, it } from "vitest";
import { renderCerfaPdf, type CerfaPdfData, type CerfaPdfPemdRow } from "./cerfa";

const reuseRow: CerfaPdfPemdRow = {
  id: "text-regression",
  description: "Porte en chêne",
  quantite: 2,
  masse: null,
  volume: null,
  surface: null,
  etat: "Bon état",
  amiante: 0,
  plombifere: 0,
  termite: 0,
  reemploi: 1,
  potentielReemploi: null,
  categorie: "Menuiserie",
  famille: "Bois",
};

const emptyData: CerfaPdfData = {
  diagnostic: null,
  diagnostiqueur: null,
  ouvrage: null,
  operation: null,
  pemdList: [],
};

async function extractPages(output: Uint8Array) {
  const loadingTask = getDocument({ data: Uint8Array.from(output), useSystemFonts: true });
  const document = await loadingTask.promise;
  try {
    return await Promise.all(
      Array.from({ length: document.numPages }, async (_, index) => {
        const page = await document.getPage(index + 1);
        const content = await page.getTextContent();
        return content.items.filter((item) => "str" in item);
      }),
    );
  } finally {
    await loadingTask.destroy();
  }
}

describe("CERFA text encoding with the real template", () => {
  let template: Uint8Array;
  let templatePageCount: number;

  beforeAll(async () => {
    template = await readFile("static/CERFA_Exemple.pdf");
    templatePageCount = (await PDFDocument.load(template)).getPageCount();
  });

  it.each([
    ["Line one\nLine two", "Line one Line two"],
    ["Matériau → recyclage", "Matériau -> recyclage"],
  ])(
    "renders reuse description %j without losing its readable content",
    async (description, expected) => {
      const output = await renderCerfaPdf(
        { ...emptyData, pemdList: [{ ...reuseRow, description }] },
        template,
      );
      expect((await PDFDocument.load(output)).getPageCount()).toBe(templatePageCount + 1);
      const pages = await extractPages(output);
      const table = pages
        .at(-1)!
        .map((item) => item.str)
        .join(" ")
        .replace(/\s+/g, " ");
      expect(table).toContain(expected);
      expect(table).toContain("Menuiserie");
      expect(table).toContain("Bon état");
      expect(table).toContain("Réemploi");
    },
  );

  it("renders multiline diagnostic text with French accents and unsupported characters", async () => {
    const output = await renderCerfaPdf(
      {
        ...emptyData,
        diagnostic: {
          id: 1,
          projetId: "text-regression",
          derniereVisite: null,
          batVisite: "Atelier écologique → tri\r\nAnnexe 中文",
          batNonVisite: null,
          raisonsNePasVisite: null,
          desordres: 0,
          precaution: 1,
          documentsConsultes: null,
        },
      },
      template,
    );
    const pages = await extractPages(output);
    const text = pages
      .flat()
      .map((item) => item.str)
      .join(" ");
    expect(text).toContain("Atelier écologique -> tri");
    expect(text).toContain("Annexe [U+4E2D][U+6587]");
  });

  it("keeps normalized long cell text within its column and marks truncation", async () => {
    const output = await renderCerfaPdf(
      {
        ...emptyData,
        pemdList: [{ ...reuseRow, description: "Matériau → recyclage ".repeat(20) }],
      },
      template,
    );
    const pages = await extractPages(output);
    const description = pages.at(-1)!.find((item) => item.str.startsWith("Matériau ->"))!;
    expect(description.str).toMatch(/\.\.\.$/);
    expect(description.width).toBeLessThanOrEqual(140);
  });
  it("prints waste codes, converted masses and configured routes without inventing recycling", async () => {
    const output = await renderCerfaPdf(
      {
        ...emptyData,
        pemdList: [
          {
            ...reuseRow,
            id: "waste",
            reemploi: 0,
            categorie: "Bois traité",
            masse: 25,
            codeDechet: 170201,
            recyclable: 0,
            nonValorisation: 1,
          },
          {
            ...reuseRow,
            id: "unknown",
            reemploi: 0,
            categorie: "Inconnu",
            quantite: null,
            masse: null,
          },
          { ...reuseRow, id: "reuse-unit", quantite: 0, unite: "u" },
          {
            ...reuseRow,
            id: "multi-route",
            reemploi: 0,
            codeDechet: 10101,
            masse: 0,
            recyclable: 1,
            valorisationMatiere: 1,
          },
        ],
      },
      template,
    );
    const pages = await extractPages(output);
    const text = pages
      .at(-1)!
      .map((item) => item.str)
      .join(" ");
    expect(text).toContain("170201");
    expect(text).toContain("010101");
    expect(text).toContain("0,025 t");
    expect(pages.at(-1)!.map((item) => item.str)).not.toContain("25 t");
    expect(text).toContain("Élimination sans valorisation");
    expect(text).toContain("Non renseignées");
    expect(text).toContain("0 u");
    expect(text).toContain("Valorisation matière");
    expect(text.match(/Recyclage/g)).toHaveLength(1);
  });
});
