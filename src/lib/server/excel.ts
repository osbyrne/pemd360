import ExcelJS from 'exceljs';

export async function generateRiskExcel(data: any[], type: string) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Inventaire');

	worksheet.columns = [
		{ header: 'Nom du prélèvement', key: 'label', width: 30 },
		{ header: 'Description', key: 'description', width: 40 },
		{ header: 'Localisation', key: 'etage', width: 20 },
		{ header: 'Type', key: 'type', width: 15 },
		{ header: 'Projet', key: 'projet', width: 25 }
	];

	// Style the header
	worksheet.getRow(1).font = { bold: true };

	data.forEach((item) => {
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

export async function generateDechetsExcel(data: any[]) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Caractérisation Déchets');

	worksheet.columns = [
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
	];

	// Style the header
	worksheet.getRow(1).font = { bold: true };

	// Auto-filter
	worksheet.autoFilter = {
		from: {
			row: 1,
			column: 1
		},
		to: {
			row: 1,
			column: 14
		}
	};

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

	const buffer = await workbook.xlsx.writeBuffer();
	return buffer;
}

export async function generatePemExcel(data: any[]) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Inventaire PEMD');

	worksheet.columns = [
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
	];

	// Style the header
	worksheet.getRow(1).font = { bold: true };

	// Auto-filter
	worksheet.autoFilter = {
		from: {
			row: 1,
			column: 1
		},
		to: {
			row: 1,
			column: 11
		}
	};

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

	const buffer = await workbook.xlsx.writeBuffer();
	return buffer;
}

export async function generateReemploiExcel(data: any[]) {
	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Inventaire Réemploi');

	worksheet.columns = [
		{ header: 'PEMD', key: 'objet', width: 25 },
		{ header: 'Description', key: 'description', width: 40 },
		{ header: 'État', key: 'etat', width: 15 },
		{ header: 'Étage', key: 'etage', width: 20 },
		{ header: 'Potentiel réemploi', key: 'potentielReemploi', width: 20 },
		{ header: 'Coefficient réemploi', key: 'reemploi', width: 20 },
		{ header: 'Masse (T)', key: 'masse', width: 15 },
		{ header: 'Projet', key: 'projet', width: 25 }
	];

	// Style the header
	worksheet.getRow(1).font = { bold: true };

	// Auto-filter
	worksheet.autoFilter = {
		from: {
			row: 1,
			column: 1
		},
		to: {
			row: 1,
			column: 8
		}
	};

	data.forEach((item) => {
		worksheet.addRow({
			objet: item.objet || 'Inconnu',
			description: item.description || '',
			etat: item.etat || '-',
			etage: item.etage || '-',
			potentielReemploi: item.potentielReemploi ? 'Oui' : 'Non',
			reemploi: item.reemploi || '-', // Assuming coefficient is stored in 'reemploi' column or we need to check schema. Page uses 'reemploi'
			masse: item.masse ? (item.masse / 1000).toFixed(3) : 0,
			projet: item.projetNom || 'Projet inconnu'
		});
	});

	const buffer = await workbook.xlsx.writeBuffer();
	return buffer;
}
