import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { 
    projet, userProjet, 
    cerfaMtrOuvrage, cerfaOperation, cerfaDiagnostiqueur, cerfaDiagnostic,
    pemd, natureV2, objets, categorieV2
} from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
    const { id } = params;
    const currentUser = locals.user;

    if (!currentUser) {
        throw error(401, 'Non autorisé');
    }

    const result = await db.select().from(projet).where(eq(projet.id, id));
    const project = result[0];

    if (!project) {
        throw error(404, 'Projet non trouvé');
    }

    // Vérifier que l'utilisateur a accès à ce projet (admin ou associé au projet)
    let hasAccess = currentUser.role === 'admin';
    if (!hasAccess) {
        const assignment = await db.select()
            .from(userProjet)
            .where(and(eq(userProjet.userId, currentUser.id), eq(userProjet.projetId, id)))
            .limit(1);
        hasAccess = assignment.length > 0;
    }

    if (!hasAccess) {
        throw error(403, 'Accès non autorisé à ce projet');
    }

    // Fetch CERFA Information
    const mtrOuvrage = await db.select().from(cerfaMtrOuvrage).where(eq(cerfaMtrOuvrage.projetId, id)).get();
    const operation = await db.select().from(cerfaOperation).where(eq(cerfaOperation.projetId, id)).get();
    const diagnostiqueur = await db.select().from(cerfaDiagnostiqueur).where(eq(cerfaDiagnostiqueur.projetId, id)).get();
    const diagnostic = await db.select().from(cerfaDiagnostic).where(eq(cerfaDiagnostic.projetId, id)).get();

    // Fetch PEMD Data
    const pemdData = await db.select({
        id: pemd.id,
        reemploi: pemd.reemploi,
        categorie: categorieV2.categoriev2,
        objet: objets.objet,
        codeDechet: natureV2.codeDechet,
        masse: pemd.masse,
        volume: pemd.volume,
        nature: natureV2.nature,
        stockage: natureV2.stockage,
        description: pemd.description,
        recyclable: natureV2.recyclable,
        valorisationMatiere: natureV2.valorisationMatiere,
        valorisationEnergetique: natureV2.valorisationEnergetique
    })
    .from(pemd)
    .leftJoin(natureV2, eq(pemd.natureId, natureV2.id))
    .leftJoin(objets, eq(pemd.objetId, objets.id))
    .leftJoin(categorieV2, eq(objets.categorieId, categorieV2.id))
    .where(eq(pemd.sidId, id))
    .all();

    const dechets = pemdData.filter(d => d.reemploi !== 1);
    const pem = pemdData.filter(d => d.reemploi === 1);

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    let y = height - 50;

    const sanitize = (str: string) => str.replace(/[\u202f\u00a0]/g, ' ');

    const checkPageBreak = (spaceNeeded: number) => {
        if (y - spaceNeeded < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
        }
    };

    const drawTitle = (text: string) => {
        checkPageBreak(40);
        page.drawText(sanitize(text), { x: 50, y, size: 18, font: fontBold, color: rgb(0, 0.5, 0) });
        y -= 30;
    };

    const drawSection = (title: string) => {
        checkPageBreak(30);
        y -= 10;
        page.drawText(sanitize(title), { x: 50, y, size: 14, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
        page.drawLine({
            start: { x: 50, y: y - 5 },
            end: { x: 550, y: y - 5 },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        });
        y -= 25;
    };

    const drawField = (label: string, value: any) => {
        checkPageBreak(20);
        const valStr = value ? String(value) : '-';
        page.drawText(sanitize(label) + ':', { x: 50, y, size: 10, font: fontBold });
        page.drawText(sanitize(valStr), { x: 200, y, size: 10, font });
        y -= 15;
    };

    // --- PAGE 1: INFORMATIONS ---
    drawTitle('RÉCAPITULATIF CERFA - ' + (project.libelle || 'Projet sans nom'));
    drawField('Référence', project.reference);
    drawField('Date du document', new Date().toLocaleDateString('fr-FR'));
    y -= 10;

    if (mtrOuvrage) {
        drawSection('1. Maître d\'Ouvrage');
        drawField('Nom / Raison Sociale', mtrOuvrage.nomPerMorale || (mtrOuvrage.nomPerPhy + ' ' + mtrOuvrage.prenomPerPhy));
        drawField('Adresse', mtrOuvrage.adresse);
        drawField('CP / Commune', `${mtrOuvrage.cp || ''} ${mtrOuvrage.commune || ''}`);
        drawField('SIRET/SIREN', mtrOuvrage.siretSiren);
    }

    if (diagnostiqueur) {
        drawSection('2. Diagnostiqueur');
        drawField('Nom / Raison Sociale', diagnostiqueur.nomPerMorale || (diagnostiqueur.nomPerPhy + ' ' + diagnostiqueur.prenomPerPhy));
        drawField('Adresse', diagnostiqueur.adresse);
        drawField('Commune', `${diagnostiqueur.cp || ''} ${diagnostiqueur.commune || ''}`);
        drawField('Assurance', diagnostiqueur.nomAssurance);
        drawField('N° Police', diagnostiqueur.numeroPolice);
    }

    if (operation) {
        drawSection('3. Opération');
        drawField('Type d\'opération', operation.operation);
        drawField('Adresse du chantier', operation.adresse);
        drawField('Date de début', operation.dateDeDebut ? new Date(operation.dateDeDebut).toLocaleDateString() : '-');
        drawField('Nb Bâtiments Démolis', operation.nbBatDemolition);
        drawField('Surface à démolir', operation.surfaceADemolir + ' m²');
    }

    if (diagnostic) {
        drawSection('4. Diagnostic');
        drawField('Date dernière visite', diagnostic.derniereVisite ? new Date(diagnostic.derniereVisite).toLocaleDateString() : '-');
    }

    // --- PAGE 2: INVENTAIRE PEM (Réemploi) ---
    page = pdfDoc.addPage();
    y = height - 50;
    drawTitle('INVENTAIRE PEM (Réemploi)');

    if (pem.length === 0) {
        page.drawText("Aucun élément identifié pour le réemploi.", { x: 50, y, size: 12, font });
    } else {
        const headers = ['Catégorie', 'Objet', 'Nature', 'Masse (kg)', 'Destination'];
        // Simple table header
        checkPageBreak(30);
        let xOffset = 50;
        headers.forEach((h, i) => {
             page.drawText(h, { x: xOffset, y, size: 10, font: fontBold });
             xOffset += [100, 100, 100, 80, 100][i];
        });
        y -= 15;
        page.drawLine({ start: { x: 50, y: y+10 }, end: { x: 550, y: y+10 }, thickness: 1 });

        for (const item of pem) {
            checkPageBreak(25);
            xOffset = 50;
            const row = [
                (item.categorie || '').substring(0, 18),
                (item.objet || '').substring(0, 18),
                (item.nature || '').substring(0, 18),
                (item.masse ? item.masse.toString() : '0'),
                (item.stockage || 'Réemploi site').substring(0, 20)
            ];
            
            row.forEach((val, i) => {
                page.drawText(sanitize(val), { x: xOffset, y, size: 9, font });
                xOffset += [100, 100, 100, 80, 100][i];
            });
            y -= 15;
        }
    }

    // --- PAGE 3: DÉCHETS ---
    page = pdfDoc.addPage();
    y = height - 50;
    drawTitle('CARACTÉRISATION DES DÉCHETS');

    if (dechets.length === 0) {
        page.drawText("Aucun déchet caractérisé.", { x: 50, y, size: 12, font });
    } else {
        // Group identical wastes to simplify the list
        const groupedDechets = new Map();
        dechets.forEach(item => {
            const key = `${item.categorie}_${item.nature}_${item.codeDechet}`;
            if (!groupedDechets.has(key)) {
                groupedDechets.set(key, { ...item, count: 1 });
            } else {
                const existing = groupedDechets.get(key);
                existing.masse = (existing.masse || 0) + (item.masse || 0);
                existing.count++;
            }
        });
        const summarizedDechets = Array.from(groupedDechets.values());

        const headers = ['Code', 'Nature / Catégorie', 'Masse (kg)', 'Filière Probable'];
        checkPageBreak(30);
        let xOffset = 50;
         headers.forEach((h, i) => {
             page.drawText(h, { x: xOffset, y, size: 10, font: fontBold });
             xOffset += [60, 240, 80, 120][i];
        });
        y -= 15;
        page.drawLine({ start: { x: 50, y: y+10 }, end: { x: 550, y: y+10 }, thickness: 1 });

        for (const item of summarizedDechets) {
            checkPageBreak(25);
            xOffset = 50;

            let filiere = 'Enfouissement';
            if (item.recyclable) filiere = 'Recyclage';
            else if (item.valorisationMatiere) filiere = 'Valo. Matière';
            else if (item.valorisationEnergetique) filiere = 'Valo. Énergie';

            const natureText = `${item.nature || ''} (${item.categorie || ''})`;

            const row = [
                (item.codeDechet ? String(item.codeDechet) : '-'),
                natureText.substring(0, 45) + (natureText.length > 45 ? '...' : ''),
                (item.masse ? item.masse.toLocaleString('fr-FR') : '0'),
                filiere
            ];
            
            row.forEach((val, i) => {
                page.drawText(sanitize(val), { x: xOffset, y, size: 9, font });
                xOffset += [60, 240, 80, 120][i];
            });
            y -= 15;
        }
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="CERFA_Complet_${project.reference || id}.pdf"`
        }
    });
};
