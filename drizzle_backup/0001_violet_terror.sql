PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_pemd` (
	`id` text PRIMARY KEY NOT NULL,
	`nature_id` integer,
	`objet_id` integer,
	`sid_id` text(50) NOT NULL,
	`description` text,
	`quantite` real,
	`potentiel_reemploi` text,
	`longueur` real,
	`largeur` real,
	`epaisseur` real,
	`volume` real,
	`reemploi` integer,
	`etage` text,
	`constitution` text(100),
	`masse` real,
	`etat` text(100),
	`anchor_position` text,
	`stem_vector` text,
	`color` text,
	`image` text,
	`surface` real,
	`dimension` text,
	`amiante` integer,
	`plombifere` integer,
	`termite` integer,
	`typologie_appart` text,
	`estimation_age` text,
	`type_assemblage` text,
	FOREIGN KEY (`nature_id`) REFERENCES `nature_v2`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`objet_id`) REFERENCES `objets`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sid_id`) REFERENCES `projet`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_pemd`("id", "nature_id", "objet_id", "sid_id", "description", "quantite", "potentiel_reemploi", "longueur", "largeur", "epaisseur", "volume", "reemploi", "etage", "constitution", "masse", "etat", "anchor_position", "stem_vector", "color", "image", "surface", "dimension", "amiante", "plombifere", "termite", "typologie_appart", "estimation_age", "type_assemblage") SELECT "id", "nature_id", "objet_id", "sid_id", "description", "quantite", "potentiel_reemploi", "longueur", "largeur", "epaisseur", "volume", "reemploi", "etage", "constitution", "masse", "etat", "anchor_position", "stem_vector", "color", "image", "surface", "dimension", "amiante", "plombifere", "termite", "typologie_appart", "estimation_age", "type_assemblage" FROM `pemd`;--> statement-breakpoint
DROP TABLE `pemd`;--> statement-breakpoint
ALTER TABLE `__new_pemd` RENAME TO `pemd`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `pemd_nature_id_idx` ON `pemd` (`nature_id`);--> statement-breakpoint
CREATE INDEX `pemd_objet_id_idx` ON `pemd` (`objet_id`);--> statement-breakpoint
CREATE INDEX `pemd_sid_id_idx` ON `pemd` (`sid_id`);