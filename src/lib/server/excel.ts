import ExcelJS from 'exceljs';

// ============================================================================
// Shared Excel Utilities
// ============================================================================

type ColumnDef = { header: string; key: string; width: number };
type HeaderStyle = 'simple' | 'colored';

interface ExcelOptions {
	sheetName: string;
	columns: ColumnDef[];
	headerStyle?: HeaderStyle;
	autoFilter?: boolean;
}

/**
 * Creates a worksheet with standard configuration
 */
function createWorksheet(options: ExcelOptions): {
	workbook: ExcelJS.Workbook;
	worksheet: ExcelJS.Worksheet;
} {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet(options.sheetName);
	worksheet.columns = options.columns;

	// Style header
	if (options.headerStyle === 'colored') {
		worksheet.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF10B981' }
		};
		worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
	} else {
		worksheet.getRow(1).font = { bold: true };
	}

	// Auto-filter
	if (options.autoFilter !== false) {
		worksheet.autoFilter = {
			from: { row: 1, column: 1 },
			to: { row: 1, column: options.columns.length }
		};
	}

	return { workbook, worksheet };
}

/**
 * Finalizes workbook and returns buffer
 */
async function finalizeWorkbook(workbook: ExcelJS.Workbook): Promise<ExcelJS.Buffer> {
	return workbook.xlsx.writeBuffer();
}

/**
 * Calculates coefficient reemploi display value
 */
function calculateCoefficientReemploi(item: any): string {
	if (item.reemploi) return '100%';
	if (item.potentielReemploi) return item.potentielReemploi;
	return '0%';
}

// ============================================================================
// Excel Generation Functions
// ============================================================================

export async function generateRiskExcel(data: any[], type: string) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Inventaire',
		columns: [
			{ header: 'Nom du prélèvement', key: 'label', width: 30 },
			{ header: 'Description', key: 'description', width: 40 },
			{ header: 'Localisation', key: 'etage', width: 20 },
			{ header: 'Type', key: 'type', width: 15 },
			{ header: 'Projet', key: 'projet', width: 25 }
		],
		autoFilter: false
	});

	data.forEach((item) => {
		worksheet.addRow({
			label: item.label,
			description: item.description,
			etage: item.etage || '-',
			type: type,
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	return finalizeWorkbook(workbook);
}

export async function generateDechetsExcel(data: any[]) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Caractérisation Déchets',
		columns: [
			{ header: 'Catégorie', key: 'categorie', width: 25 },
			{ header: 'Objet', key: 'objet', width: 25 },
			{ header: 'Nature', key: 'nature', width: 25 },
			{ header: 'Code Déchet', key: 'codeDechet', width: 15 },
			{ header: 'Masse (Kg)', key: 'masse', width: 15 },
			{ header: 'Volume (m³)', key: 'volume', width: 15 },
			{ header: 'Eco Organisme', key: 'ecoOrganisme', width: 12 },
			{ header: 'Réutilisation', key: 'reutilisation', width: 12 },
			{ header: 'Recyclable', key: 'recyclable', width: 12 },
			{ header: 'Valo. Matière', key: 'valorisationMatiere', width: 12 },
			{ header: 'Valo. Énergétique', key: 'valorisationEnergetique', width: 15 },
			{ header: 'Incin. sans valo', key: 'incinerationSansValo', width: 15 },
			{ header: 'Enfouissement', key: 'nonValorisation', width: 15 },
			{ header: 'Conditions / Notes', key: 'description', width: 30 }
		]
	});

	data.forEach((item) => {
		worksheet.addRow({
			categorie: item.categorie || '-',
			objet: item.objet && item.objet !== item.categorie ? item.objet : '',
			nature: item.nature && item.nature !== item.objet ? item.nature : '',
			codeDechet: item.codeDechet || '-',
			masse: item.masse || 0,
			volume: item.volume || 0,
			ecoOrganisme: item.ecoOrganisme ? 'Oui' : 'Non',
			reutilisation: item.reutilisation === 1 ? 'Oui' : 'Non',
			recyclable: item.recyclable === 1 ? 'Oui' : 'Non',
			valorisationMatiere: item.valorisationMatiere === 1 ? 'Oui' : 'Non',
			valorisationEnergetique: item.valorisationEnergetique === 1 ? 'Oui' : 'Non',
			incinerationSansValo: item.incinerationSansValo === 1 ? 'Oui' : 'Non',
			nonValorisation: item.nonValorisation === 1 ? 'Oui' : 'Non',
			description: item.stockage || item.description || ''
		});
	});

	return finalizeWorkbook(workbook);
}

export async function generatePemExcel(data: any[]) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Inventaire PEMD',
		columns: [
			{ header: 'Groupe', key: 'groupe', width: 20 },
			{ header: 'Catégorie', key: 'categorie', width: 25 },
			{ header: 'Objet', key: 'objet', width: 25 },
			{ header: 'Nature', key: 'nature', width: 25 },
			{ header: 'État', key: 'etat', width: 15 },
			{ header: 'Quantité', key: 'quantite', width: 15 },
			{ header: 'Masse (Kg)', key: 'masse', width: 15 },
			{ header: 'Âge', key: 'estimationAge', width: 15 },
			{ header: 'Description', key: 'description', width: 40 },
			{ header: 'Localisation', key: 'etage', width: 20 },
			{ header: 'Projet', key: 'projet', width: 25 }
		]
	});

	data.forEach((item) => {
		worksheet.addRow({
			groupe: item.groupe || '-',
			categorie: item.categorie || '-',
			objet: item.objet || '-',
			nature: item.nature || '-',
			etat: item.etat || '-',
			quantite: item.quantite || 0,
			masse: item.masse || 0,
			estimationAge: item.estimationAge || '-',
			description: item.description || '',
			etage: item.etage || '-',
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	return finalizeWorkbook(workbook);
}

export async function generateReemploiExcel(data: any[]) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Inventaire Réemploi',
		columns: [
			{ header: 'PEMD', key: 'objet', width: 25 },
			{ header: 'Description', key: 'description', width: 40 },
			{ header: 'État', key: 'etat', width: 15 },
			{ header: 'Étage', key: 'etage', width: 20 },
			{ header: 'Potentiel réemploi', key: 'potentielReemploi', width: 20 },
			{ header: 'Coefficient réemploi', key: 'reemploi', width: 20 },
			{ header: 'Masse (T)', key: 'masse', width: 15 },
			{ header: 'Projet', key: 'projet', width: 25 }
		]
	});

	data.forEach((item) => {
		worksheet.addRow({
			objet: item.objet || 'Inconnu',
			description: item.description || '',
			etat: item.etat || '-',
			etage: item.etage || '-',
			potentielReemploi: item.potentielReemploi ? 'Oui' : 'Non',
			reemploi: item.reemploi || '-',
			masse: item.masse ? (item.masse / 1000).toFixed(3) : 0,
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	return finalizeWorkbook(workbook);
}

export async function generateTableauSyntheseExcel(data: any[]) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Tableaux Synthèse PEMD',
		columns: [
			{ header: 'PEMD', key: 'objet', width: 30 },
			{ header: 'Description', key: 'description', width: 40 },
			{ header: 'État', key: 'etat', width: 15 },
			{ header: 'Étage', key: 'etage', width: 15 },
			{ header: 'Potentiel réemploi', key: 'potentielReemploi', width: 20 },
			{ header: 'Coefficient réemploi', key: 'coefficientReemploi', width: 20 },
			{ header: 'Projet', key: 'projet', width: 25 }
		],
		headerStyle: 'colored'
	});

	data.forEach((item) => {
		worksheet.addRow({
			objet: item.objet || '-',
			description: item.description || '',
			etat: item.etat || '-',
			etage: item.etage || '-',
			potentielReemploi: item.potentielReemploi || '-',
			coefficientReemploi: calculateCoefficientReemploi(item),
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	return finalizeWorkbook(workbook);
}

export async function generateTableauSyntheseReemploiExcel(data: any[]) {
	const { workbook, worksheet } = createWorksheet({
		sheetName: 'Tableau Synthèse Réemploi',
		columns: [
			{ header: 'Description', key: 'description', width: 40 },
			{ header: 'État', key: 'etat', width: 15 },
			{ header: 'Étage', key: 'etage', width: 15 },
			{ header: 'Potentiel réemploi', key: 'potentielReemploi', width: 20 },
			{ header: 'Coefficient réemploi', key: 'coefficientReemploi', width: 20 },
			{ header: 'Projet', key: 'projet', width: 25 }
		],
		headerStyle: 'colored'
	});

	data.forEach((item) => {
		worksheet.addRow({
			description: item.description || item.objet || '-',
			etat: item.etat || '-',
			etage: item.etage || '-',
			potentielReemploi: item.potentielReemploi || '-',
			coefficientReemploi: calculateCoefficientReemploi(item),
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	return finalizeWorkbook(workbook);
}
