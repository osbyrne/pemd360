import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFForm } from "pdf-lib";
import type { InferSelectModel } from "drizzle-orm";
import { isCerfaReuseItem } from "$lib/cerfa/reuse";
import type {
  cerfaDiagnostic,
  cerfaDiagnostiqueur,
  cerfaMtrOuvrage,
  cerfaOperation,
  pemd,
} from "$lib/server/db/schema";

export type CerfaPdfData = {
  readonly diagnostic: InferSelectModel<typeof cerfaDiagnostic> | null;
  readonly diagnostiqueur: InferSelectModel<typeof cerfaDiagnostiqueur> | null;
  readonly ouvrage: InferSelectModel<typeof cerfaMtrOuvrage> | null;
  readonly operation: InferSelectModel<typeof cerfaOperation> | null;
  readonly pemdList: readonly CerfaPdfPemdRow[];
};

export type CerfaPdfPemdRow = Pick<
  InferSelectModel<typeof pemd>,
  | "id"
  | "description"
  | "quantite"
  | "masse"
  | "volume"
  | "surface"
  | "etat"
  | "amiante"
  | "plombifere"
  | "termite"
  | "reemploi"
  | "potentielReemploi"
> & {
  readonly categorie: string | null;
  readonly famille: string | null;
  readonly unite?: string | null;
  readonly codeDechet?: number | null;
  readonly reutilisation?: number | null;
  readonly recyclable?: number | null;
  readonly valorisationMatiere?: number | null;
  readonly valorisationEnergetique?: number | null;
  readonly incinerationSansValo?: number | null;
  readonly nonValorisation?: number | null;
};

/**
 * Helper to format a date as DD/MM/YYYY components
 */
function getDateComponents(date: Date | number | null | undefined): {
  day: string;
  month: string;
  year: string;
} {
  if (!date) return { day: "", month: "", year: "" };
  const d = new Date(date);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: String(d.getFullYear()),
  };
}

export async function renderCerfaPdf(
  data: CerfaPdfData,
  templateBuffer: ArrayBuffer | Uint8Array,
): Promise<Uint8Array> {
  const { diagnostic, diagnostiqueur, ouvrage, operation, pemdList } = data;

  // Load the template PDF
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Try to get the form - if it exists, use form fields
  let form: PDFForm | null = null;
  let hasFormFields = false;

  try {
    form = pdfDoc.getForm();
    const fields = form.getFields();
    hasFormFields = fields.length > 0;

    // Log available fields for debugging
    if (hasFormFields) {
      console.log(
        "PDF form fields found:",
        fields.map((f) => `${f.getName()} (${f.constructor.name})`),
      );
    }
  } catch {
    console.log("No AcroForm found in PDF, using text overlay method");
  }

  const pages = pdfDoc.getPages();
  const p1 = pages[0]; // Opération
  const p2 = pages.length > 3 ? pages[2] : pages[1]; // Maître d'ouvrage & Diagnostiqueur (skip potential blank page)
  const p3 = pages.length > 3 ? pages[3] : pages[2]; // Diagnostic

  const supportedCharacters = new Set(helveticaFont.getCharacterSet());
  const arrowFallbacks = new Map([
    ["→", "->"],
    ["←", "<-"],
    ["↔", "<->"],
  ]);

  // Standard Helvetica is WinAnsi, including French accents and punctuation.
  // Normalize before measuring as well as drawing; unsupported characters remain
  // identifiable through explicit Unicode markers instead of being discarded.
  const normalizeText = (text: string, multiline = false): string =>
    Array.from(text.normalize("NFC").replace(/\r\n?|[\u0085\u2028\u2029]/g, "\n"), (character) => {
      if (character === "\n") return multiline ? "\n" : " ";
      if (character === "\t") return "    ";
      if (/[\s\u200B]/u.test(character)) return " ";
      const codePoint = character.codePointAt(0)!;
      if (supportedCharacters.has(codePoint)) return character;
      return (
        arrowFallbacks.get(character) ??
        `[U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}]`
      );
    }).join("");

  /**
   * Draw text at specific coordinates with proper styling
   */
  const drawText = (
    page: PDFPage,
    text: string | number | null | undefined,
    x: number,
    y: number,
    options?: { size?: number; bold?: boolean; maxWidth?: number },
  ) => {
    if (text === null || text === undefined || text === "") return;
    const size = options?.size ?? 9;
    const font = options?.bold ? helveticaBoldFont : helveticaFont;

    let textStr = normalizeText(String(text));

    // Truncate if maxWidth is specified
    if (options?.maxWidth) {
      const textWidth = font.widthOfTextAtSize(textStr, size);
      if (textWidth > options.maxWidth) {
        while (
          font.widthOfTextAtSize(textStr + "...", size) > options.maxWidth &&
          textStr.length > 0
        ) {
          textStr = textStr.slice(0, -1);
        }
        textStr += "...";
      }
    }

    page.drawText(textStr, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  /**
   * Draw a checkmark (X) at specific coordinates
   */
  const drawCheck = (page: PDFPage, x: number, y: number, checked: boolean = true) => {
    if (!checked) return;
    page.drawText("X", {
      x: x + 3.5, // Slightly to the right
      y: y + 1, // Slightly lower (PDF coords Y goes up, so smaller Y is lower)
      size: 10,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });
  };

  /**
   * Draw multi-line text
   */
  const drawMultiLineText = (
    page: PDFPage,
    text: string | null | undefined,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number = 12,
    maxLines: number = 5,
  ) => {
    if (!text) return;
    const lines: string[] = [];

    for (const paragraph of normalizeText(text, true).split("\n")) {
      let currentLine = "";
      for (const word of paragraph.split(/ +/).filter(Boolean)) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const width = helveticaFont.widthOfTextAtSize(testLine, 9);

        if (width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    }

    // Limit lines and add ellipsis if needed
    const limitedLines = lines.slice(0, maxLines);
    if (lines.length > maxLines) {
      limitedLines[maxLines - 1] += "...";
    }

    limitedLines.forEach((line, i) => {
      drawText(page, line, x, y - i * lineHeight, { maxWidth });
    });
  };

  // =============================================================================
  // PAGE 1: L'OPÉRATION
  // =============================================================================
  if (operation) {
    // Adresse de l'opération
    drawText(p1, operation.adresse, 200, 478, { maxWidth: 400 });

    // Code postal et commune
    drawText(p1, operation.cp, 140, 466);
    drawText(p1, operation.commune, 280, 466, { maxWidth: 250 });

    // Dates de début et fin
    const dateDebut = getDateComponents(operation.dateDeDebut);
    const dateFin = getDateComponents(operation.dateDeFin);

    if (dateDebut.year) {
      drawText(p1, `${dateDebut.day}/${dateDebut.month}/${dateDebut.year}`, 226, 442);
    }
    if (dateFin.year) {
      drawText(p1, `${dateFin.day}/${dateFin.month}/${dateFin.year}`, 258, 430);
    }

    // Type d'opération (démolition / rénovation / les deux)
    const Y_OP_TYPE = 407;
    if (operation.operation === "Une démolition" || operation.operation === "demolition") {
      drawCheck(p1, 168, Y_OP_TYPE);
    } else if (
      operation.operation === "Une rénovation significative" ||
      operation.operation === "renovation"
    ) {
      drawCheck(p1, 249, Y_OP_TYPE);
    } else if (operation.operation === "Les deux" || operation.operation === "mixte") {
      drawCheck(p1, 383, Y_OP_TYPE);
    }

    // Nombre de bâtiments et surfaces - Démolition (Label aligned left)
    const X_VAL_STD = 255;
    if (operation.nbBatDemolition) {
      drawText(p1, String(operation.nbBatDemolition), 295, 382);
    }
    if (operation.surfaceADemolir) {
      drawText(p1, String(operation.surfaceADemolir), X_VAL_STD, 370);
    }

    // Nombre de bâtiments et surfaces - Rénovation
    if (operation.nbBatRenovation) {
      // Label "Nombre de bâtiments concernés par la rénovation significative :" is longer
      // So we push the value further right than the standard position
      drawText(p1, String(operation.nbBatRenovation), 320, 359);
    }
    if (operation.surfaceARenover) {
      drawText(p1, String(operation.surfaceARenover), X_VAL_STD, 347);
    }

    // Typologies des bâtiments
    if (operation.typologieBat) {
      try {
        const typologies = JSON.parse(operation.typologieBat);
        if (Array.isArray(typologies)) {
          // Première colonne (x=80)
          if (typologies.includes("Maison individuelle")) drawCheck(p1, 80, 305);
          if (typologies.includes("Logement collectif")) drawCheck(p1, 80, 293);
          if (typologies.includes("Commerces")) drawCheck(p1, 80, 281);
          if (typologies.includes("Bureaux")) drawCheck(p1, 80, 269);
          if (typologies.includes("Bâtiment industriel")) drawCheck(p1, 80, 257);
          if (typologies.includes("Établissement de santé")) drawCheck(p1, 80, 245);

          // Deuxième colonne (x=303)
          if (typologies.includes("Établissement d'enseignement")) drawCheck(p1, 303, 305);
          if (typologies.includes("Café, hôtel, restaurants")) drawCheck(p1, 303, 293);
          if (typologies.includes("Bâtiment à usage sportif ou de loisirs"))
            drawCheck(p1, 303, 281);
          if (typologies.includes("ICPE")) drawCheck(p1, 303, 269);

          // Autre
          const standardTypes = [
            "Maison individuelle",
            "Logement collectif",
            "Commerces",
            "Bureaux",
            "Bâtiment industriel",
            "Établissement de santé",
            "Établissement d'enseignement",
            "Café, hôtel, restaurants",
            "Bâtiment à usage sportif ou de loisirs",
            "ICPE",
          ];
          const otherType = typologies.find(
            (t: string) => !standardTypes.includes(t) && t !== "Autre",
          );
          if (otherType || typologies.includes("Autre")) {
            drawCheck(p1, 303, 257);
            if (otherType) {
              drawText(p1, otherType, 360, 257, { maxWidth: 200 });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing typologieBat", e);
      }
    }

    // Date du permis de construire
    const datePermis = getDateComponents(operation.datePermisDeConstruire);
    if (datePermis.year) {
      // Y=192 matches the line "a la plus grande surface de plancher : MM/AAAA"
      // X=290 places it after the colon
      drawText(p1, `${datePermis.month}/${datePermis.year}`, 223, 192);
    }

    // Opérations réalisées
    if (operation.operationSoumis) {
      try {
        const ops = JSON.parse(operation.operationSoumis);
        if (Array.isArray(ops)) {
          // Moved to Page 2 based on template analysis (Top of Page 2)
          // Labels ~x=88 -> Box x=73
          const X_check = 73;
          // Support both old format (full text) and new format (short keys)
          if (ops.includes("Rénovation importante") || ops.includes("renovation"))
            drawCheck(p2, X_check, 720);
          if (
            operation.dateRenovation &&
            (ops.includes("Rénovation importante") || ops.includes("renovation"))
          ) {
            const [year, month] = operation.dateRenovation.split("-");
            drawText(p2, `${month}/${year}`, 365, 720, { maxWidth: 100 });
          }
          if (ops.includes("Opération de décontamination") || ops.includes("decontamination"))
            drawCheck(p2, X_check, 703);
          if (ops.includes("Autre intervention importante") || ops.includes("autre"))
            drawCheck(p2, X_check, 686);
          if (ops.includes("Aucune opération") || ops.includes("aucune"))
            drawCheck(p2, X_check, 669);
          if (ops.includes("Ne sait pas") || ops.includes("ne_sait_pas"))
            drawCheck(p2, X_check, 652);
        }
      } catch (e) {
        console.error("Error parsing operationSoumis", e);
      }
    }
  }

  // =============================================================================
  // PAGE 2: MAÎTRE D'OUVRAGE
  // =============================================================================
  if (ouvrage) {
    // Personne Physique
    if (ouvrage.nomPerPhy) {
      drawText(p2, ouvrage.nomPerPhy, 160, 588, { maxWidth: 200 });
    }
    if (ouvrage.prenomPerPhy) {
      drawText(p2, ouvrage.prenomPerPhy, 160, 576, { maxWidth: 200 });
    }

    // Personne Morale
    if (ouvrage.nomPerMorale) {
      drawText(p2, ouvrage.nomPerMorale, 160, 540, { maxWidth: 350 });
    }
    if (ouvrage.siretSiren) {
      drawText(p2, ouvrage.siretSiren, 200, 528);
    }

    // Adresse
    drawText(p2, ouvrage.adresse, 160, 492, { maxWidth: 400 });
    drawText(p2, ouvrage.cp, 140, 481);
    drawText(p2, ouvrage.commune, 280, 481, { maxWidth: 250 });
  }

  // =============================================================================
  // PAGE 2: DIAGNOSTIQUEUR
  // =============================================================================
  if (diagnostiqueur) {
    // Personne Physique
    if (diagnostiqueur.nomPerPhy) {
      drawText(p2, diagnostiqueur.nomPerPhy, 160, 416, { maxWidth: 200 });
    }
    if (diagnostiqueur.prenomPerPhy) {
      drawText(p2, diagnostiqueur.prenomPerPhy, 160, 404, { maxWidth: 200 });
    }

    // Personne Morale
    if (diagnostiqueur.nomPerMorale) {
      drawText(p2, diagnostiqueur.nomPerMorale, 160, 368, { maxWidth: 350 });
    }
    if (diagnostiqueur.siretSiren) {
      drawText(p2, diagnostiqueur.siretSiren, 200, 356);
    }

    // Adresse
    drawText(p2, diagnostiqueur.adresse, 160, 321, { maxWidth: 400 });
    drawText(p2, diagnostiqueur.cp, 140, 309);
    drawText(p2, diagnostiqueur.commune, 280, 309, { maxWidth: 250 });

    // Engagement Assurance (checkbox)
    if (diagnostiqueur.engagementAssurance) {
      drawCheck(p2, 71, 267);
    }

    // Détails assurance
    drawText(p2, diagnostiqueur.nomAssurance, 230, 230, { maxWidth: 280 });
    drawText(p2, diagnostiqueur.numeroPolice, 160, 218);

    // Dates assurance
    const dateDebutAssurance = getDateComponents(diagnostiqueur.dateDebutAssurance);
    const dateFinAssurance = getDateComponents(diagnostiqueur.dateFinAssurance);
    if (dateDebutAssurance.year) {
      drawText(
        p2,
        `${dateDebutAssurance.day}/${dateDebutAssurance.month}/${dateDebutAssurance.year}`,
        165,
        206,
      );
    }
    if (dateFinAssurance.year) {
      drawText(
        p2,
        `${dateFinAssurance.day}/${dateFinAssurance.month}/${dateFinAssurance.year}`,
        270,
        206,
      );
    }

    // Compétences (checkbox)
    if (diagnostiqueur.competences) {
      drawCheck(p2, 71, 167);
    }
  }

  // =============================================================================
  // PAGE 3: LE DIAGNOSTIC
  // =============================================================================
  if (diagnostic) {
    // Date de la dernière visite
    const derniereVisite = getDateComponents(diagnostic.derniereVisite);
    if (derniereVisite.year) {
      drawText(
        p3,
        `${derniereVisite.day}/${derniereVisite.month}/${derniereVisite.year}`,
        246,
        730,
      );
    }

    // Bâtiments visités
    drawMultiLineText(p3, diagnostic.batVisite, 74, 690, 460, 11, 4);

    // Bâtiments non visités
    drawMultiLineText(p3, diagnostic.batNonVisite, 74, 615, 460, 11, 4);

    // Raisons de non visite
    drawMultiLineText(p3, diagnostic.raisonsNePasVisite, 74, 545, 460, 11, 4);

    // Désordres (Oui / Non)
    // "Oui" at x=93 -> Box x=78 | "Non" at x=145 -> Box x=130
    if (diagnostic.desordres === 1) {
      drawCheck(p3, 78, 477); // Oui
    } else if (diagnostic.desordres === 0) {
      drawCheck(p3, 130, 477); // Non
    }

    // Précautions (Oui / Non)
    // "Oui" at x=93 -> Box x=78 | "Non" at x=145 -> Box x=130
    if (diagnostic.precaution === 1) {
      drawCheck(p3, 78, 450); // Oui
    } else if (diagnostic.precaution === 0) {
      drawCheck(p3, 130, 450); // Non
    }

    // Documents consultés
    // Mapping based on extracted coordinates:
    // Dossier des Ouvrages...: y=423
    // Plans: y=411
    // Diagnostic amiante: y=399
    // Diagnostic plomb: y=387
    // Diagnostic termites: y=375
    // Autres: y=363
    if (diagnostic.documentsConsultes) {
      try {
        let docs: string[] = [];
        try {
          docs = JSON.parse(diagnostic.documentsConsultes);
        } catch {
          // Handle case where it's a single string, maybe comma separated? or just treat as custom text
          if (typeof diagnostic.documentsConsultes === "string") {
            docs = [diagnostic.documentsConsultes];
          }
        }

        if (Array.isArray(docs)) {
          const X_BOX = 78;
          let otherDocs: string[] = [];

          docs.forEach((doc) => {
            const d = doc.toLowerCase();
            if (d.includes("dossier des ouvrages") || d.includes("doe")) {
              drawCheck(p3, X_BOX, 423);
            } else if (d.includes("plan")) {
              drawCheck(p3, X_BOX, 411);
            } else if (d.includes("amiante")) {
              drawCheck(p3, X_BOX, 399);
            } else if (d.includes("plomb")) {
              drawCheck(p3, X_BOX, 387);
            } else if (d.includes("termite")) {
              drawCheck(p3, X_BOX, 375);
            } else if (d.startsWith("autres") || d.startsWith("autre")) {
              drawCheck(p3, X_BOX, 363);
              // Extract content after "Autres :" if present in the string
              const parts = doc.split(":");
              if (parts.length > 1) {
                otherDocs.push(parts.slice(1).join(":").trim());
              }
            } else {
              // It's a custom doc, treat as "Autres"
              drawCheck(p3, X_BOX, 363);
              otherDocs.push(doc);
            }
          });

          // Print custom text for "Autres"
          if (otherDocs.length > 0) {
            // "Autres :" label is at x=92, y=363. Calculate where to start text.
            // Approx start of free space ~x=140
            drawText(p3, otherDocs.join(", "), 140, 363, { maxWidth: 300 });
          }
        }
      } catch (e) {
        console.error("Error processing documentsConsultes", e);
      }
    }
  }

  // Flatten the form to make fields non-editable (optional, but recommended for final documents)
  if (form && hasFormFields) {
    form.flatten();
  }

  // =============================================================================
  // TABLEAUX GÉNÉRÉS (Style CERFA 16287)
  // =============================================================================

  if (pemdList.length > 0) {
    // --- Helper Functions for Custom Tables ---
    const drawTableHeader = (p: PDFPage, y: number, headers: { text: string; width: number }[]) => {
      let currentX = 50;
      const rowHeight = 20;

      // Draw gray background for header
      p.drawRectangle({
        x: 50,
        y: y - rowHeight + 5,
        width: 500,
        height: rowHeight,
        color: rgb(0.9, 0.9, 0.9),
      });

      // Draw header text
      headers.forEach((h) => {
        p.drawText(h.text, {
          x: currentX + 5,
          y: y,
          size: 8,
          font: helveticaBoldFont,
        });
        currentX += h.width;
      });

      return y - rowHeight;
    };

    const tableRowHeight = (data: string[]) =>
      Math.max(...data.map((text) => text.split("\n").length)) * 11 + 4;
    const drawTableRow = (p: PDFPage, y: number, headers: { width: number }[], data: string[]) => {
      let currentX = 50;
      const rowHeight = tableRowHeight(data);
      data.forEach((text, i) => {
        text.split("\n").forEach((line, index) => {
          drawText(p, line, currentX + 5, y - index * 11, {
            size: 8,
            maxWidth: headers[i].width - 10,
          });
        });
        currentX += headers[i].width;
      });
      p.drawLine({
        start: { x: 50, y: y - rowHeight + 10 },
        end: { x: 550, y: y - rowHeight + 10 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });
      return y - rowHeight;
    };

    const formatNumber = (value: number) =>
      value.toLocaleString("fr-FR", { maximumFractionDigits: 6 });
    const quantity = (item: CerfaPdfPemdRow, preferMass = false): string => {
      if (preferMass && item.masse !== null) return `${formatNumber(item.masse / 1000)} t`;
      if (item.quantite !== null)
        return `${formatNumber(item.quantite)}${item.unite ? ` ${item.unite}` : ""}`;
      if (item.masse !== null) return `${formatNumber(item.masse / 1000)} t`;
      if (item.volume !== null) return `${formatNumber(item.volume)} m³`;
      if (item.surface !== null) return `${formatNumber(item.surface)} m²`;
      return "Non renseignée";
    };
    const wasteRoutes = (item: CerfaPdfPemdRow): string => {
      const routes = [
        [item.reutilisation, "Réutilisation"],
        [item.recyclable, "Recyclage"],
        [item.valorisationMatiere, "Valorisation matière"],
        [item.valorisationEnergetique, "Valorisation énergétique"],
        [item.incinerationSansValo, "Incinération sans valorisation"],
        [item.nonValorisation, "Élimination sans valorisation"],
      ] as const;
      return (
        routes
          .filter(([enabled]) => enabled === 1)
          .map(([, label]) => label)
          .join("\n") || "Non renseignées"
      );
    };

    const checkPageSpace = (
      p: PDFPage,
      y: number,
      needed: number = 50,
    ): { page: PDFPage; y: number } => {
      if (y < needed) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        return { page: newPage, y: 800 };
      }
      return { page: p, y };
    };

    // --- Tableau 1: Réemploi ---
    const reuseItems = pemdList.filter(isCerfaReuseItem);

    let currentPage = pdfDoc.addPage([595.28, 841.89]);
    let yPos = 800;

    if (reuseItems.length > 0) {
      currentPage.drawText("Tableau 1 : Récapitulatif des matériaux destinés au réemploi", {
        x: 50,
        y: yPos,
        size: 12,
        font: helveticaBoldFont,
      });
      yPos -= 30;

      const reuseHeaders = [
        { text: "Catégorie", width: 100 },
        { text: "Description", width: 150 },
        { text: "Quantité", width: 70 },
        { text: "État", width: 80 },
        { text: "Destination", width: 100 },
      ];

      yPos = drawTableHeader(currentPage, yPos, reuseHeaders);

      reuseItems.forEach((item) => {
        const cells = [
          item.categorie || "",
          item.description || "",
          quantity(item),
          item.etat || "",
          "Réemploi",
        ].map((text) => normalizeText(text));
        const res = checkPageSpace(currentPage, yPos, tableRowHeight(cells) + 30);
        currentPage = res.page;
        yPos = res.y;
        if (yPos === 800) yPos = drawTableHeader(currentPage, yPos, reuseHeaders);
        yPos = drawTableRow(currentPage, yPos, reuseHeaders, cells);
      });

      yPos -= 30; // Spacing after table
    }

    // --- Tableau 2: Déchets ---
    const wasteItems = pemdList.filter((item) => !isCerfaReuseItem(item));

    if (wasteItems.length > 0) {
      const res = checkPageSpace(currentPage, yPos, 100); // Check enough space for title + header
      currentPage = res.page;
      yPos = res.y;

      currentPage.drawText("Tableau 2 : Récapitulatif des déchets", {
        x: 50,
        y: yPos,
        size: 12,
        font: helveticaBoldFont,
      });
      yPos -= 30;

      const wasteHeaders = [
        { text: "Catégorie", width: 150 },
        { text: "Codification", width: 100 },
        { text: "Quantité", width: 100 },
        { text: "Filières possibles", width: 150 },
      ];

      yPos = drawTableHeader(currentPage, yPos, wasteHeaders);

      wasteItems.forEach((item) => {
        const cells = [
          normalizeText(item.categorie || ""),
          item.codeDechet == null ? "Non renseignée" : String(item.codeDechet).padStart(6, "0"),
          quantity(item, true),
          wasteRoutes(item),
        ];
        const res = checkPageSpace(currentPage, yPos, tableRowHeight(cells) + 30);
        currentPage = res.page;
        yPos = res.y;
        if (yPos === 800) yPos = drawTableHeader(currentPage, yPos, wasteHeaders);
        yPos = drawTableRow(currentPage, yPos, wasteHeaders, cells);
      });
    }
  }

  return await pdfDoc.save();
}
