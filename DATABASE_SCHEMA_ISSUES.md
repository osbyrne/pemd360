# Database Schema Issues Report

Generated: 2026-02-12
Last Updated: 2026-02-14

## Overview
This document outlines identified issues in the database schema (`src/lib/server/db/schema.ts`) and provides a remediation plan.

## Fixed Issues

### ✅ 3. Inconsistent types for cp (FIXED)
All `cp` fields are now standardized to `text({ length: 5 })` in the schema.

### ✅ 4. Missing Indexes on Foreign Keys (FIXED)
The `pemd` table now has proper indexes on all foreign keys:
- `pemd_nature_id_idx`
- `pemd_objet_id_idx`
- `pemd_sid_id_idx`

### ✅ 5. Inconsistent Data Types for Postal Codes (FIXED)
All postal code fields are now consistently `text({ length: 5 })`.

### ✅ 6. `user.banned` Field Type Inconsistency (FIXED)
Now uses `integer().default(0)` instead of `integer().default(false)`.

### ✅ 9. Missing `updatedAt` Triggers/Defaults (FIXED)
Both `account.updatedAt` and `session.updatedAt` now have proper defaults:
```typescript
updatedAt: integer('updated_at')
  .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
  .notNull()
```

### ✅ 8. Typo in Column Name (FIXED)
Renamed `documentConsultés` to `documentsConsultes` to remove special characters.
- Updated schema definition
- Updated all code references in cerfa.ts and page.server.ts

### ✅ 7. `projet.idEtablissementId` vs `projet.idEtabId` Redundancy (FIXED)
Removed redundant `idEtablissementId` column from projet table.
- Kept `idEtabId` as the single establishment reference (required field)
- Removed duplicate field definition and index from schema
- Updated all code references in projet creation/modification
- Removed unnecessary update logic in etablissements page

### ✅ 10. `pemd` Table Missing Required Constraints (FIXED)
Added notNull() constraints to fields that are always required for PEMD (Matterport) tags:
- `anchorPosition` - Required for Matterport 3D positioning
- `stemVector` - Required for Matterport 3D positioning
- `id` and `sidId` were already required

### ✅ 11. Inconsistent Foreign Key Naming (FIXED)
Standardized all foreign key column names to use consistent snake_case pattern:
- `idSocieteId` → `societeId` (column: `societe_id`)
- `idEtabId` → `etablissementId` (column: `etablissement_id`)
- `projetIdId` → `projetId` (column: `projet_id`)
- Updated all code references throughout the codebase

### ✅ 12. Table Naming Case Inconsistency (NOT AN ISSUE)
After review, the table naming is already consistent and follows best practices:
- **TypeScript exports** use camelCase (`categorieV2`, `cerfaMtrOuvrage`) - TypeScript convention
- **Database tables** use snake_case (`categorie_v2`, `cerfa_mtr_ouvrage`) - SQL convention
- Drizzle ORM automatically handles the conversion between these two conventions

This is the standard and recommended approach. No changes needed.

---

## Summary

All identified database schema issues have been resolved:
- ✅ Issues 3, 4, 5, 6: Fixed in schema (postal codes, indexes, user.banned, updatedAt defaults)
- ✅ Issue 7: Removed redundant idEtablissementId column
- ✅ Issue 8: Fixed documentConsultés typo
- ✅ Issue 10: Added required constraints to pemd table
- ✅ Issue 11: Standardized foreign key naming
- ✅ Issue 12: Confirmed naming convention is already correct

**Note**: Schema changes are committed but migrations to the remote Turso database
are pending due to migration file sync issues requiring manual resolution.

---

## Remaining Issues

None - all issues have been addressed.

---
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


## Plan to Fix Database Schema

### Phase 1: Critical Fixes (High Priority)

All Phase 1 tasks have been completed in the schema file. Migration to database is pending due to migration system sync issues.

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
