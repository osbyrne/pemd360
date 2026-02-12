# Database Schema Issues Report

Generated: 2026-02-12

## Overview
This document outlines identified issues in the database schema (`src/lib/server/db/schema.ts`) and provides a remediation plan.

---

## Critical Issues

### 1. `pemd` Table Missing Primary Key
**Location:** `src/lib/server/db/schema.ts:444-473`

**Issue:** The `pemd` table has no primary key defined. The `id` field is declared as `text()` without `.primaryKey()` modifier.

**Impact:**
- No guaranteed unique identifier for rows
- Cannot efficiently query or update specific records
- Foreign key references impossible
- Database integrity compromised

**Current Code:**
```typescript
export const pemd = sqliteTable('pemd', {
	id: text(),  // ❌ No primary key constraint
	natureId: integer('nature_id'),
	// ...
});
```

---

### 2. Missing Foreign Key Constraints in `pemd` Table
**Location:** `src/lib/server/db/schema.ts:444-473`

**Issue:** The `pemd` table has several fields that appear to be foreign keys but lack `.references()` constraints:
- `natureId` (line 446) - should reference `natureV2.id`
- `objetId` (line 447) - should reference `objets.id`
- `sidId` (line 448) - should reference `projet.id`

**Impact:**
- No referential integrity enforcement
- Orphaned records possible
- Data inconsistencies can occur
- Cannot cascade deletions properly

---

### 3. Inconsistent User System Architecture
**Location:** Multiple tables

**Issue:** Two separate user systems exist simultaneously:
- Modern auth system: `user` table (line 59-78) with text-based IDs
- Legacy system: `user_legacy` table (line 290-308) with integer IDs

This creates confusion with junction tables:
- `projet_user` (line 195-212) references `user_legacy.id` (integer)
- `user_projet` (line 425-442) references `user.id` (text)

Both tables link `projet` with users but use different user tables.

**Impact:**
- Duplicate functionality
- Migration path unclear
- Queries must account for both user systems
- Risk of data inconsistency
- Application logic must handle both systems

---

### 4. Missing Indexes on Foreign Keys
**Location:** `src/lib/server/db/schema.ts:444-473`

**Issue:** The `pemd` table foreign keys lack indexes:
- `natureId` - no index
- `objetId` - no index
- `sidId` - no index

All other tables in the schema properly index their foreign keys (e.g., `tags_amiante_sid_id_idx`).

**Impact:**
- Slow JOIN queries
- Poor query performance as table grows
- Inefficient lookups by foreign key

---

## Data Type Issues

### 5. Inconsistent Data Types for Postal Codes
**Location:** Multiple tables

**Issue:** Postal codes use different data types across tables:
- `cerfaMtrOuvrage.cp` (line 120): `real()`
- `projet.cp` (line 410): `integer()`
- `etablissement.cp` (line 136): `text({ length: 5 })`
- `societe.cp` (line 219): `text({ length: 5 })`
- `cerfaDiagnostiqueur.cp` (line 336): `text({ length: 255 })`

**Impact:**
- Inconsistent data handling
- Potential data loss with `real()` and `integer()` types (leading zeros)
- Harder to maintain and query
- French postal codes should be text (e.g., "01000", "75001")

---

### 6. `user.banned` Field Type Inconsistency
**Location:** `src/lib/server/db/schema.ts:74`

**Issue:** `banned` field defined as `integer().default(false)` - mixing boolean semantic with integer type.

**Current Code:**
```typescript
banned: integer().default(false),
```

**Impact:**
- SQLite stores this as 0/1, but using boolean as default is semantically confusing
- Should use `.default(0)` for clarity
- Inconsistent with `emailVerified` which properly uses `false` as integer boolean

---

### 7. `projet.idEtablissementId` vs `projet.idEtabId` Redundancy
**Location:** `src/lib/server/db/schema.ts:402-405`

**Issue:** The `projet` table has two establishment ID columns:
- `idEtablissementId` (line 402) - optional, indexed
- `idEtabId` (line 403-405) - required, indexed

Both reference `etablissement.id`. This appears redundant.

**Impact:**
- Data duplication
- Unclear which field to use
- Wasted storage
- Potential data inconsistencies if they diverge

---

## Schema Design Issues

### 8. Typo in Column Name
**Location:** `src/lib/server/db/schema.ts:320`

**Issue:** Column name has typo: `documentConsultés` contains special character and inconsistent casing.

**Impact:**
- Non-ASCII characters in column names can cause issues
- Inconsistent with naming conventions (snake_case expected)

---

### 9. Missing `updatedAt` Triggers/Defaults in Multiple Tables
**Location:** Multiple tables

**Issue:** Several tables have `updatedAt` fields without default values or auto-update logic:
- `account.updatedAt` (line 31) - `.notNull()` but no default
- `session.updatedAt` (line 45) - `.notNull()` but no default

While `verification.updatedAt` (line 91-93) properly has a default.

**Impact:**
- Application must manually update `updatedAt` on every update
- Risk of forgetting to update timestamp
- Inconsistent with created_at pattern

---

### 10. `pemd` Table Missing Required Constraints
**Location:** `src/lib/server/db/schema.ts:444-473`

**Issue:** All fields in `pemd` are optional (no `.notNull()` constraints), making it unclear what data is actually required.

**Impact:**
- Cannot enforce data integrity
- Unclear business rules
- Possible incomplete records
- Difficult to query reliably

---

## Naming Convention Issues

### 11. Inconsistent Foreign Key Naming
**Location:** Multiple tables

**Issue:** Foreign key columns have inconsistent naming patterns:
- Sometimes: `*_id` (e.g., `groupe_id`, `sid_id`)
- Sometimes: `id*Id` (e.g., `idEtabId`, `idSocieteId`)
- Sometimes: `*IdId` (e.g., `projetIdId`, `userIdId` in tag_mail)

**Impact:**
- Harder to understand schema
- Inconsistent query patterns
- Code maintainability reduced

---

### 12. Table Naming Case Inconsistency
**Location:** Multiple tables

**Issue:** Mix of camelCase and snake_case in table names:
- camelCase: `categorieV2`, `natureV2`, `userLegacy`
- snake_case: `cerfa_mtr_ouvrage`, `tags_amiante`, `projet_user`

**Impact:**
- Inconsistent API surface
- Cognitive overhead for developers
- Best practice: use snake_case for SQL identifiers

---

## Plan to Fix Database Schema

### Phase 1: Critical Fixes (High Priority)

#### Task 1.1: Fix `pemd` Table Structure
1. Add primary key constraint to `id` field
2. Add foreign key references:
   - `natureId → natureV2.id`
   - `objetId → objets.id`
   - `sidId → projet.id`
3. Add indexes on foreign keys
4. Add `.notNull()` constraints to required fields (at minimum: `id`, `sidId`)
5. Generate and apply migration

**Files to modify:**
- `src/lib/server/db/schema.ts:444-473`

**Migration steps:**
```sql
-- Create new pemd table with proper constraints
CREATE TABLE pemd_new (
  id TEXT PRIMARY KEY NOT NULL,
  nature_id INTEGER REFERENCES nature_v2(id),
  objet_id INTEGER REFERENCES objets(id),
  sid_id TEXT NOT NULL REFERENCES projet(id),
  -- ... other fields
);

-- Copy data
INSERT INTO pemd_new SELECT * FROM pemd WHERE id IS NOT NULL;

-- Drop old, rename new
DROP TABLE pemd;
ALTER TABLE pemd_new RENAME TO pemd;

-- Create indexes
CREATE INDEX pemd_nature_id_idx ON pemd(nature_id);
CREATE INDEX pemd_objet_id_idx ON pemd(objet_id);
CREATE INDEX pemd_sid_id_idx ON pemd(sid_id);
```

---

#### Task 1.2: Standardize Postal Code Types
1. Change all postal code fields to `text({ length: 5 })`
2. Update affected tables:
   - `cerfaMtrOuvrage.cp`: real → text
   - `projet.cp`: integer → text
   - `cerfaDiagnostiqueur.cp`: text(255) → text(5)
3. Migrate existing data preserving leading zeros
4. Generate and apply migration

**Files to modify:**
- `src/lib/server/db/schema.ts`: lines 120, 410, 336

**Migration considerations:**
- Cast `projet.cp` integers to text with zero-padding
- Validate and truncate `cerfaDiagnostiqueur.cp` to 5 chars
- Handle NULL values

---

#### Task 1.3: Add Missing `updatedAt` Defaults
1. Add default SQL expression to `account.updatedAt`
2. Add default SQL expression to `session.updatedAt`
3. Match pattern used in `verification` table
4. Generate and apply migration

**Files to modify:**
- `src/lib/server/db/schema.ts`: lines 31, 45

**Code change:**
```typescript
updatedAt: integer('updated_at')
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull()
```

---

### Phase 2: User System Consolidation (Medium Priority)

#### Task 2.1: Assess User System Usage
1. Search codebase for references to `user` vs `user_legacy`
2. Identify active usage of `projet_user` vs `user_projet`
3. Document which system is actively used
4. Determine migration strategy

**Research needed:**
- Are both systems actively used?
- Is one deprecated?
- What's the migration path?

---

#### Task 2.2: Consolidate User-Projet Relationships
**Option A:** Migrate to modern system
1. Migrate `projet_user` data to `user_projet`
2. Map `user_legacy` to `user` (if mapping exists)
3. Drop `projet_user` table
4. Mark `user_legacy` as deprecated

**Option B:** Keep dual system but document
1. Add code comments explaining purpose of each
2. Ensure application code handles both properly
3. Plan future consolidation

---

### Phase 3: Cleanup and Optimization (Low Priority)

#### Task 3.1: Fix Column Name Typo
1. Rename `documentConsultés` to `document_consultes` or `documents_consulted`
2. Update application code references
3. Generate and apply migration

**Files to modify:**
- `src/lib/server/db/schema.ts:320`

---

#### Task 3.2: Resolve `projet` Establishment ID Redundancy
1. Determine purpose of `idEtablissementId` vs `idEtabId`
2. Remove redundant field
3. Update application code
4. Generate and apply migration

**Research needed:**
- Are they used for different purposes?
- Historical reason for duplication?

---

#### Task 3.3: Standardize Foreign Key Naming
1. Choose convention (recommend: `table_id` pattern)
2. Rename inconsistent columns:
   - `idEtabId` → `etablissement_id`
   - `idSocieteId` → `societe_id`
   - `projetIdId` → `projet_id`
   - `userIdId` → `user_id`
3. Update application code
4. Generate and apply migration

**Files to modify:**
- Multiple tables throughout schema

---

#### Task 3.4: Standardize Table Naming
1. Choose convention (recommend: snake_case)
2. Rename tables:
   - `categorieV2` → `categorie_v2`
   - `natureV2` → `nature_v2`
   - `userLegacy` → `user_legacy`
3. Update all references in code
4. Generate and apply migration

**Note:** This is breaking change requiring comprehensive code updates.

---

#### Task 3.5: Fix `user.banned` Default Value
1. Change `.default(false)` to `.default(0)`
2. Keep semantic meaning, fix type consistency
3. Generate and apply migration

**Files to modify:**
- `src/lib/server/db/schema.ts:74`

---

## Migration Strategy

### Recommended Order of Execution:

1. **Immediate (Do First):**
   - Task 1.1: Fix `pemd` primary key and foreign keys
   - Task 1.3: Add `updatedAt` defaults

2. **Short-term (Next Sprint):**
   - Task 1.2: Standardize postal codes
   - Task 2.1: Assess user system usage
   - Task 3.1: Fix typo in column name

3. **Medium-term (Next Quarter):**
   - Task 2.2: Consolidate user systems
   - Task 3.2: Resolve establishment ID redundancy

4. **Long-term (When time permits):**
   - Task 3.3: Standardize foreign key naming
   - Task 3.4: Standardize table naming
   - Task 3.5: Fix banned field default

---

## Testing Strategy

After each migration:

1. **Schema Validation:**
   - Run `npx drizzle-kit check` to verify schema
   - Ensure migrations are generated correctly

2. **Data Integrity:**
   - Verify foreign key constraints work
   - Check for orphaned records
   - Validate data types

3. **Application Testing:**
   - Run full test suite
   - Test all CRUD operations
   - Verify authentication flows
   - Test Matterport tag operations

4. **Rollback Plan:**
   - Keep backups before each migration
   - Document rollback steps
   - Test rollback procedures

---

## Summary Statistics

- **Critical Issues:** 4
- **Data Type Issues:** 3
- **Design Issues:** 3
- **Naming Issues:** 2
- **Total Issues:** 12

**Priority Breakdown:**
- High Priority: 6 issues
- Medium Priority: 3 issues
- Low Priority: 3 issues

---

## Notes

- All changes should be made via Drizzle migrations (`npx drizzle-kit generate`)
- Backup database before applying migrations
- Test migrations in development environment first
- Consider creating a staging environment for validation
- Document any application code changes required

---

## References

- Schema file: `src/lib/server/db/schema.ts`
- Drizzle ORM documentation: https://orm.drizzle.team/
- SQLite foreign key constraints: https://www.sqlite.org/foreignkeys.html
