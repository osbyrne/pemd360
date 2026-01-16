import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/client';
import { projet, userProjet, tagMail, tagsAmiante, tagsPlomb, tagsTermite, tagsStructure } from '$lib/server/db/schema';
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

    // Load tags for this project
    const tags = await db.select().from(tagMail).where(eq(tagMail.projetIdId, id));
    const amianteTags = await db.select().from(tagsAmiante).where(eq(tagsAmiante.sidId, id));
    const plombTags = await db.select().from(tagsPlomb).where(eq(tagsPlomb.sidId, id));
    const termiteTags = await db.select().from(tagsTermite).where(eq(tagsTermite.sidId, id));
    const structureTags = await db.select().from(tagsStructure).where(eq(tagsStructure.sidId, id));

    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    let y = height - 50;

    const drawText = (text: string, size = fontSize, color = rgb(0, 0, 0)) => {
        if (y < 50) {
            page = pdfDoc.addPage();
            y = height - 50;
        }
        page.drawText(text, {
            x: 50,
            y,
            size,
            font,
            color,
        });
        y -= size + 5;
    };

    drawText(`Fiche Projet - CERFA`, 20);
    y -= 20;

    drawText(`Projet: ${project.libelle}`, 14);
    drawText(`ID: ${project.id}`);
    drawText(`Date de démarrage: ${project.dateDemarrage ? new Date(project.dateDemarrage).toLocaleDateString() : 'N/A'}`);
    y -= 20;

    drawText(`Résumé des Diagnostics:`, 14);
    y -= 10;

    drawText(`Amiante: ${amianteTags.length} points de repérage`);
    drawText(`Plomb: ${plombTags.length} points de repérage`);
    drawText(`Termites: ${termiteTags.length} points de repérage`);
    drawText(`Structure: ${structureTags.length} points de repérage`);
    drawText(`Mails: ${tags.length} notes`);

    y -= 20;
    drawText(`Détails Amiante:`, 14);
    if (amianteTags.length > 0) {
        for (const tag of amianteTags) {
            const status = tag.presenceAmiante ? 'Présence' : 'Absence';
            drawText(`- ${status} | Type: ${tag.type || 'N/A'} | Étage: ${tag.etage || 'N/A'}`);
            if (tag.description) {
                // Simple truncation for description
                drawText(`  Note: ${tag.description.substring(0, 80)}${tag.description.length > 80 ? '...' : ''}`, 10);
            }
        }
    } else {
        drawText(`Aucun point de repérage amiante.`);
    }

    y -= 10;
    drawText(`Détails Plomb:`, 14);
    if (plombTags.length > 0) {
        for (const tag of plombTags) {
            const status = tag.presencePlomb ? 'Présence' : 'Absence';
            drawText(`- ${status} | Concentration: ${tag.concentration || 'N/A'} | Étage: ${tag.etage || 'N/A'}`);
        }
    } else {
        drawText(`Aucun point de repérage plomb.`);
    }

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cerfa_${project.id}.pdf"`
        }
    });
};
