import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { db } from '$lib/server/db/client';
import { cerfaDiagnostic, cerfaDiagnostiqueur, cerfaMtrOuvrage, cerfaOperation, projet } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function generateCerfaPdf(projetId: string, templateBuffer: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  // Fetch all necessary data
  const [projectData] = await db.select().from(projet).where(eq(projet.id, projetId));
  const [diagnostic] = await db.select().from(cerfaDiagnostic).where(eq(cerfaDiagnostic.projetId, projetId));
  const [diagnostiqueur] = await db.select().from(cerfaDiagnostiqueur).where(eq(cerfaDiagnostiqueur.projetId, projetId));
  const [ouvrage] = await db.select().from(cerfaMtrOuvrage).where(eq(cerfaMtrOuvrage.projetId, projetId));
  const [operation] = await db.select().from(cerfaOperation).where(eq(cerfaOperation.projetId, projetId));

  if (!projectData) {
    throw new Error('Project not found');
  }

  // Load the template PDF
  const pdfDoc = await PDFDocument.load(templateBuffer);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Helper to draw text
  const drawOnPage = (pageIndex: number, text: string | number | null | undefined, x: number, y: number, size = 10) => {
    if (text === null || text === undefined) return;
    const pages = pdfDoc.getPages();
    if (pageIndex >= pages.length) return;
    
    pages[pageIndex].drawText(String(text), {
      x,
      y,
      size,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  };

  const drawDate = (pageIndex: number, date: Date | number | null | undefined, x: number, y: number, size = 10) => {
    if (!date) return;
    const d = new Date(date);
    const text = d.toLocaleDateString('fr-FR');
    drawOnPage(pageIndex, text, x, y, size);
  }

  // --- Page Indices ---
  const p1 = 0; // Opération
  const p2 = 1; // Maître d'ouvrage & Diagnostiqueur
  const p3 = 2; // Diagnostic

  // --- Page 1: Opération ---
  if (operation) {
    drawOnPage(p1, operation.adresse, 200, 478);
    drawOnPage(p1, operation.cp, 140, 466);
    drawOnPage(p1, operation.commune, 280, 466);
    
    drawDate(p1, operation.dateDeDebut, 226, 442);
    drawDate(p1, operation.dateDeFin, 258, 430);
    
    // Checkboxes / options
    // "L'opération est-elle...": 
    // Usually checkboxes are not handled by just text, but I'll skip drawing X for now unless requested specifically
    
    // Demolition
    if (operation.nbBatDemolition) drawOnPage(p1, operation.nbBatDemolition, 300, 382);
    if (operation.surfaceADemolir) drawOnPage(p1, operation.surfaceADemolir, 300, 370);
    
    // Renovation
    if (operation.nbBatRenovation) drawOnPage(p1, operation.nbBatRenovation, 350, 359);
    if (operation.surfaceARenover) drawOnPage(p1, operation.surfaceARenover, 350, 347);
  }

  // --- Page 2: Maitre d'Ouvrage ---
  if (ouvrage) {
    // Personne Physique
    drawOnPage(p2, ouvrage.nomPerPhy, 160, 588);
    drawOnPage(p2, ouvrage.prenomPerPhy, 160, 576);
    
    // Personne Morale
    drawOnPage(p2, ouvrage.nomPerMorale, 160, 540);
    drawOnPage(p2, ouvrage.siretSiren, 200, 528);
    
    // Adresse
    drawOnPage(p2, ouvrage.adresse, 160, 492);
    drawOnPage(p2, ouvrage.cp, 140, 481);
    drawOnPage(p2, ouvrage.commune, 280, 481);
  }

  // --- Page 2: Diagnostiqueur ---
  if (diagnostiqueur) {
      // Personne Physique
      drawOnPage(p2, diagnostiqueur.nomPerPhy, 160, 416);
      drawOnPage(p2, diagnostiqueur.prenomPerPhy, 160, 404);
      
      // Personne Morale
      drawOnPage(p2, diagnostiqueur.nomPerMorale, 160, 368);
      drawOnPage(p2, diagnostiqueur.siretSiren, 200, 356);
      
      // Adresse
      drawOnPage(p2, diagnostiqueur.adresse, 160, 321);
      drawOnPage(p2, diagnostiqueur.cp, 140, 309);
      drawOnPage(p2, diagnostiqueur.commune, 280, 309);
      
      // Assurance
      drawOnPage(p2, diagnostiqueur.nomAssurance, 230, 230);
      drawOnPage(p2, diagnostiqueur.numeroPolice, 160, 218);
      drawDate(p2, diagnostiqueur.dateDebutAssurance, 165, 206);
      drawDate(p2, diagnostiqueur.dateFinAssurance, 270, 206);
  }

  // --- Page 3: Diagnostic ---
  if (diagnostic) {
      drawDate(p3, diagnostic.derniereVisite, 246, 730);
      
      // Text areas - need multi-line or just positioned below each header
      drawOnPage(p3, diagnostic.batVisite, 74, 690);
      drawOnPage(p3, diagnostic.batNonVisite, 74, 615);
      drawOnPage(p3, diagnostic.raisonsNePasVisite, 74, 545);
  }

  return await pdfDoc.save();
}
