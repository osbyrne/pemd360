# PEMD360

PEMD360 is a web application for building diagnostics and waste management (PEMD - Plan d'Évacuation des Matériaux et Déchets). The application uses Matterport 3D scans to create interactive tags for tracking various building materials, hazards (asbestos, lead, termites, structural issues), and waste management plans.

# Setup

## Pre-Requisite

- Deno

## Installation

```bash
deno install
```

Copy `.env.example` to `.env` and fill in the required values. 

## Creating an administrator

Administrator bootstrap is intentionally available only as a local CLI command. Public signup does not create accounts.

The command uses `TURSO_CONNECTION_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, and optionally `BETTER_AUTH_URL` from `.env`. It displays the target database before making changes, asks for an explicit confirmation, and prompts for the password without displaying or storing it.

```bash
deno run admin:create -- --email admin@example.com --name "Admin Name"
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
dx drizzle-kit generate

# Apply migration
dx drizzle-kit migrate
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
3. Run `npx drizzle-kit generate` to create migration
4. Run `npx drizzle-kit migrate` to apply

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

Run `deno run check` and fix issues before committing.
Also run `deno run fmt`.
