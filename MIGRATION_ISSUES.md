# Database Migration Issues and Resolution Guide

**Date:** 2026-02-15
**Status:** Schema changes committed, database sync pending

---

## Overview

During the process of fixing database schema issues identified in `DATABASE_SCHEMA_ISSUES.md`, we encountered several migration-related problems that prevented schema changes from being applied to the remote Turso database. This document explains what went wrong, why it happened, and the recommended steps to resolve it.

---

## Issues Encountered

### 1. Migration 0000 is Commented Out

**Problem:**
The initial migration file `drizzle/0000_wakeful_crystal.sql` is entirely wrapped in SQL block comments (`/* ... */`), making it non-executable.

```sql
-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `account` (
  ...
);
...
*/
```

**Impact:**
- The migration system expects migration 0000 to have been applied
- The database was likely created through a different mechanism (manual SQL, different tool, etc.)
- This creates a mismatch between the migration journal and actual database state

**Why it happened:**
Migration 0000 was generated using `drizzle-kit introspect`, which creates a commented-out migration as a snapshot of an existing database rather than an executable migration.

---

### 2. Missing Migration 0004 SQL File

**Problem:**
The migration journal (`drizzle/meta/_journal.json`) references migration `0004_cynical_scorpion`, but the corresponding SQL file was missing or had been deleted.

**Error:**
```
Error: No file drizzle/0004_cynical_scorpion.sql found in drizzle folder
```

**Impact:**
- Cannot run `drizzle-kit migrate` because it tries to apply all migrations in sequence
- Any migration after 0003 fails immediately

**Why it happened:**
Likely the migration file was deleted or not committed, but the journal entry remained.

---

### 3. SQL Parse Errors with Block Comments

**Problem:**
When attempting to apply migrations, we encountered parse errors related to block comments.

**Error:**
```
SQL_PARSE_ERROR: SQL string could not be parsed: non-terminated block comment at (3, 1)
```

**Impact:**
- Migrations fail to parse
- Cannot apply any pending migrations

**Why it happened:**
- Migration files had formatting issues (missing `--> statement-breakpoint` comments)
- The commented-out migration 0000 may have confused the parser
- libSQL/Turso has stricter SQL parsing than SQLite

---

### 4. Schema Mismatch Between Code and Database

**Problem:**
The database schema on Turso doesn't match what's in `schema.ts`. For example:
- `pemd` table missing indexes (`pemd_nature_id_idx`, etc.)
- Column names don't match (schema says `etablissement_id`, database has `id_etab_id`)

**Error:**
```
LibsqlError: SQLITE_UNKNOWN: SQLite error: no such index: pemd_nature_id_idx
```

**Impact:**
- `drizzle-kit push` fails when trying to sync schema
- Application breaks when schema uses new column names that don't exist in database

**Root cause:**
The migration history is out of sync - some changes were made to the schema that never had corresponding migrations applied to the database.

---

## Current State

### What's Been Done

1. ✅ **Schema Improvements Committed**
   - Fixed postal code types (text with length 5)
   - Added indexes to pemd table foreign keys
   - Removed redundant columns
   - Standardized naming conventions
   - Added required constraints

2. ✅ **Hotfix Applied**
   - Restored database column names to match actual Turso database
   - Kept improved TypeScript property names
   - Application is now working despite schema/database mismatch

3. ✅ **Documentation Created**
   - All issues documented in DATABASE_SCHEMA_ISSUES.md
   - Each fix has a separate commit for tracking

### Current Workaround

We're using Drizzle's ability to map TypeScript properties to different database column names:

```typescript
// TypeScript property name (clean, improved)
etablissementId: integer('id_etab_id')  // Database column name (actual)
```

This allows the code to use improved names while querying the correct columns in the database.

---

## Recommended Resolution Steps

### Option A: Clean Slate Migration (Recommended)

This approach creates a new baseline and applies all pending changes cleanly.

#### Step 1: Backup Everything
```bash
# Backup the Turso database
turso db shell your-database-name ".backup backup.sql"

# Or export data
turso db shell your-database-name ".dump" > turso_backup.sql
```

#### Step 2: Create a Fresh Baseline Migration

```bash
# 1. Remove all existing migration files (keep a backup!)
mkdir drizzle_old_migrations
mv drizzle/*.sql drizzle_old_migrations/
mv drizzle/meta/*.json drizzle_old_migrations/

# 2. Introspect the ACTUAL current database state
npx drizzle-kit introspect

# This creates a new 0000 migration reflecting the actual database

# 3. Uncomment the new 0000 migration (it will be commented out)
# Edit drizzle/0000_*.sql and remove the /* */ comments

# 4. Update the journal to mark 0000 as applied
# Edit drizzle/meta/_journal.json - the entry should exist
```

#### Step 3: Generate Migration for All Schema Changes

```bash
# This will compare your schema.ts with the database and generate
# a migration with all the differences
npx drizzle-kit generate
```

This should create a migration (0001_*.sql) containing:
- Column renames (id_etab_id → etablissement_id, etc.)
- Index updates
- Constraint additions
- Any other schema differences

#### Step 4: Review and Apply Migration

```bash
# Review the generated migration
cat drizzle/0001_*.sql

# If it looks correct, apply it
npx drizzle-kit migrate
```

#### Step 5: Update Schema to Use New Column Names

Once the migration is applied, update `schema.ts` to use the clean column names:

```typescript
etablissementId: integer('etablissement_id')  // Not 'id_etab_id'
societeId: integer('societe_id')              // Not 'id_societe_id'
projetId: text('projet_id')                   // Not 'projet_id_id'
```

---

### Option B: Manual Database Updates

If you can't use migrations (e.g., production database with too much risk), manually apply the changes.

#### Step 1: Connect to Turso Database

```bash
turso db shell your-database-name
```

#### Step 2: Apply Schema Changes Manually

Execute SQL statements for each change:

```sql
-- Add indexes to pemd table (if missing)
CREATE INDEX IF NOT EXISTS pemd_nature_id_idx ON pemd(nature_id);
CREATE INDEX IF NOT EXISTS pemd_objet_id_idx ON pemd(objet_id);
CREATE INDEX IF NOT EXISTS pemd_sid_id_idx ON pemd(sid_id);

-- Add NOT NULL constraints to pemd
-- Note: SQLite doesn't support adding NOT NULL to existing columns easily
-- You may need to recreate the table

-- Rename columns
ALTER TABLE etablissement RENAME COLUMN id_societe_id TO societe_id;
ALTER TABLE projet RENAME COLUMN id_etab_id TO etablissement_id;
ALTER TABLE tag_mail RENAME COLUMN projet_id_id TO projet_id;

-- Rename indexes
DROP INDEX IF EXISTS etablissement_id_societe_id_idx;
CREATE INDEX etablissement_societe_id_idx ON etablissement(societe_id);

DROP INDEX IF EXISTS projet_id_etab_id_idx;
CREATE INDEX projet_etablissement_id_idx ON projet(etablissement_id);

DROP INDEX IF EXISTS tag_mail_projet_id_id_idx;
CREATE INDEX tag_mail_projet_id_idx ON tag_mail(projet_id);

-- Update account and session tables with default timestamps
-- SQLite doesn't easily add defaults to existing columns
-- May require table recreation

-- Remove documentConsultés column and recreate with new name
ALTER TABLE cerfa_diagnostic RENAME COLUMN document_consultés TO documents_consultes;

-- Remove redundant idEtablissementId column (if it exists)
-- Note: Need to check if this column exists in the database first
```

#### Step 3: Update Migration Journal

After manual changes, update the journal to reflect that changes have been applied:

```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    // ... existing entries ...
    {
      "idx": 4,
      "version": "6",
      "when": 1234567890000,
      "tag": "0004_manual_schema_fixes",
      "breakpoints": true
    }
  ]
}
```

Create a corresponding (empty or no-op) migration file so the journal stays in sync.

---

### Option C: Gradual Migration with Feature Flags

If you need to maintain uptime, apply changes gradually:

#### Step 1: Apply Non-Breaking Changes First

```bash
# Generate migration for only additive changes
# - Adding indexes
# - Adding nullable columns
# - Setting defaults on new columns

npx drizzle-kit generate
npx drizzle-kit migrate
```

#### Step 2: Deploy Code That Works with Both Schemas

Use the column name mapping approach (current workaround) so code works with old or new column names.

#### Step 3: Apply Breaking Changes

After verifying the application works:
- Rename columns
- Add NOT NULL constraints
- Remove old columns

#### Step 4: Update Code to Use New Schema

Remove the old column name mappings and use the new names directly.

---

## Specific Issues to Address

### 1. Fix Migration 0000

**Option A: Delete and Recreate**
```bash
rm drizzle/0000_wakeful_crystal.sql
npx drizzle-kit introspect
# Uncomment the new migration file
```

**Option B: Uncomment Existing**
```bash
# Edit drizzle/0000_wakeful_crystal.sql
# Remove the /* at the beginning and */ at the end
# Change:
#   /* CREATE TABLE ... */
# To:
#   CREATE TABLE ...
```

### 2. Sync Migration Journal with Reality

Check what migrations have actually been applied:

```bash
turso db shell your-database-name "SELECT * FROM __drizzle_migrations;"
```

If the table doesn't exist, the database was created outside of Drizzle migrations.

Create the migrations table manually:
```sql
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL,
  created_at INTEGER
);
```

Then insert entries for migrations that have been applied:
```sql
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('hash-of-migration-0001', unixepoch() * 1000);
```

### 3. Apply Pending Schema Changes

Once migrations are working, generate a single migration for all pending changes:

```bash
# Make sure schema.ts reflects desired end state
# (use clean column names like 'etablissement_id')

# Generate migration
npx drizzle-kit generate

# Review the migration
cat drizzle/000X_*.sql

# Apply it
npx drizzle-kit migrate
```

---

## Prevention for Future

### 1. Always Test Migrations Locally First

```bash
# Use a local Turso database for testing
turso db create test-db
turso db tokens create test-db

# Update .env.local with test database credentials
# Apply migrations
npx drizzle-kit migrate

# Test the application
npm run dev

# Only after verifying, apply to production
```

### 2. Use Migration Verification Scripts

Create a script to verify migrations before applying:

```typescript
// scripts/verify-migrations.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './src/lib/server/db/schema';

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN
});

const db = drizzle(client, { schema });

async function verifySchema() {
  try {
    // Try to query each table
    await db.select().from(schema.projet).limit(1);
    await db.select().from(schema.etablissement).limit(1);
    // ... etc
    console.log('✅ Schema verification passed');
  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  }
}

verifySchema();
```

### 3. Keep Schema and Database in Sync

Establish a workflow:

1. **Make Schema Changes** → Update `schema.ts`
2. **Generate Migration** → `npx drizzle-kit generate`
3. **Review Migration** → Check the SQL file
4. **Test Locally** → Apply to local/test database
5. **Commit Together** → Schema changes + migration file
6. **Apply to Production** → `npx drizzle-kit migrate`

Never commit schema changes without corresponding migrations.

### 4. Use Database Versioning

Add a version table to track schema version:

```sql
CREATE TABLE schema_version (
  version INTEGER PRIMARY KEY,
  applied_at INTEGER NOT NULL,
  description TEXT
);
```

Update it with each migration:

```sql
INSERT INTO schema_version (version, applied_at, description)
VALUES (4, unixepoch() * 1000, 'Add indexes to pemd table');
```

---

## Testing After Resolution

Once migrations are applied, verify everything works:

### 1. Schema Validation

```bash
npx drizzle-kit check
```

### 2. Database Queries

Test key queries:
```bash
turso db shell your-database-name
```

```sql
-- Check indexes exist
SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='pemd';

-- Check column names
PRAGMA table_info(projet);
PRAGMA table_info(etablissement);
PRAGMA table_info(tag_mail);

-- Check constraints
SELECT sql FROM sqlite_master WHERE name='pemd';
```

### 3. Application Testing

```bash
npm run dev
```

Test critical paths:
- [ ] List projects (`/app/projets`)
- [ ] View project details
- [ ] Create new project
- [ ] Add PEMD tags
- [ ] Admin pages with etablissement joins

### 4. Data Integrity

```sql
-- Check for orphaned records after foreign key changes
SELECT p.* FROM projet p
LEFT JOIN etablissement e ON p.etablissement_id = e.id
WHERE e.id IS NULL;

-- Check for NULL values in NOT NULL columns
SELECT COUNT(*) FROM pemd WHERE anchorPosition IS NULL;
SELECT COUNT(*) FROM pemd WHERE stemVector IS NULL;
```

---

## Summary

### What Went Wrong
1. Migration 0000 was generated from introspection and left commented out
2. Database was created outside the migration system
3. Schema changes were made without applying corresponding migrations
4. Migration files and journal got out of sync

### Current Workaround
- Using Drizzle's column name mapping
- Code uses clean names, database uses old names
- Application is functional but not ideal

### Recommended Path Forward
1. **Short term**: Keep current workaround until ready for maintenance window
2. **Medium term**: Follow "Option A: Clean Slate Migration" to properly sync everything
3. **Long term**: Establish proper migration workflow to prevent future issues

### Key Takeaway
**Always keep schema.ts and database in sync through migrations. Never commit schema changes without applying the corresponding migrations to all environments.**

---

## Additional Resources

- [Drizzle Kit Documentation](https://orm.drizzle.team/kit-docs/overview)
- [Turso CLI Documentation](https://docs.turso.tech/reference/turso-cli)
- [SQLite ALTER TABLE Limitations](https://www.sqlite.org/lang_altertable.html)
- [Drizzle Migrations Guide](https://orm.drizzle.team/docs/migrations)

---

## Questions or Issues?

If you encounter problems while resolving these migration issues:

1. **Check Turso Database Status**: `turso db show your-database-name`
2. **Review Recent Migrations**: `ls -la drizzle/`
3. **Check Migration Journal**: `cat drizzle/meta/_journal.json`
4. **Inspect Database Schema**: `turso db shell your-database-name ".schema"`
5. **Review Application Logs**: Look for SQL errors with column/table names

Document any new issues encountered and their solutions for future reference.
