# PEMD360

PEMD360 is a web application for building diagnostics and waste management (PEMD - Plan d'Évacuation des Matériaux et Déchets). The application uses Matterport 3D scans to create interactive tags for tracking various building materials, hazards (asbestos, lead, termites, structural issues), and waste management plans.

# Setup

## Pre-Requisite

- [Node.js ^22](https://nodejs.org/en/download)
- [Doppler](https://docs.doppler.com/docs/install-cli)
- Optional: [bws](https://bitwarden.com/help/cli/#download-and-install)
- Optional: [Turso CLI](https://docs.turso.tech/cli/introduction)
- Optional: [Vercel CLI](https://vercel.com/docs/cli)

## Installation

```bash
# Install project dependencies:
npm install
```

## Secrets

### With Doppler (recommended)

```bash
# Login with Doppler to get the environment variables
doppler login

# Select project and config
doppler setup
```

### With Bitwarden

```bash
# Create a machine account token on Bitwarden, then export it as an environment variable:
export BWS_ACCESS_TOKEN="your_machine_account_token"

# Find your project ID on Bitwarden:
bws project list

# Run project locally (database is still remote with Turso)
bws run --project-id your_project_id -- 'npm run dev'
```

I am also considering [Apple Passwords or 1Passwords](https://jonmagic.com/posts/stop-putting-secrets-in-dotenv-files), and [bwenv](https://bwenv.netlify.app/) with [direnv](https://direnv.net/).

# Database Migration

```bash
# Generate migration
npm run drizzle-kit generate

# Apply migration
npm run drizzle-kit migrate
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
