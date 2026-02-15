import {
	sqliteTable,
	index,
	text,
	integer,
	uniqueIndex,
	real,
	primaryKey
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const account = sqliteTable(
	'account',
	{
		id: text().primaryKey().notNull(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at'),
		refreshTokenExpiresAt: integer('refresh_token_expires_at'),
		scope: text(),
		password: text(),
		createdAt: integer('created_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const session = sqliteTable(
	'session',
	{
		id: text().primaryKey().notNull(),
		expiresAt: integer('expires_at').notNull(),
		token: text().notNull(),
		createdAt: integer('created_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [
		index('session_userId_idx').on(table.userId),
		uniqueIndex('session_token_unique').on(table.token)
	]
);

export const user = sqliteTable(
	'user',
	{
		id: text().primaryKey().notNull(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: integer('email_verified').default(false).notNull(),
		image: text(),
		createdAt: integer('created_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		role: text(),
		banned: integer().default(0),
		banReason: text('ban_reason'),
		banExpires: integer('ban_expires')
	},
	(table) => [uniqueIndex('user_email_unique').on(table.email)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text().primaryKey().notNull(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: integer('expires_at').notNull(),
		createdAt: integer('created_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at')
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const categorieV2 = sqliteTable(
	'categorie_v2',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		groupeId: integer('groupe_id')
			.notNull()
			.references(() => groupe.id),
		categoriev2: text({ length: 255 }).notNull()
	},
	(table) => [index('categorie_v2_groupe_id_idx').on(table.groupeId)]
);

export const cerfaMtrOuvrage = sqliteTable(
	'cerfa_mtr_ouvrage',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		projetId: text('projet_id', { length: 50 }).references(() => projet.id),
		nomPerPhy: text('nom_per_phy', { length: 255 }),
		prenomPerPhy: text('prenom_per_phy', { length: 255 }),
		nomPerMorale: text('nom_per_morale', { length: 255 }),
		siretSiren: text('siret_siren', { length: 255 }),
		adresse: text({ length: 255 }),
		cp: text({ length: 5 }),
		commune: text({ length: 255 })
	},
	(table) => [index('cerfa_mtr_ouvrage_projet_id_idx').on(table.projetId)]
);

export const etablissement = sqliteTable(
	'etablissement',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		idSocieteId: integer('id_societe_id')
			.notNull()
			.references(() => societe.id),
		nom: text({ length: 255 }).notNull(),
		raisonSocial: text('raison_social', { length: 50 }).notNull(),
		rue: text({ length: 255 }).notNull(),
		cp: text({ length: 5 }).notNull(),
		ville: text({ length: 255 }).notNull(),
		tel: text({ length: 255 }).notNull(),
		fax: text({ length: 255 }).notNull(),
		email: text({ length: 255 }).notNull(),
		siret: text({ length: 255 }).notNull()
	},
	(table) => [index('etablissement_id_societe_id_idx').on(table.idSocieteId)]
);

export const extrapolation = sqliteTable(
	'extrapolation',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		sidId: text('sid_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		extrapolationData: text('extrapolation_data').notNull(),
		constitution: text({ length: 10000 })
	},
	(table) => [index('extrapolation_sid_id_idx').on(table.sidId)]
);

export const groupe = sqliteTable('groupe', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	groupe: text({ length: 255 }).notNull()
});

export const natureV2 = sqliteTable('nature_v2', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	nature: text({ length: 255 }).notNull(),
	reutilisation: integer(),
	recyclable: integer(),
	valorisationMatiere: integer('valorisation_matiere'),
	valorisationEnergetique: integer('valorisation_energetique'),
	densite: real(),
	stockage: text({ length: 100 }),
	codeDechet: integer('code_dechet'),
	ecoOrganismeRep: text('eco_organisme_rep', { length: 255 }),
	incinerationSansValorisationEnergetique: integer('incineration_sans_valorisation_energetique'),
	nonValorisation: integer('non_valorisation')
});

export const objets = sqliteTable(
	'objets',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		categorieId: integer('categorie_id')
			.notNull()
			.references(() => categorieV2.id),
		objet: text({ length: 255 }).notNull(),
		unite: text({ length: 100 }),
		deposeReemlpoi: text('depose_reemlpoi'),
		deposeDechet: text('depose_dechet'),
		masseUnitaire: text('masse_unitaire', { length: 255 })
	},
	(table) => [index('objets_categorie_id_idx').on(table.categorieId)]
);

export const societe = sqliteTable('societe', {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	nom: text({ length: 255 }).notNull(),
	raisonSocial: text('raison_social', { length: 255 }).notNull(),
	rue: text({ length: 255 }).notNull(),
	cp: text({ length: 5 }).notNull(),
	ville: text({ length: 255 }).notNull(),
	tel: text({ length: 15 }).notNull(),
	fax: text({ length: 15 }).notNull(),
	email: text({ length: 255 }).notNull(),
	siren: text({ length: 255 }),
	type: integer().notNull()
});

export const tagsAmiante = sqliteTable(
	'tags_amiante',
	{
		id: text({ length: 50 }).primaryKey().notNull(),
		sidId: text('sid_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		label: text({ length: 255 }).notNull(),
		description: text({ length: 255 }).notNull(),
		anchorPosition: text('anchor_position', { length: 300 }).notNull(),
		stemVector: text('stem_vector', { length: 255 }).notNull(),
		image: text().notNull(),
		presenceAmiante: integer('presence_amiante').notNull(),
		type: text({ length: 255 }).notNull(),
		brusharray: text(),
		customImage: text('custom_image').notNull(),
		etage: text({ length: 100 }).notNull()
	},
	(table) => [index('tags_amiante_sid_id_idx').on(table.sidId)]
);

export const tagsPlomb = sqliteTable(
	'tags_plomb',
	{
		id: text({ length: 50 }).primaryKey().notNull(),
		sidId: text('sid_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		label: text({ length: 255 }).notNull(),
		description: text({ length: 500 }).notNull(),
		anchorPosition: text('anchor_position', { length: 500 }).notNull(),
		stemVector: text('stem_vector', { length: 500 }).notNull(),
		image: text().notNull(),
		presencePlomb: integer('presence_plomb').notNull(),
		concentration: integer(),
		brusharray: text(),
		customImage: text('custom_image').notNull(),
		etage: text({ length: 100 }).notNull()
	},
	(table) => [index('tags_plomb_sid_id_idx').on(table.sidId)]
);

export const tagsTermite = sqliteTable(
	'tags_termite',
	{
		id: text({ length: 50 }).primaryKey().notNull(),
		sidId: text('sid_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		label: text({ length: 255 }).notNull(),
		description: text({ length: 500 }).notNull(),
		anchorPosition: text('anchor_position', { length: 500 }).notNull(),
		stemVector: text('stem_vector', { length: 500 }).notNull(),
		image: text().notNull(),
		presenceTermite: integer('presence_termite').notNull(),
		brusharray: text(),
		customImage: text('custom_image').notNull(),
		etage: text({ length: 100 }).notNull()
	},
	(table) => [index('tags_termite_sid_id_idx').on(table.sidId)]
);

export const cerfaDiagnostic = sqliteTable(
	'cerfa_diagnostic',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		projetId: text('projet_id', { length: 50 }).references(() => projet.id),
		derniereVisite: integer('derniere_visite'),
		batNonVisite: text('bat_non_visite'),
		raisonsNePasVisite: text('raisons_ne_pas_visite'),
		desordres: integer(),
		precaution: integer(),
		documentsConsultes: text('documents_consultes'),
		batVisite: text('bat_visite')
	},
	(table) => [index('cerfa_diagnostic_projet_id_idx').on(table.projetId)]
);

export const cerfaDiagnostiqueur = sqliteTable(
	'cerfa_diagnostiqueur',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		projetId: text('projet_id', { length: 50 }).references(() => projet.id),
		nomPerPhy: text('nom_per_phy', { length: 255 }),
		prenomPerPhy: text('prenom_per_phy', { length: 255 }),
		nomPerMorale: text('nom_per_morale', { length: 255 }),
		siretSiren: text('siret_siren', { length: 255 }),
		adresse: text({ length: 255 }),
		cp: text({ length: 5 }),
		commune: text({ length: 255 }),
		engagementAssurance: integer('engagement_assurance'),
		nomAssurance: text('nom_assurance', { length: 255 }),
		numeroPolice: text('numero_police', { length: 255 }),
		dateDebutAssurance: integer('date_debut_assurance'),
		dateFinAssurance: integer('date_fin_assurance'),
		competences: integer()
	},
	(table) => [index('cerfa_diagnostiqueur_projet_id_idx').on(table.projetId)]
);

export const cerfaOperation = sqliteTable(
	'cerfa_operation',
	{
		id: integer().primaryKey({ autoIncrement: true }).notNull(),
		projetId: text('projet_id', { length: 50 }).references(() => projet.id),
		adresse: text({ length: 500 }),
		cp: text({ length: 5 }),
		commune: text({ length: 255 }),
		dateDeDebut: integer('date_de_debut'),
		dateDeFin: integer('date_de_fin'),
		operation: text(),
		nbBatDemolition: real('nb_bat_demolition'),
		surfaceADemolir: real('surface_a_demolir'),
		nbBatRenovation: real('nb_bat_renovation'),
		surfaceARenover: real('surface_a_renover'),
		typologieBat: text('typologie_bat'),
		datePermisDeConstruire: integer('date_permis_de_construire'),
		operationSoumis: text('operation_soumis')
	},
	(table) => [index('cerfa_operation_projet_id_idx').on(table.projetId)]
);

export const doctrineMigrationVersions = sqliteTable('doctrine_migration_versions', {
	version: text({ length: 191 }).primaryKey().notNull(),
	executedAt: integer('executed_at'),
	executionTime: integer('execution_time')
});

export const tagMail = sqliteTable(
	'tag_mail',
	{
		id: text({ length: 255 }).primaryKey().notNull(),
		projetIdId: text('projet_id_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		date: integer().notNull(),
		content: text().notNull(),
		stemVector: text('stem_vector', { length: 1000 }).notNull(),
		anchorPosition: text('anchor_position', { length: 1000 }).notNull(),
		destinataires: text({ length: 300 }).notNull()
	},
	(table) => [index('tag_mail_projet_id_id_idx').on(table.projetIdId)]
);

export const projet = sqliteTable(
	'projet',
	{
		id: text({ length: 50 }).primaryKey().notNull(),
		idEtablissementId: integer('id_etablissement_id').references(() => etablissement.id),
		idEtabId: integer('id_etab_id')
			.notNull()
			.references(() => etablissement.id),
		libelle: text({ length: 255 }).notNull(),
		reference: text({ length: 255 }).notNull(),
		codeInsee: text('code_insee', { length: 5 }).notNull(),
		rue: text({ length: 255 }).notNull(),
		cp: text({ length: 5 }).notNull(),
		ville: text({ length: 255 }).notNull(),
		dateDemarrage: integer('date_demarrage').notNull(),
		section: text({ length: 10 }).notNull(),
		parcelle: text({ length: 10 }).notNull(),
		typeOperation: text('type_operation', { length: 255 }),
		maitreDOuvrage: text('maitre_d_ouvrage', { length: 255 }),
		dateDeFin: integer('date_de_fin')
	},
	(table) => [
		index('projet_id_etab_id_idx').on(table.idEtabId),
		index('projet_id_etablissement_id_idx').on(table.idEtablissementId)
	]
);

export const userProjet = sqliteTable(
	'user_projet',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		projetId: text('projet_id', { length: 50 })
			.notNull()
			.references(() => projet.id, { onDelete: 'cascade' })
	},
	(table) => [
		index('user_projet_projet_id_idx').on(table.projetId),
		primaryKey({
			columns: [table.userId, table.projetId],
			name: 'user_projet_user_id_projet_id_pk'
		})
	]
);

export const pemd = sqliteTable(
	'pemd',
	{
		id: text().primaryKey().notNull(),
		natureId: integer('nature_id').references(() => natureV2.id),
		objetId: integer('objet_id').references(() => objets.id),
		sidId: text('sid_id', { length: 50 })
			.notNull()
			.references(() => projet.id),
		description: text(),
		quantite: real(),
		potentielReemploi: text('potentiel_reemploi'),
		longueur: real(),
		largeur: real(),
		epaisseur: real(),
		volume: real(),
		reemploi: integer(),
		etage: text(),
		constitution: text({ length: 100 }),
		masse: real(),
		etat: text({ length: 100 }),
		anchorPosition: text('anchor_position'),
		stemVector: text('stem_vector'),
		color: text(),
		image: text(),
		surface: real(),
		dimension: text(),
		amiante: integer(),
		plombifere: integer(),
		termite: integer(),
		typologieAppart: text('typologie_appart'),
		estimationAge: text('estimation_age'),
		typeAssemblage: text('type_assemblage')
	},
	(table) => [
		index('pemd_nature_id_idx').on(table.natureId),
		index('pemd_objet_id_idx').on(table.objetId),
		index('pemd_sid_id_idx').on(table.sidId)
	]
);
