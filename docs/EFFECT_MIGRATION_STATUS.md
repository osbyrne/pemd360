# Effect migration status

This document is the resumable implementation ledger for `docs/EFFECT_MIGRATION_PLAN.md`.
The plan is the user-provided specification; this file records implementation decisions and
verification evidence.

Current toolchain (2026-09-22): Deno installs dependencies and runs the repository tasks.
The Bun commands below record the earlier Effect migration and are historical evidence.
The Vercel adapter targets Node.js 24 for deployed functions.

## Toolchain and baseline

- Assessment date: 2026-09-11.
- Runtime decision: use Bun for the repository's executable `package.json` scripts and
  `bun.lock`; keep Deno as the documented supported installation/runtime context. There is no
  CI configuration or separate task runner in the repository. `deno task` discovers the same
  package scripts.
- Effect: exact stable v3 pin `effect@3.22.2`. Effect v4 is not used.
- Dependency installation: `bun add effect@3.22.2` completed successfully and updated
  `package.json` and `bun.lock`. The existing `deno.lock` predates the current package manifest
  and will be refreshed only as needed without unrelated dependency upgrades.
- Baseline `bun run check`: passed, 0 errors and 8 existing Svelte warnings.
- Baseline `bun run test`: passed, 1 file / 12 tests.
- Baseline `bun run lint`: passed with existing warnings, including warnings in vendored
  `src/lib/sdk.es6.js`.
- Baseline `bun run fmt:check` (before implementation): failed on the user-provided migration
  plan, the existing `docs/README.md`, `wrangler.jsonc`, and the existing synthesis route
  formatting. Changed implementation files were subsequently formatted without changing the
  supplied plan or the unrelated Wrangler config.
- Baseline `bun run build`: transforms completed, then adapter finalization failed because the
  host is Node 26.8.1 and `@sveltejs/adapter-vercel` supports Node 20, 22, or 24.
- Baseline generated output size: `.svelte-kit/output/client` 7,316 KiB across 121 files;
  `.svelte-kit/output/server` 8,076 KiB. These are comparison points, not a deployment.
- No production mutation, database migration, deployment, or live email/storage operation was
  run.

## Phase 0 inventory

### Server route and endpoint workflows

The following affected files are inventoried before migration. `pending` means the file is an
application-owned asynchronous workflow or an integration boundary that still needs migration.

| File                                                                          | Workflow / boundary                                            | Status                                 |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| `src/hooks.server.ts`                                                         | session lookup, route redirects, Better Auth framework handler | migrated: auth boundary batch          |
| `src/routes/+layout.server.ts`                                                | serializable root session data                                 | explicit framework boundary            |
| `src/routes/(landing)/+layout.server.ts`                                      | serializable landing session data                              | explicit framework boundary            |
| `src/routes/(landing)/signup/+page.server.ts`                                 | disabled public signup redirect                                | explicit framework boundary            |
| `src/routes/(app)/app/+layout.server.ts`                                      | protected app/admin layout data                                | explicit framework boundary            |
| `src/routes/(app)/app/projets/+page.server.ts`                                | project list load                                              | migrated: administration/project batch |
| `src/routes/(app)/app/projets/[id]/+page.server.ts`                           | project viewer load, PEMD create/delete actions                | pilot                                  |
| `src/routes/(app)/app/details/[id]/+page.server.ts`                           | authorized project detail load                                 | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/playground/+page.server.ts`                             | R2 list/signing demo                                           | migrated: storage/report batch         |
| `src/routes/(app)/app/tableau-synthese/+page.server.ts`                       | filtered synthesis load/delete                                 | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/tableau-synthese/export/+server.ts`                     | synthesis workbook export                                      | migrated: storage/report/export batch  |
| `src/routes/(app)/app/tableau-synthese-reemploi/+page.server.ts`              | reuse synthesis load/delete                                    | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/tableau-synthese-reemploi/export/+server.ts`            | reuse workbook export                                          | migrated: storage/report/export batch  |
| `src/routes/(app)/app/cerfa/+page.server.ts`                                  | CERFA index redirect                                           | explicit framework boundary            |
| `src/routes/(app)/app/cerfa/dechets/+page.server.ts`                          | CERFA waste data load                                          | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/dechets/export/+server.ts`                        | waste workbook export                                          | migrated: storage/report/export batch  |
| `src/routes/(app)/app/cerfa/informations/+page.server.ts`                     | CERFA information index                                        | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/informations/[id]/diagnostiqueur/+page.server.ts` | diagnostician load/save                                        | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/informations/[id]/maitre/+page.server.ts`         | owner load/save                                                | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/informations/[id]/diagnostic/+page.server.ts`     | diagnostic load/save                                           | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/informations/[id]/operation/+page.server.ts`      | operation load/save                                            | migrated: CERFA route batch            |
| `src/routes/(app)/app/cerfa/pem/+page.server.ts`                              | PEM load                                                       | migrated: CERFA route batch            |
| `src/routes/(app)/app/admin/categories/+page.server.ts`                       | category CRUD                                                  | migrated: reference CRUD batch         |
| `src/routes/(app)/app/admin/macro-categories/+page.server.ts`                 | group CRUD                                                     | migrated: reference CRUD batch         |
| `src/routes/(app)/app/admin/nature/+page.server.ts`                           | nature CRUD                                                    | migrated: reference CRUD batch         |
| `src/routes/(app)/app/admin/objets/+page.server.ts`                           | object CRUD                                                    | migrated: reference CRUD batch         |
| `src/routes/(app)/app/admin/etablissements/+page.server.ts`                   | establishment list/delete                                      | migrated: administration/project batch |
| `src/routes/(app)/app/admin/etablissements/nouveau/+page.server.ts`           | establishment create                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/etablissements/[id]/+page.server.ts`              | establishment detail                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/etablissements/[id]/modifier/+page.server.ts`     | establishment update                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/societes/+page.server.ts`                         | company CRUD                                                   | migrated: administration/project batch |
| `src/routes/(app)/app/admin/utilisateurs/+page.server.ts`                     | user/project association load/update                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/projets/+page.server.ts`                          | admin project list/delete                                      | migrated: administration/project batch |
| `src/routes/(app)/app/admin/projets/nouveau/+page.server.ts`                  | admin project create                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/projets/[id]/+page.server.ts`                     | admin project detail                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/projets/[id]/modifier/+page.server.ts`            | admin project update                                           | migrated: administration/project batch |
| `src/routes/(app)/app/admin/pemd-dechets/+page.server.ts`                     | waste inventory load/delete                                    | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/admin/pemd-dechets/export/+server.ts`                   | waste inventory workbook export                                | migrated: storage/report/export batch  |
| `src/routes/(app)/app/admin/pemd-reemploi/+page.server.ts`                    | reuse inventory load/delete                                    | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/admin/pemd-reemploi/export/+server.ts`                  | reuse inventory workbook export                                | migrated: storage/report/export batch  |
| `src/routes/(app)/app/admin/pemd-tableau/+page.server.ts`                     | PEMD table load/delete                                         | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/admin/pemd-tableau/export/+server.ts`                   | PEMD workbook export                                           | migrated: storage/report/export batch  |
| `src/routes/(app)/app/admin/risques/+page.server.ts`                          | risk table load/delete                                         | migrated: PEMD/synthesis batch         |
| `src/routes/(app)/app/admin/risques/export/+server.ts`                        | risk workbook export                                           | migrated: storage/report/export batch  |
| `src/routes/api/images/[hash]/+server.ts`                                     | authenticated R2 image redirect                                | migrated: storage/report batch         |
| `src/routes/api/projects/[id]/cerfa/+server.ts`                               | template fetch and CERFA PDF response                          | migrated: storage/report batch         |
| `src/routes/(landing)/signup/+page.server.ts`                                 | public account creation remains disabled                       | explicit framework boundary            |

### Shared server and CLI integrations

| File                              | Workflow / boundary                                | Status                            |
| --------------------------------- | -------------------------------------------------- | --------------------------------- |
| `src/lib/server/db/client.ts`     | Turso/Drizzle client construction                  | foundation                        |
| `src/lib/server/db/queries.ts`    | project access and export authorization            | migrated: project/PEMD batch      |
| `src/lib/server/db/actions.ts`    | generic CRUD route actions                         | migrated: reference CRUD batch    |
| `src/lib/server/admin.ts`         | Better Auth parent-load admin guard                | explicit framework boundary       |
| `src/lib/auth.ts`                 | Better Auth configuration and reset email callback | migrated: storage/report batch    |
| `src/lib/server/s3/client.ts`     | R2 client/configuration boundary                   | migrated: storage/report batch    |
| `src/lib/server/s3/image-urls.ts` | image key lookup and signed URL cache              | migrated: storage/report batch    |
| `src/lib/server/email/resend.ts`  | Resend returned-error boundary                     | migrated: storage/report batch    |
| `src/lib/server/excel.ts`         | ExcelJS report generation                          | migrated: storage/report batch    |
| `src/lib/server/cerfa.ts`         | pdf-lib report renderer                            | migrated: storage/report batch    |
| `scripts/create-admin.ts`         | administrator CLI, hidden input and transaction    | migrated: administrator CLI batch |

### Browser-owned asynchronous workflows

| File                                                                   | Workflow / boundary                                 | Status                                                                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/lib/auth-client.ts`                                               | Better Auth browser client                          | explicit provider SDK boundary; used only by the client adapter and session displays                     |
| `src/lib/components/CreateUserModal.svelte`                            | create user, assign projects, refresh               | migrated: client auth workflow and operation bridge                                                      |
| `src/lib/components/DeleteUserModal.svelte`                            | admin user deletion                                 | migrated: client auth workflow and operation bridge                                                      |
| `src/lib/components/EditUserModal.svelte`                              | admin role update                                   | migrated: client auth workflow and operation bridge                                                      |
| `src/lib/components/UserBanModal.svelte`                               | ban/unban                                           | migrated: client auth workflow and operation bridge                                                      |
| `src/lib/components/UserPasswordModal.svelte`                          | admin password update                               | migrated: client auth workflow and operation bridge                                                      |
| `src/lib/components/UserProjetsModal.svelte`                           | project association form/refresh                    | explicit SvelteKit form-protocol boundary; assignment adapter is tested through the create-user workflow |
| `src/lib/components/CreateSocieteModal.svelte`                         | enhanced company create/refresh                     | explicit SvelteKit form-protocol boundary                                                                |
| `src/lib/components/DeleteConfirmModal.svelte`                         | enhanced delete result                              | explicit SvelteKit form-protocol boundary                                                                |
| `src/lib/components/PemdCreateModal.svelte`                            | enhanced PEMD creation result                       | explicit SvelteKit form-protocol boundary                                                                |
| `src/lib/pemd-edit-mode.svelte.ts`                                     | Matterport pointer/tag state bridge                 | migrated: owned subscription and cleanup boundary                                                        |
| `src/routes/(landing)/login/+page.svelte`                              | Better Auth sign-in                                 | migrated: client auth workflow and operation bridge                                                      |
| `src/routes/(landing)/signup/+page.svelte`                             | disabled signup UI and enhanced result              | explicit disabled-signup/form-protocol boundary                                                          |
| `src/routes/(landing)/contact/+page.svelte`                            | contact submission UI delay                         | explicit simulated UI-only delay; no network workflow exists                                             |
| `src/routes/(app)/app/+layout.svelte`                                  | Better Auth sign-out                                | migrated: client auth workflow and operation bridge; `useSession` remains SDK state                      |
| `src/routes/(app)/app/projets/[id]/+page.svelte`                       | Matterport connection, tag mutations, subscriptions | migrated: typed service, owned lifecycle, serialized reconciliation                                      |
| `src/routes/(app)/app/admin/utilisateurs/+page.svelte`                 | admin user listing and toast timer                  | migrated: latest-result client workflow; toast timeout is visual state                                   |
| `src/routes/(app)/app/details/[id]/+page.svelte`                       | mount-time UI behavior                              | explicit boundary                                                                                        |
| `src/routes/(app)/app/projets/+page.svelte`                            | mount-time UI behavior                              | explicit boundary                                                                                        |
| `src/routes/(landing)/+page.svelte`                                    | carousel timer                                      | explicit boundary                                                                                        |
| `src/routes/(app)/app/tableau-synthese/+page.svelte`                   | debounced filtering and enhanced delete             | explicit UI navigation/form-protocol boundary                                                            |
| `src/routes/(app)/app/tableau-synthese-reemploi/+page.svelte`          | debounced filtering and enhanced delete             | explicit UI navigation/form-protocol boundary                                                            |
| `src/routes/(app)/app/admin/pemd-dechets/+page.svelte`                 | debounced filtering                                 | explicit UI navigation boundary                                                                          |
| `src/routes/(app)/app/admin/pemd-reemploi/+page.svelte`                | debounced filtering                                 | explicit UI navigation boundary                                                                          |
| `src/routes/(app)/app/admin/categories/+page.svelte`                   | enhanced CRUD result                                | explicit SvelteKit form-protocol boundary                                                                |
| `src/routes/(app)/app/admin/nature/+page.svelte`                       | enhanced CRUD result                                | explicit SvelteKit form-protocol boundary                                                                |
| `src/routes/(app)/app/admin/etablissements/[id]/modifier/+page.svelte` | enhanced establishment update                       | explicit SvelteKit form-protocol boundary                                                                |

### Intentional exclusions

Pure display components, local filtering/derived state, dialog presentation, and SvelteKit's
`use:enhance`/`update` callbacks remain UI/framework boundaries. `src/lib/sdk.es6.js` is a
vendored Matterport SDK and will not be edited. Better Auth's `svelteKitHandler`, SvelteKit
load/action/endpoint signatures, DOM event callbacks, and the browser SDK itself remain
documented execution boundaries; their business operations are migrated behind adapters.

## Batch log

### Foundation and pilot

- Added `src/lib/effect/errors.ts`, explicit FormData decoding helpers and project schemas.
- Added lazy, shared `Database` and `Authorization` services, a managed server runtime, and
  SvelteKit boundary mapping.
- Refactored the database/auth factories to lazy construction; request context remains in
  workflow inputs and is not stored in shared services.
- Migrated project viewer loading and PEMD create/delete actions. Viewer reads run only after
  project access succeeds and use a concurrency limit of four.
- Verification: `bun run check` passed with the baseline 8 warnings; `bun run test` passed with
  2 files / 15 tests. The new boundary tests use fake layers and mocked `$env`/auth modules,
  so no live credentials or database are required.
- Known baseline items remain: formatting warnings listed above, adapter build blocked on Node
  26, and existing Svelte/lint warnings.

### Reference CRUD batch

- Migrated category, macro-category, nature, and object list/CRUD workflows to
  `DatabaseService` and the shared Effect action boundary.
- Preserved action names, success payloads, French validation messages, and delete permission
  behavior. Numeric IDs are now rejected as invalid input rather than sent to Drizzle as `NaN`.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline warnings; the
  existing and new focused tests passed (15 tests).
- Next exact step: migrate project/establishment/company/user administration routes, then
  rerun the full check/test pair before PEMD/synthesis routes.

### Administration and project management batch

- Migrated project list/detail/create/edit, establishment list/detail/create/edit/delete,
  company CRUD, and user-project assignment routes to typed administration/project workflows.
- Preserved linked-project deletion protection, French action messages, action names, payload
  keys, and redirect destinations. User-project replacement now runs in one database
  transaction.
- Added administration input schemas and serializable form snapshots for failure responses.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline warnings;
  `bun run test` passed with 2 files / 15 tests. No live database mutation was run.
- Next exact step: migrate PEMD detail/table/risk/synthesis server routes and their export
  authorization boundary.

### PEMD, risk, and synthesis batch

- Migrated project detail, waste/reuse/PEMD inventory, risk, and synthesis page
  loads/actions to `inventory.ts` and `project.ts` workflows.
- Preserved pagination defaults/caps, query filters, project selectors, image-hash handling,
  linked risk labels, French action messages, and deletion permission/access checks. Access is
  checked before non-admin PEMD reads or writes; independent risk queries use bounded
  concurrency.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline warnings;
  `bun run test` passed with 2 files / 15 tests. No live database or storage operation was run.
- Next exact step: migrate CERFA loaders/actions, then move report generation and export
  endpoints behind report/storage services.

### CERFA route batch

- Migrated CERFA information, waste, PEM catalog, and four section load/save workflows to
  typed schemas and database effects. Repeated checkbox/list fields are decoded as explicit
  string-or-array inputs, and upserts remain idempotent per project section.
- Preserved the existing redirects, section result shapes, grouping/filtering behavior, and
  French form semantics. Project-specific CERFA reads/writes now verify authenticated project
  access before touching section data.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline warnings;
  `bun run test` passed with 2 files / 15 tests. CERFA export/report bytes remain for the next
  storage/report batch; no live database mutation was run.
- Next exact step: migrate remaining server layouts/session/signup/playground boundaries,
  then migrate storage/email/report services and all export endpoints.

### Auth and framework-boundary batch

- Migrated Better Auth session lookup in `src/hooks.server.ts` through an injectable
  `Authentication` service and the managed server runtime. Provider failures and defects are
  logged at the hook boundary and mapped to a safe 500; Better Auth `svelteKitHandler` remains
  the documented framework boundary.
- Kept root/landing/app layouts, the disabled signup redirect, and CERFA index redirect as
  plain serializable/framework functions because they perform no application I/O. Reduced
  `src/lib/server/admin.ts` to its framework-only parent-load guard; browser admin operations
  are handled in the client batch.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline warnings;
  `bun run test` passed with 2 files / 15 tests. The R2 playground remains in the storage
  batch, and the Better Auth reset callback remains in the email batch.
- Next exact step: migrate storage/email/report services and every export endpoint, including
  the playground's R2 listing/signing workflow.

### Storage, email, report, and export batch

- Added lazy R2 resources and a typed `Storage` service. Image lookup now caches object keys
  with bounded five-minute expiry, removes rejected lookups, preserves extension order, and
  treats only genuine 404/NoSuchKey responses as extension misses. Signed URLs still expire in
  one hour.
- Added a typed `Email` service around the Resend adapter. Configuration is read only when a
  reset message is sent, returned Resend errors are rejected, and no automatic send retry was
  introduced. Better Auth's reset callback still receives the same `{ to, recipientName,
resetUrl }` inputs.
- Added a typed `Report` service and moved database reads plus access checks for every workbook
  export and CERFA PDF into `workflows/exports.ts` and `workflows/reports.ts`. The PDF renderer
  is now pure with respect to application data; the CERFA endpoint still owns template fetch
  and response headers. The playground and image endpoint use the storage workflow.
- Removed the eager `db` compatibility export and reduced `db/queries.ts` to its pure SQL
  helper; no application route directly constructs an R2 request, database query, or report.
- Verification: `bun run check` passed with 0 errors and the same 8 baseline Svelte warnings;
  `bun run test` passed with 2 files / 15 tests. Live R2, Resend, database, and PDF-template
  operations were not run.
- Fixed-fixture report/storage tests were subsequently added; the current verification totals
  are recorded below.

### Browser workflow and component batch

- Added a client-only Effect runtime, component-owned operation bridge, Better Auth adapter, and
  client authentication workflows. Returned provider errors are checked explicitly and are never
  treated as successful mutations.
- Migrated login, sign-out, user listing, create/edit/delete/ban/password operations, and the
  create-user-then-project-assignment flow. Assignment failure is reported as partial success with
  the created user ID and a viewer-only assignment retry; account creation is never repeated.
- Kept `use:enhance`, `deserialize`, `update`, `goto`, `invalidateAll`, session observables, local
  filters, and toast timers at their SvelteKit/UI boundaries. Refresh failure after a successful
  user mutation now has a separate message.
- Verification: `bun run check` passed with 0 errors and the baseline 8 warnings; client and
  server tests passed with 9 files / 30 tests. No private server module is imported by the client
  service or workflow modules.

### Matterport lifecycle batch

- Added a typed Matterport service supporting both NPM and script connection modes, tag add/remove,
  pointer subscription, bounded connection waits, idempotent disconnect, and late-connection
  cleanup. The project viewer now owns its connection, iframe reload wait, subscription, timers,
  and reconciliation state.
- Serialized each viewer tag set so rapid filter changes converge on the latest desired set. Failed
  removals remain tracked, partial adds are reported, and a newly persisted PEMD tag is registered
  for subsequent viewer-only reconciliation.
- Verification: fake SDK tests cover delayed timeout cleanup, idempotent disconnect, cancellable
  pointer subscriptions, partial add/remove, serialized latest-result publication, and repeated
  operation disposal. A live Matterport smoke test was not run because no model/credential session
  was available; the vendored SDK was not edited.

### Administrator CLI batch

- Added a CLI-specific Effect runtime, transaction-aware database service, Better Auth adapter, and
  administrator workflow. `scripts/create-admin.ts` retains hidden password input, explicit
  target confirmation, existing-account refusal, atomic transaction behavior, runtime disposal,
  and database client cleanup without importing SvelteKit `$env` modules.
- Verification: CLI workflow tests cover existing-account refusal and exactly-one account creation
  through injected services; `bun run admin:create -- --help` exits successfully without reading
  database credentials or mutating data.

### Phase 7 inventory and current verification

- Direct application SQL imports were removed from the four reference-data route files; their
  queries and delete semantics now live in the admin workflow. Remaining raw promises/async code
  is limited to SvelteKit load/action/endpoint signatures, Better Auth/Resend/AWS/Matterport and
  PDF/Excel adapters, the CLI hidden-input DOM/TTY bridge, UI navigation/form-protocol callbacks,
  visual timers, and the owned Matterport lifecycle boundary.
- Current test total after all added fixtures: 9 files / 30 tests; rerun results after the final
  check set are authoritative below.
- No production mutations, schema migrations, deployments, live email sends, live storage writes,
  or live database writes were run.

### Final verification (2026-09-11)

- `bun run check`: passed with 0 errors and 8 pre-existing Svelte warnings.
- `bun run test`: passed, 9 files / 30 tests.
- `bun run lint`: passed. Remaining warnings are pre-existing CERFA UI expressions and the
  untouched vendored `src/lib/sdk.es6.js`; no migration-owned lint warnings remain.
- `bun run fmt:check`: reports only `docs/EFFECT_MIGRATION_PLAN.md` (the supplied specification)
  and the pre-existing `wrangler.jsonc`; all changed/new implementation files pass targeted
  formatting checks.
- `git diff --check`: passed.
- `bun run build`: Svelte/Vite compilation, server generation, and PWA generation completed
  successfully (4,529 modules transformed). Adapter finalization remains blocked by the host's
  Node.js 26.8.1; `@sveltejs/adapter-vercel` accepts Node 20, 22, or 24.
- Generated output comparison after the migration: client 7,460 KiB / 124 files and server
  8,196 KiB / 206 files, versus the baseline 7,316 KiB / 121 client and 8,076 KiB server.
- `bun run admin:create -- --help`: passed without reading database credentials or mutating data.
- Static boundary audits found no application route importing the Drizzle schema or raw
  `drizzle-orm` for the migrated reference routes, no raw Better Auth mutation calls outside
  the client adapter/workflows, no Matterport calls outside the typed viewer service, and no
  server-only imports in client workflow/service modules.
- Real Matterport, database, storage, email, authenticated browser, and production adapter
  flows remain unrun because this environment has no configured live credentials/model and the
  build host uses an unsupported Node version. No production mutation, schema migration,
  deployment, or push was performed.
- `deno.lock` now includes the exact `npm:effect@3.22.2` graph entries merged from an isolated
  lock refresh. The pre-existing lock still reflects older package-manifest versions outside
  this migration; a full Deno lock regeneration would introduce unrelated dependency churn.
