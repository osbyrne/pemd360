DROP TABLE `user_projet`;--> statement-breakpoint
ALTER TABLE `user` ADD `societe_id` integer REFERENCES societe(id);--> statement-breakpoint
CREATE INDEX `user_societe_id_idx` ON `user` (`societe_id`);