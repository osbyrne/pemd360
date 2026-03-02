# PEMD360

PEMD360 is a web application for building diagnostics and waste management (PEMD - Plan d'Évacuation des Matériaux et Déchets). The application uses Matterport 3D scans to create interactive tags for tracking various building materials, hazards (asbestos, lead, termites, structural issues), and waste management plans.

# Setup

## Pre-Requisite

- [Node.js ^22](https://nodejs.org/en/download)
- [bws](https://bitwarden.com/help/cli/#download-and-install)

## Installation

```bash
# Install project dependencies:
npm install

# Create a machine account token on Bitwarden, then export it as an environment variable:
export BWS_ACCESS_TOKEN="your_machine_account_token"

# Find your project ID on Bitwarden:
bws projects list

# Run project locally (database is still remote with Turso)
bws run --project-id your_project_id -- 'npm run dev'
```

# Database Migration

```bash
# Generate migration
npm run drizzle-kit generate

# Apply migration
npm run drizzle-kit migrate
```

# Key Features

1. **Matterport Integration**: 3D building scans with interactive tag placement
2. **Multi-tenant**: Companies > Establishments > Projects hierarchy
3. **Diagnostics**: Track asbestos, lead, termites, structural issues
4. **PEMD**: Waste management and material reuse planning
5. **CERFA Forms**: French regulatory form management
6. **Export**: Generate Excel and PDF reports
7. **Role-based Access**: Admin users with Better Auth

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
