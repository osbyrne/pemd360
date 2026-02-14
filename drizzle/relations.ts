import { relations } from "drizzle-orm/relations";
import { user, account, session, groupe, categorieV2, projet, cerfaMtrOuvrage, societe, etablissement, extrapolation, objets, tagsAmiante, tagsPlomb, tagsTermite, cerfaDiagnostic, cerfaDiagnostiqueur, cerfaOperation, userProjet, tagMail, pemd, natureV2 } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	userProjets: many(userProjet),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const categorieV2Relations = relations(categorieV2, ({one, many}) => ({
	groupe: one(groupe, {
		fields: [categorieV2.groupeId],
		references: [groupe.id]
	}),
	objets: many(objets),
}));

export const groupeRelations = relations(groupe, ({many}) => ({
	categorieV2s: many(categorieV2),
}));

export const cerfaMtrOuvrageRelations = relations(cerfaMtrOuvrage, ({one}) => ({
	projet: one(projet, {
		fields: [cerfaMtrOuvrage.projetId],
		references: [projet.id]
	}),
}));

export const projetRelations = relations(projet, ({one, many}) => ({
	cerfaMtrOuvrages: many(cerfaMtrOuvrage),
	extrapolations: many(extrapolation),
	tagsAmiantes: many(tagsAmiante),
	tagsPlombs: many(tagsPlomb),
	tagsTermites: many(tagsTermite),
	cerfaDiagnostics: many(cerfaDiagnostic),
	cerfaDiagnostiqueurs: many(cerfaDiagnostiqueur),
	cerfaOperations: many(cerfaOperation),
	etablissement_idEtabId: one(etablissement, {
		fields: [projet.idEtabId],
		references: [etablissement.id],
		relationName: "projet_idEtabId_etablissement_id"
	}),
	etablissement_idEtablissementId: one(etablissement, {
		fields: [projet.idEtablissementId],
		references: [etablissement.id],
		relationName: "projet_idEtablissementId_etablissement_id"
	}),
	userProjets: many(userProjet),
	tagMails: many(tagMail),
	pemds: many(pemd),
}));

export const etablissementRelations = relations(etablissement, ({one, many}) => ({
	societe: one(societe, {
		fields: [etablissement.idSocieteId],
		references: [societe.id]
	}),
	projets_idEtabId: many(projet, {
		relationName: "projet_idEtabId_etablissement_id"
	}),
	projets_idEtablissementId: many(projet, {
		relationName: "projet_idEtablissementId_etablissement_id"
	}),
}));

export const societeRelations = relations(societe, ({many}) => ({
	etablissements: many(etablissement),
}));

export const extrapolationRelations = relations(extrapolation, ({one}) => ({
	projet: one(projet, {
		fields: [extrapolation.sidId],
		references: [projet.id]
	}),
}));

export const objetsRelations = relations(objets, ({one, many}) => ({
	categorieV2: one(categorieV2, {
		fields: [objets.categorieId],
		references: [categorieV2.id]
	}),
	pemds: many(pemd),
}));

export const tagsAmianteRelations = relations(tagsAmiante, ({one}) => ({
	projet: one(projet, {
		fields: [tagsAmiante.sidId],
		references: [projet.id]
	}),
}));

export const tagsPlombRelations = relations(tagsPlomb, ({one}) => ({
	projet: one(projet, {
		fields: [tagsPlomb.sidId],
		references: [projet.id]
	}),
}));

export const tagsTermiteRelations = relations(tagsTermite, ({one}) => ({
	projet: one(projet, {
		fields: [tagsTermite.sidId],
		references: [projet.id]
	}),
}));

export const cerfaDiagnosticRelations = relations(cerfaDiagnostic, ({one}) => ({
	projet: one(projet, {
		fields: [cerfaDiagnostic.projetId],
		references: [projet.id]
	}),
}));

export const cerfaDiagnostiqueurRelations = relations(cerfaDiagnostiqueur, ({one}) => ({
	projet: one(projet, {
		fields: [cerfaDiagnostiqueur.projetId],
		references: [projet.id]
	}),
}));

export const cerfaOperationRelations = relations(cerfaOperation, ({one}) => ({
	projet: one(projet, {
		fields: [cerfaOperation.projetId],
		references: [projet.id]
	}),
}));

export const userProjetRelations = relations(userProjet, ({one}) => ({
	projet: one(projet, {
		fields: [userProjet.projetId],
		references: [projet.id]
	}),
	user: one(user, {
		fields: [userProjet.userId],
		references: [user.id]
	}),
}));

export const tagMailRelations = relations(tagMail, ({one}) => ({
	projet: one(projet, {
		fields: [tagMail.projetIdId],
		references: [projet.id]
	}),
}));

export const pemdRelations = relations(pemd, ({one}) => ({
	projet: one(projet, {
		fields: [pemd.sidId],
		references: [projet.id]
	}),
	objet: one(objets, {
		fields: [pemd.objetId],
		references: [objets.id]
	}),
	natureV2: one(natureV2, {
		fields: [pemd.natureId],
		references: [natureV2.id]
	}),
}));

export const natureV2Relations = relations(natureV2, ({many}) => ({
	pemds: many(pemd),
}));