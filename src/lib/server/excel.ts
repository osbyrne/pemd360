import ExcelJS from 'exceljs';

export async function generateRiskExcel(data: any[], type: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventaire');

    worksheet.columns = [
        { header: 'Nom du prélèvement', key: 'label', width: 30 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Localisation', key: 'etage', width: 20 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Projet', key: 'projet', width: 25 },
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };

    data.forEach(item => {
        worksheet.addRow({
            label: item.label,
            description: item.description,
            etage: item.etage || '-',
            type: type,
            projet: item.projetNom || 'Projet inconnu'
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
}
