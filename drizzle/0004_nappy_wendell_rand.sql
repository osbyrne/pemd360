CREATE TABLE `user_projet` (
	`user_id` text NOT NULL,
	`projet_id` text(50) NOT NULL,
	`role` text(50) DEFAULT 'member',
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `projet_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`projet_id`) REFERENCES `projet`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_projet_projet_id_idx` ON `user_projet` (`projet_id`);