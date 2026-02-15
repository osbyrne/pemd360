# Manual Migration Required

**Status:** Migration prepared but needs manual application to Turso database
**Date:** 2026-02-15

---

## Background

Due to issues with the Drizzle migration system (see `MIGRATION_ISSUES.md`), the schema cleanup migration needs to be applied manually to the Turso database.

## What Needs to Be Done

The following SQL changes need to be applied to your Turso database:

### Migration SQL

```sql
-- Schema cleanup migration

-- 1. Rename column in cerfa_diagnostic
ALTER TABLE cerfa_diagnostic RENAME COLUMN document_consultés TO documents_consultes;

-- 2. Rename foreign key column in etablissement
ALTER TABLE etablissement RENAME COLUMN id_societe_id TO societe_id;

-- 3. Rename foreign key column in projet
ALTER TABLE projet RENAME COLUMN id_etab_id TO etablissement_id;

-- 4. Rename foreign key column in tag_mail
ALTER TABLE tag_mail RENAME COLUMN projet_id_id TO projet_id;

-- 5. Drop old indexes
DROP INDEX IF EXISTS etablissement_id_societe_id_idx;
DROP INDEX IF EXISTS projet_id_etab_id_idx;
DROP INDEX IF EXISTS tag_mail_projet_id_id_idx;

-- 6. Create new indexes with updated names
CREATE INDEX etablissement_societe_id_idx ON etablissement(societe_id);
CREATE INDEX projet_etablissement_id_idx ON projet(etablissement_id);
CREATE INDEX tag_mail_projet_id_idx ON tag_mail(projet_id);

-- 7. Add missing indexes to pemd table
CREATE INDEX IF NOT EXISTS pemd_nature_id_idx ON pemd(nature_id);
CREATE INDEX IF NOT EXISTS pemd_objet_id_idx ON pemd(objet_id);
CREATE INDEX IF NOT EXISTS pemd_sid_id_idx ON pemd(sid_id);
```

---

## How to Apply

### Option 1: Using Turso CLI (Recommended)

```bash
# 1. Ensure Turso CLI is installed
# Visit https://docs.turso.tech/reference/turso-cli

# 2. Apply the migration
turso db shell pemd-primary-key-osbyrne < drizzle/0000_schema_cleanup.sql

# Or interactively:
turso db shell pemd-primary-key-osbyrne

# Then paste the SQL commands one by one
```

### Option 2: Using Turso Dashboard

1. Go to https://turso.tech/app
2. Select your database `pemd-primary-key-osbyrne`
3. Open the SQL console
4. Copy and paste the migration SQL from above
5. Execute each statement

### Option 3: Using Drizzle Studio

```bash
npx drizzle-kit studio
```

Then execute the SQL commands through the interface.

---

## After Migration is Applied

Once you've successfully applied the migration to the database, update the schema to use clean column names:

### 1. Update `src/lib/server/db/schema.ts`

Change these lines:

```typescript
// etablissement table
societeId: integer('societe_id')  // Change from: integer('id_societe_id')

// projet table
etablissementId: integer('etablissement_id')  // Change from: integer('id_etab_id')

// tagMail table
projetId: text('projet_id')  // Change from: text('projet_id_id')
```

### 2. Update index names in schema.ts

```typescript
// etablissement
index('etablissement_societe_id_idx')  // Change from: 'etablissement_id_societe_id_idx'

// projet
index('projet_etablissement_id_idx')  // Change from: 'projet_id_etab_id_idx'

// tagMail
index('tag_mail_projet_id_idx')  // Change from: 'tag_mail_projet_id_id_idx'
```

### 3. Test the application

```bash
npm run dev
```

Verify that:
- [ ] Projects list loads (`/app/projets`)
- [ ] Project details work
- [ ] PEMD tags can be created
- [ ] Admin pages function properly

### 4. Commit the schema updates

```bash
git add src/lib/server/db/schema.ts
git commit -m "Update schema to use clean column names after migration"
```

---

## Verification

After applying the migration, verify the changes:

```sql
-- Check column names
PRAGMA table_info(etablissement);
PRAGMA table_info(projet);
PRAGMA table_info(tag_mail);
PRAGMA table_info(cerfa_diagnostic);

-- Check indexes
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='etablissement';
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='projet';
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='tag_mail';
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='pemd';
```

Expected results:
- `etablissement` should have column `societe_id` (not `id_societe_id`)
- `projet` should have column `etablissement_id` (not `id_etab_id`)
- `tag_mail` should have column `projet_id` (not `projet_id_id`)
- `cerfa_diagnostic` should have column `documents_consultes` (not `document_consultés`)
- All tables should have their new indexes

---

## Current Workaround

Until the migration is applied, the application uses a workaround where:
- TypeScript code uses clean names (`etablissementId`, `societeId`, `projetId`)
- Drizzle maps these to old database column names (`id_etab_id`, `id_societe_id`, `projet_id_id`)

This allows the application to work while maintaining clean code, but the database still has the old column names.

---

## Troubleshooting

### If migration fails with "column not found"

The column may already have been renamed. Check the current schema:
```sql
PRAGMA table_info(table_name);
```

### If migration fails with "index already exists"

The index may already exist. You can skip that statement or drop it first:
```sql
DROP INDEX IF EXISTS index_name;
```

### If you need to rollback

```sql
-- Rollback column renames
ALTER TABLE etablissement RENAME COLUMN societe_id TO id_societe_id;
ALTER TABLE projet RENAME COLUMN etablissement_id TO id_etab_id;
ALTER TABLE tag_mail RENAME COLUMN projet_id TO projet_id_id;
ALTER TABLE cerfa_diagnostic RENAME COLUMN documents_consultes TO document_consultés;

-- Rollback indexes
DROP INDEX IF EXISTS etablissement_societe_id_idx;
DROP INDEX IF EXISTS projet_etablissement_id_idx;
DROP INDEX IF EXISTS tag_mail_projet_id_idx;

CREATE INDEX etablissement_id_societe_id_idx ON etablissement(id_societe_id);
CREATE INDEX projet_id_etab_id_idx ON projet(id_etab_id);
CREATE INDEX tag_mail_projet_id_id_idx ON tag_mail(projet_id_id);
```

---

## Questions?

If you encounter issues, refer to `MIGRATION_ISSUES.md` for detailed troubleshooting steps.
