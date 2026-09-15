# Effect migration implementation plan

Prepared for GPT 5.6 Luna with reasoning effort set to `max`.
Repository: `/Users/osbyrne/code/osbyrne/pemd360`.
Assessment date: 2026-09-10. This is an implementation specification; implementation has not started.

## Objective and scope

Adopt Effect throughout application-owned asynchronous business workflows: server loads/actions/endpoints, database access, authorization operations, R2, email, report generation, browser authentication/admin operations, Matterport, and the administrator CLI.

Keep Svelte responsible for markup, styles, component state, derived values, DOM bindings, and form enhancement. Pure functions remain plain TypeScript. “Throughout” means every relevant workflow is migrated or explicitly documented as a framework/SDK boundary; it does not mean importing Effect into every component.

Preserve routes, French messages, action names, form result shapes, redirects, permissions, export contents, database schema, and public authentication behavior. Preserve existing libraries: Drizzle, Better Auth, AWS S3 SDK, Resend, Matterport, ExcelJS, and pdf-lib. Do not rewrite the vendored `src/lib/sdk.es6.js`. Do not deploy or run production mutations as migration verification.

## Execution instructions for Luna

1. Read repository instructions and this document. Inspect current files before editing; paths and counts below are a starting inventory, not a substitute for discovery.
2. Execute phases in order. Within a phase, finish and verify one workflow or closely related route family before moving on. Do not launch a codebase-wide mechanical rewrite.
3. Keep `docs/EFFECT_MIGRATION_STATUS.md` updated after each batch: files migrated, tests/results, known baseline failures, remaining boundaries, next exact step, and decisions. Use it to resume after context compaction.
4. Check installed Effect declarations and documentation for the selected major before using an unfamiliar API. Never mix v3 and v4 examples or silence type errors with `any`, double casts, or blanket error suppression.
5. Continue through every phase. Passing the pilot is not completion. Do not stop for routine implementation approvals. If an external dependency prevents live verification, finish local work and record precisely what remains unverified.
6. Keep changes reviewable by phase. Do not revert unrelated user changes, change authentication policy, run database migrations, publish, or push as part of this plan.

## Architecture decisions

### Version and package management

The official website advertised Effect 4 as a release candidate on the assessment date. Default to an exact stable Effect 3.x version for this plan; resolve the latest stable patch in that major at implementation time and record it. Do not install `effect@rc`, copy v4 service APIs, or upgrade majors during the migration. Add other Effect packages only if necessary and compatible with the pinned version. Existing Vitest is sufficient to begin.

The README documents Deno, `package.json` includes Bun commands, and both lockfiles exist. Inspect CI/tooling and available runtimes first. Prefer the documented Deno workflow unless actual repository automation establishes another canonical workflow. Record the choice, use it consistently, and keep supported lockfiles consistent without unrelated dependency upgrades. Do not delete a lockfile just to simplify this migration.

### Module layout

Create these modules as their phases need them, rather than generating empty scaffolding:

| Location | Responsibility |
| --- | --- |
| `src/lib/effect/errors.ts` | Shared tagged domain/integration errors; safe public messages |
| `src/lib/effect/schemas/` | Input schemas grouped by domain, with explicit FormData decoding |
| `src/lib/server/effect/runtime.ts` | Lazy server runtime and shared infrastructure layer composition |
| `src/lib/server/effect/sveltekit.ts` | Run programs and map typed outcomes to existing route contracts |
| `src/lib/server/services/` | Database, authorization, storage, email, and report adapters |
| `src/lib/server/workflows/` | Project, PEMD, administration, CERFA, and synthesis use cases |
| `src/lib/client/effect/runtime.ts` | Browser runtime factory; no server imports |
| `src/lib/client/effect/operation.svelte.ts` | Component-owned operation lifecycle and Svelte state bridge |
| `src/lib/client/services/` | Better Auth client and Matterport adapters |
| `src/lib/client/workflows/` | Multi-step browser operations |

Use Effect 3 `Context.Tag`, `Layer`, `ManagedRuntime`, and `Effect.gen` consistently. Choose the simplest concrete service interfaces that preserve Drizzle's inferred result types. Avoid a generic repository framework or one global union containing every possible application error.

Services expose Effect values. Workflows compose them. Execute Effects only at framework, UI, SDK callback, or CLI entry points. Do not wrap an entire existing async workflow in `tryPromise` and call that a finished migration: isolate third-party calls, then express sequencing and recovery in Effect.

### Errors, validation, and boundaries

- Define specific errors as needed: unauthenticated, forbidden, not found, validation, database, storage, email, authentication provider, report generation, and Matterport errors. Keep original causes for server diagnostics; never serialize secrets or raw causes to the browser.
- Convert rejected promises and SDK-returned error objects at adapter boundaries. In particular, Better Auth and Resend may return errors without throwing, and `fetch` does not reject for HTTP error statuses.
- Route adapters must inspect typed failures before producing SvelteKit `fail`, `error`, redirects, or endpoint responses. Preserve each route's current status and payload conventions. Do not catch SvelteKit redirects as integration failures. Unexpected defects remain unexpected errors, logged once and mapped to a safe 500 response.
- Use schemas at untrusted inputs: route/query parameters, FormData, JSON, and external payloads that are actually consumed. Preserve distinctions among missing values, empty strings, zero, unchecked booleans, optional fields, and repeated fields. Do not create duplicate schemas for every Drizzle row.
- Keep SvelteKit load results serializable plain data. Never return services, fibers, Effect values, or error instances.

### Lifetimes, cancellation, and retries

- Share infrastructure clients per server instance where appropriate. Pass the current user, headers, cookies, and request context per invocation; never capture them in a singleton layer. Avoid an Auth/Email/runtime initialization cycle in `src/lib/auth.ts`.
- Initialize only services required by a workflow. A database-only request must not require email or R2 credentials. Do not initialize browser SDKs during SSR.
- Dispose runtimes that a test, CLI, or component owns. Never dispose a shared server runtime at the end of one request. Await server work; do not depend on detached fibers surviving Vercel request completion.
- Propagate abort signals only where the underlying API supports them. Interrupting an Effect does not undo a database write or cancel a non-cancellable SDK promise. Suppress stale completions and clean up late-acquired resources explicitly.
- Start without automatic mutation retries. Add bounded retries only to classified transient, idempotent reads. Use transactions for related database writes where supported; use explicit partial-success recovery across independent services. Never rerun a completed account creation or send duplicate email merely because a later step failed.
- Add useful operation spans and safe structured error logs. Do not add a hosted telemetry dependency or log credentials, cookies, passwords, signed URLs, or reset tokens.

## Phase 0 — Inventory and baseline

1. Inspect `package.json`, `deno.json`, both lockfiles, `vite.config.ts`, `vitest.config.ts`, `svelte.config.js`, `src/app.d.ts`, `src/hooks.server.ts`, and `scripts/create-admin.ts`.
2. Inventory all application-owned async/I/O calls using `rg`: `async`, `await`, `fetch`, `Promise`, timers, subscriptions, database/client imports, and lifecycle callbacks. Exclude generated files and vendored SDK internals. Initial assessment found 60 Svelte files, 46 server route files, and one test file under `src`.
3. Create the status document with one entry per affected file/workflow, including public pages, layouts, playground, scripts, and export routes. Mark pure components and vendor/framework callbacks as explicit exclusions with reasons.
4. Run existing check, test, lint, format-check, and build commands using the chosen runtime. Record existing failures separately, including missing environment-dependent build prerequisites. Do not expose `.env` values.
5. Capture baseline client bundle sizes using existing build output where available. Record the current result contracts of the pilot routes and representative admin/export routes.

Exit: complete inventory and reproducible baseline, with no application behavior changes.

## Phase 1 — Foundation and boundary tests

1. Add the pinned Effect dependency and shared errors. Implement runtime construction and route-boundary helpers with lazy infrastructure acquisition.
2. Introduce injectable database and authorization adapters around `src/lib/server/db/client.ts` and the relevant Better Auth APIs. Preserve the underlying Drizzle schema and client behavior.
3. Implement test layers that need no live database, credentials, S3, or email. Keep modules containing `$env` imports out of pure workflow tests; narrowly configure/mock those imports only for boundary tests.
4. Test domain failure-to-response mapping, existing `{ error }` versus `{ message }` action shapes, redirects, unexpected defects, serializable outputs, two concurrent users with isolated request context, and database-only execution with optional services absent.

Exit: typecheck and focused tests pass; no raw integration error reaches a public result; no request data is stored in shared runtime state.

## Phase 2 — Pilot: project viewer load and PEMD creation

Targets: `src/routes/(app)/app/projets/[id]/+page.server.ts`, `src/lib/server/db/queries.ts`, and new project/PEMD workflows and schemas.

1. Extract project access checking, viewer data loading, and `createPemdTag` into typed workflows. Preserve loader fields and action names exactly.
2. Authorize before starting protected data reads. Parallelize independent reads only after access succeeds, with explicit bounded concurrency (start at four). Preserve query filters and ordering.
3. Decode the actual form fields with schemas, retaining current optional/default semantics and French messages. Preserve the inserted tag's response shape used by the viewer.
4. Test unauthenticated/forbidden/missing-project cases, allowed project membership, malformed input, successful creation, database failure, and existing loader/result shapes. Assert denied requests do not perform writes or protected reads.
5. Verify the existing Svelte form still submits and refreshes data. Browser Matterport orchestration is migrated later.

Exit: this is the reference implementation for subsequent routes, with small route handlers and genuinely composed Effect workflows.

## Phase 3 — All server routes, CRUD, and auth entry points

Migrate these batches in order; check and test each batch before the next:

1. `src/lib/server/db/actions.ts` and the admin category, macro-category, nature, and object route families using shared CRUD helpers.
2. Project list/detail/create/edit routes, establishments, companies, and user administration, including `src/lib/server/admin.ts`.
3. PEMD detail, waste/reuse tables, risk tables, and synthesis page loaders/actions.
4. CERFA page loaders/actions, including `cerfa/informations/[id]/{diagnostiqueur,maitre,diagnostic,operation}`.
5. Root/app/landing layouts, signup server behavior, playground server code, and session lookup in `src/hooks.server.ts`. Keep Better Auth's `svelteKitHandler` as the framework boundary; preserve cookies, redirects, and disabled public account creation.

For every batch, move direct application database calls into services/workflows, migrate input validation, and preserve permissions and route contracts. Keep `buildProjectConditions` and other pure helpers plain. Split `validateExportAuth` into domain authorization and response mapping rather than constructing `Response` inside the domain service.

Exit: every server route in the inventory is migrated or documented as a thin framework-only boundary. Tests cover representative CRUD failures plus route-specific permission and mutation semantics; do not generate one redundant test per wrapper.

## Phase 4 — Storage, email, and exports

Targets: `src/lib/server/s3/{client,image-urls}.ts`, `src/lib/server/email/resend.ts`, `src/lib/server/{cerfa,excel}.ts`, `src/routes/api/images/[hash]/+server.ts`, `src/routes/api/projects/[id]/cerfa/+server.ts`, and every `export/+server.ts`.

1. Adapt S3 commands and signing. Keep missing images distinct from storage outages: only genuine not-found results advance extension fallback; authentication/network failures remain typed failures.
2. Replace the unbounded promise cache in `image-urls.ts` with bounded key caching and explicit expiry. Cache object keys rather than signed URLs; do not permanently cache failed lookups. Preserve the one-hour signed URL expiry unless the current contract changes before implementation.
3. Adapt Resend and its configuration errors. Maintain the Better Auth reset-password callback contract and lazy email configuration; do not retry sends automatically.
4. Extract report orchestration into workflows. Retain pure calculations, grouping, labels, column order, PDF filling, and binary formats. Wrap fallible synchronous library operations appropriately; never put potentially throwing work in an infallible wrapper.
5. Test missing image versus provider failure, extension order, cache expiry/recovery, returned email errors, export access filters, and report failures. Generate reports from fixed fixtures and parse them to verify workbook sheets/values and PDF fields/page counts. Do not compare nondeterministic binary bytes.

Exit: all export routes use Effect workflows; fixed input fixtures yield equivalent report content; no live emails or production storage writes are required for tests.

## Phase 5 — Browser workflows and component integration

Targets: `src/lib/components/*Modal.svelte`, login/signup pages, all other async Svelte handlers found in the inventory, and `src/lib/auth-client.ts`.

1. Build a small component-owned bridge exposing pending/error/result state and execution/cleanup. Keep state local to the component; inject services or a runtime rather than storing one global operation state.
2. Move Better Auth client calls from create/edit/delete/ban/password user modals into adapters and workflows. Check returned errors explicitly.
3. Keep SvelteKit `use:enhance`, action deserialization, `update`, and `invalidateAll` at UI/framework boundaries. Extract multi-step business operations; do not reimplement SvelteKit's form protocol as generic JSON fetches.
4. For create-user then assign-projects, report partial success with the created user ID if assignment fails. Offer assignment-only recovery; do not recreate or automatically delete the account. Validate the assignment action result, not just HTTP status. Treat refresh failure after a successful mutation separately from mutation failure.
5. Specify concurrency per operation: prevent duplicate submission for writes; use latest-result-wins for replaceable reads. Always reset pending state on failure/interruption. A component that unmounts must not receive stale UI updates.
6. Migrate remaining application-owned async UI workflows, preserving modal behavior and French messages. Leave local filtering, derived state, dialog opening, and purely visual components in Svelte.

Exit: tests cover returned provider errors, partial success and assignment-only retry, duplicate submission, and unmount during an operation. Browser smoke checks cover representative admin forms and failed submissions. No private server modules enter the client bundle.

## Phase 6 — Matterport integration

Targets: `src/routes/(app)/app/projets/[id]/+page.svelte`, `src/lib/pemd-edit-mode.svelte.ts`, and any SDK usage in details/playground discovered in Phase 0.

1. Introduce a typed Matterport service exposing only operations actually used: connection, disconnect, tag add/remove, pointer subscription, and other discovered operations. Keep both existing connection modes through adapters.
2. Model connection ownership explicitly. Scope the iframe load listener, SDK connection, subscriptions, and timers to the owning viewer. Finalizers must remove listeners, cancel subscriptions, clear timers, and disconnect exactly as supported by the SDK.
3. Handle late SDK connection after unmount/reconnection: dispose the obsolete connection and never publish it to current state. Add a bounded connection/iframe wait timeout. Do not claim interruption cancels SDK work when it cannot.
4. Serialize tag reconciliation or otherwise enforce a single owner of the current desired tag set. Rapid filter toggles must converge on the latest selection. Track SDK-created IDs so late completions and partially failed updates can be reconciled without orphaned or duplicate tags.
5. Preserve the distinction between database persistence and viewer display: a tag saved to the database but failing to appear in Matterport should report a display failure and allow viewer-only retry.
6. Use a fake SDK with controllable delayed promises and cancellable subscriptions. Test unmount while connecting, repeated mode changes, connection rejection/timeout, rapid toggles, partial tag addition/removal, and repeated mount/unmount cleanup. Test non-cancellable late completions explicitly.
7. Smoke-test a real configured viewer when credentials/model access are available: connect, switch mode, filter, place a tag, navigate away/back. Keep simulated coverage and any unverified real SDK behavior clearly separated.

Exit: deterministic lifecycle/race tests pass and no application-owned detached viewer promises remain. Vendored SDK internals remain untouched.

## Phase 7 — CLI, consolidation, and final verification

1. Migrate `scripts/create-admin.ts` with a CLI-specific runtime, keeping hidden password entry, explicit target confirmation, existing-account refusal, transaction behavior, and resource cleanup. Do not import SvelteKit `$env` into the CLI. Test using fakes or an isolated test database; never execute administrator creation against production.
2. Repeat the Phase 0 inventory. Classify every remaining `async`, raw client call, timer, subscription, and execution boundary. Remove obsolete Promise wrappers and unused helpers. Remaining promises are allowed at documented SDK/framework adapters and CLI/DOM bridges.
3. Audit all Effect execution calls: none inside domain services or reusable workflows. Audit catches/retries: no generic recovery that silently turns defects into success, no mutation replay, no swallowed authorization failures.
4. Run the full check/test/lint/format-check/build set using the recorded toolchain. Compare failures with baseline. Verify production client output contains no server credentials/modules and report bundle-size changes. Avoid global formatting churn.
5. Run browser flows for login, project list/viewer, PEMD creation, user administration, CERFA, synthesis exports, and permission denial. Report unavailable credential-dependent verification precisely.
6. Update `docs/README.md` with the selected tooling and migration architecture; finalize the status document with remaining intentional boundaries and all check results.

## Completion criteria

- All inventory entries are completed or justified pure/vendor/framework boundaries; no unlisted application-owned async business workflow remains.
- Existing route/action/data contracts, project access restrictions, export content, and authentication behavior are preserved, apart from explicitly documented error/recovery improvements above.
- Workflows have typed failures and injectable dependencies, with execution confined to external boundaries.
- Server request data and browser operation state are isolated correctly; owned resources clean up on success, failure, and interruption.
- Meaningful tests cover permissions, validation, partial writes, external returned errors, request isolation, and Matterport races—not just successful wrapper execution.
- Checks pass or specific pre-existing/environment blockers are documented. Do not declare verification passed when it was skipped.
- No production mutations, schema migrations, deployment, major framework upgrade, or vendored SDK rewrite was needed.

## Reference sources

Use documentation for the pinned major and installed declarations as the API authority:

- [Effect website and release status](https://effect.website/)
- [Effect 3 documentation](https://effect.website/docs/v3/getting-started/introduction)
- [Effect 3 resource management](https://effect.website/docs/v3/resource-management/introduction)
- [Effect 3 runtime](https://effect.website/docs/v3/runtime)

## Handoff prompt

> Implement `/Users/osbyrne/code/osbyrne/pemd360/docs/EFFECT_MIGRATION_PLAN.md` using GPT 5.6 Luna with max reasoning. Follow the phases sequentially and maintain `docs/EFFECT_MIGRATION_STATUS.md` after each verified batch. Start with the inventory, toolchain decision, and baseline checks, then continue through all migration phases. Preserve existing UI, route contracts, permissions, and database schema. Use the pinned stable Effect 3 major consistently. Do not stop after the pilot, deploy, or run production mutations. Finish with the completed scope, verification evidence, intentional framework boundaries, and any precise outstanding blockers.
