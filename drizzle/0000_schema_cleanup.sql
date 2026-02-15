-- Migration: Schema cleanup and standardization
-- This migration applies all the schema improvements that have been committed

-- 1. Rename column: document_consultés → documents_consultes in cerfa_diagnostic
ALTER TABLE cerfa_diagnostic RENAME COLUMN document_consultés TO documents_consultes;--> statement-breakpoint

-- 2. Add NOT NULL constraints to pemd table for Matterport positioning fields
-- Note: SQLite doesn't support adding NOT NULL to existing columns directly
-- We need to check if data exists first, or recreate the table
-- For now, we'll document this needs to be done via table recreation if needed

-- 3. Rename foreign key columns for consistency
-- etablissement.id_societe_id → societe_id
ALTER TABLE etablissement RENAME COLUMN id_societe_id TO societe_id;--> statement-breakpoint

-- 4. Rename foreign key columns in projet table
-- projet.id_etab_id → etablissement_id
ALTER TABLE projet RENAME COLUMN id_etab_id TO etablissement_id;--> statement-breakpoint

-- 5. Rename foreign key column in tag_mail table
-- tag_mail.projet_id_id → projet_id
ALTER TABLE tag_mail RENAME COLUMN projet_id_id TO projet_id;--> statement-breakpoint

-- 6. Rename indexes to match new column names
DROP INDEX IF EXISTS etablissement_id_societe_id_idx;--> statement-breakpoint
CREATE INDEX etablissement_societe_id_idx ON etablissement(societe_id);--> statement-breakpoint

DROP INDEX IF EXISTS projet_id_etab_id_idx;--> statement-breakpoint
CREATE INDEX projet_etablissement_id_idx ON projet(etablissement_id);--> statement-breakpoint

DROP INDEX IF EXISTS tag_mail_projet_id_id_idx;--> statement-breakpoint
CREATE INDEX tag_mail_projet_id_idx ON tag_mail(projet_id);--> statement-breakpoint

-- 7. Add missing indexes if they don't exist (from Issue 4)
CREATE INDEX IF NOT EXISTS pemd_nature_id_idx ON pemd(nature_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS pemd_objet_id_idx ON pemd(objet_id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS pemd_sid_id_idx ON pemd(sid_id);--> statement-breakpoint

-- Note: The following changes require table recreation in SQLite:
-- - Adding NOT NULL to pemd.anchorPosition
-- - Adding NOT NULL to pemd.stemVector
-- - Adding defaults to account.updatedAt
-- - Adding defaults to session.updatedAt
-- These will be handled in a separate migration with proper data preservation
