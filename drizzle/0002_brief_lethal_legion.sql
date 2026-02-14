DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "categorie_v2_groupe_id_idx";--> statement-breakpoint
DROP INDEX "cerfa_diagnostic_projet_id_idx";--> statement-breakpoint
DROP INDEX "cerfa_diagnostiqueur_projet_id_idx";--> statement-breakpoint
DROP INDEX "cerfa_mtr_ouvrage_projet_id_idx";--> statement-breakpoint
DROP INDEX "cerfa_operation_projet_id_idx";--> statement-breakpoint
DROP INDEX "etablissement_id_societe_id_idx";--> statement-breakpoint
DROP INDEX "extrapolation_sid_id_idx";--> statement-breakpoint
DROP INDEX "objets_categorie_id_idx";--> statement-breakpoint
DROP INDEX "pemd_nature_id_idx";--> statement-breakpoint
DROP INDEX "pemd_objet_id_idx";--> statement-breakpoint
DROP INDEX "pemd_sid_id_idx";--> statement-breakpoint
DROP INDEX "projet_id_etab_id_idx";--> statement-breakpoint
DROP INDEX "projet_id_etablissement_id_idx";--> statement-breakpoint
DROP INDEX "projet_user_user_id_idx";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "tag_mail_user_id_id_idx";--> statement-breakpoint
DROP INDEX "tag_mail_projet_id_id_idx";--> statement-breakpoint
DROP INDEX "tags_amiante_sid_id_idx";--> statement-breakpoint
DROP INDEX "tags_plomb_sid_id_idx";--> statement-breakpoint
DROP INDEX "tags_termite_sid_id_idx";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_legacy_id_etab_id_idx";--> statement-breakpoint
DROP INDEX "user_projet_projet_id_idx";--> statement-breakpoint
DROP INDEX "verification_identifier_idx";--> statement-breakpoint
ALTER TABLE `account` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer));--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `categorie_v2_groupe_id_idx` ON `categorie_v2` (`groupe_id`);--> statement-breakpoint
CREATE INDEX `cerfa_diagnostic_projet_id_idx` ON `cerfa_diagnostic` (`projet_id`);--> statement-breakpoint
CREATE INDEX `cerfa_diagnostiqueur_projet_id_idx` ON `cerfa_diagnostiqueur` (`projet_id`);--> statement-breakpoint
CREATE INDEX `cerfa_mtr_ouvrage_projet_id_idx` ON `cerfa_mtr_ouvrage` (`projet_id`);--> statement-breakpoint
CREATE INDEX `cerfa_operation_projet_id_idx` ON `cerfa_operation` (`projet_id`);--> statement-breakpoint
CREATE INDEX `etablissement_id_societe_id_idx` ON `etablissement` (`id_societe_id`);--> statement-breakpoint
CREATE INDEX `extrapolation_sid_id_idx` ON `extrapolation` (`sid_id`);--> statement-breakpoint
CREATE INDEX `objets_categorie_id_idx` ON `objets` (`categorie_id`);--> statement-breakpoint
CREATE INDEX `pemd_nature_id_idx` ON `pemd` (`nature_id`);--> statement-breakpoint
CREATE INDEX `pemd_objet_id_idx` ON `pemd` (`objet_id`);--> statement-breakpoint
CREATE INDEX `pemd_sid_id_idx` ON `pemd` (`sid_id`);--> statement-breakpoint
CREATE INDEX `projet_id_etab_id_idx` ON `projet` (`id_etab_id`);--> statement-breakpoint
CREATE INDEX `projet_id_etablissement_id_idx` ON `projet` (`id_etablissement_id`);--> statement-breakpoint
CREATE INDEX `projet_user_user_id_idx` ON `projet_user` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `tag_mail_user_id_id_idx` ON `tag_mail` (`user_id_id`);--> statement-breakpoint
CREATE INDEX `tag_mail_projet_id_id_idx` ON `tag_mail` (`projet_id_id`);--> statement-breakpoint
CREATE INDEX `tags_amiante_sid_id_idx` ON `tags_amiante` (`sid_id`);--> statement-breakpoint
CREATE INDEX `tags_plomb_sid_id_idx` ON `tags_plomb` (`sid_id`);--> statement-breakpoint
CREATE INDEX `tags_termite_sid_id_idx` ON `tags_termite` (`sid_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_legacy_id_etab_id_idx` ON `user_legacy` (`id_etab_id`);--> statement-breakpoint
CREATE INDEX `user_projet_projet_id_idx` ON `user_projet` (`projet_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
ALTER TABLE `session` ALTER COLUMN "updated_at" TO "updated_at" integer NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer));