# PEMD360

PEMD360 is a web application for building diagnostics and waste management (PEMD - Plan d'Évacuation des Matériaux et Déchets). The application uses Matterport 3D scans to create interactive tags for tracking various building materials, hazards (asbestos, lead, termites, structural issues), and waste management plans.

# Setup

## Pre-Requisite

- Bun

## Reproducible Toolchain

The Flox environment in `.flox/` pins the local runtimes and service CLIs used by this
repository: Bun 1.4.2, Node.js 24.21.0, Turso CLI 1.0.33, and Wrangler 4.148.0
(Cloudflare Workers). From the repository root, run `flox activate` to enter that environment.
The JavaScript dependency graph remains pinned by `bun.lock`.

## Tooling and Effect architecture

- Bun installs dependencies from `package.json` and runs its scripts through `bun run`. Commit `bun.lock` for reproducible installs.
- The application is pinned to stable `effect@4.0.5`, using `Context.Service`, `Effect.result`, Effect-based Schema decoding, and managed runtimes. `bun.lock` pins this version.
- Server workflows under `src/lib/server/workflows` compose typed Effects through lazy services for the database, authorization, storage, email, and reports. SvelteKit route files only decode request data and map typed outcomes to the existing route contracts.
- Browser workflows under `src/lib/client/workflows` use client-only adapters. Components retain markup, local state, DOM bindings, SvelteKit form enhancement, and navigation; the Matterport viewer has an owned connection and serialized tag reconciliation lifecycle.
- `scripts/create-admin.ts` has its own CLI runtime and does not import SvelteKit `$env` modules. It keeps hidden password entry, explicit target confirmation, existing-account refusal, and transactional cleanup.

Run the project checks with Bun:

```bash
bun run check
bun run test
bun run lint
bun run fmt:check
```

The migration ledger and its verification evidence are in `docs/EFFECT_MIGRATION_STATUS.md`.

## Installation

```bash
bun install
```

Copy `.env.example` to `.env` and fill in the required values.

## CERFA data migration

Before running the updated CERFA operation forms against an existing database, apply
`drizzle/0005_cerfa_renovation_date.sql` once. It adds the nullable `date_renovation`
column to `cerfa_operation`; existing rows remain intact. The month is stored as
`YYYY-MM`, shown in the editor, and printed as `MM/YYYY` in the PDF.

For installations already tracked by Drizzle, use the normal migration runner. For
an existing database maintained outside Drizzle, check `PRAGMA table_info(cerfa_operation)`
and apply this one SQL file if `date_renovation` is absent; do not replay the old
schema-cleanup migration against an already-upgraded database.

CERFA reads retry recognized transient transport failures at most twice, with
exponential delay and a 15-second limit. Writes are transactional and are never
retried automatically. PDF waste masses convert kilograms to tonnes, waste codes
come from the material nature, and possible treatment routes come from the configured
flags. Missing route information is displayed explicitly.

## Creating an administrator

Administrator bootstrap is intentionally available only as a local CLI command. Public signup does not create accounts.

The command uses `TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, and optionally `BETTER_AUTH_URL` from `.env`. It displays the target database before making changes, asks for an explicit confirmation, and prompts for the password without displaying or storing it.

```bash
bun run admin:create --email admin@example.com --name "Admin Name"
```

Type `create admin` when prompted, then enter and confirm a password of at least eight characters. The user and credential account are created atomically with the `admin` role.

The command refuses to modify or promote an existing email address. To promote an existing user, sign in as an administrator and change the role from `/app/admin/utilisateurs`.

Security notes:

- Never put the administrator password in `.env` or command-line arguments.
- Keep `.env` untracked and restrict local access with `chmod 600 .env`.
- Check the displayed Turso database URL carefully before confirming.
- In deployed environments, configure secrets through the hosting platform rather than shipping `.env`.

# Database Migration

```bash
# Generate migration
bunx drizzle-kit generate

# Apply migration
bunx drizzle-kit migrate
```

# Matterport SDK Usage

- Tags are stored with `anchorPosition` and `stemVector` for 3D positioning
- Images can be captured directly from the Matterport viewer
- The SDK is loaded via CDN (see package.json trusted dependencies)

# Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Matterport SDK Docs](https://matterport.github.io/showcase-sdk/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [DaisyUI Docs](https://daisyui.com/)

# Common Tasks

## Adding a New Table

1. Define schema in `src/lib/server/db/schema.ts`
2. Add relations if needed
3. Run `bunx drizzle-kit generate` to create migration
4. Run `bunx drizzle-kit migrate` to apply

## Creating a New Protected Route

1. Add under `src/routes/(app)/app/`
2. Use `+layout.server.ts` for authentication checks
3. Access user via `locals.user`

## Working with Matterport Tags

- Reference existing tag tables (tags_amiante, tags_plomb, etc.)
- Store anchorPosition and stemVector from Matterport SDK
- Image can be base64 data URL or R2 URL
- Link to projet via `sidId` (projet.id)

## Generating Reports

- Use `src/lib/server/excel.ts` for Excel generation with ExcelJS
- Use `pdf-lib` for PDF manipulation
- Export endpoints are in `src/routes/(app)/app/admin/*/export/+server.t`

## Matterport Not Loading

- Verify `MATTERPORT_SDK_KEY` is set
- Check browser console for SDK errors
- Ensure model ID is valid

## Authentication Errors

- Verify `BETTER_AUTH_SECRET` is set
- Clear cookies and sessions if having issues

## notes

Run `bun run check` and `bun run fmt:check` before committing.
