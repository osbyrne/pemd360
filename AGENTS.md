
# CLAUDE.md - Project Context for AI Assistants

This document provides essential context about the project for AI assistants like Claude.

## Project Overview

**PEMD360** is a web application for building diagnostics and waste management (PEMD - Plan d'Évacuation des Matériaux et Déchets). The application uses Matterport 3D scans to create interactive tags for tracking various building materials, hazards (asbestos, lead, termites, structural issues), and waste management plans.

## Tech Stack

### Frontend
- **Framework**: [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI
- **Icons**: lucide-svelte

### Backend
- **Runtime**: Node.js
- **Database ORM**: Drizzle ORM
- **Development Database**: SQLite (better-sqlite3) via local file
- **Production Database**: Cloudflare D1 (planned migration)
- **Authentication**: Better Auth with email/password + admin plugin
- **File Storage**: Cloudflare R2 (S3-compatible)

### External APIs
- **Matterport SDK**: Used for 3D model viewing and tag management
  - API key required in `.env` as `MATTERPORT_SDK_KEY`
  - Documentation: https://matterport.github.io/showcase-sdk/

### Document Generation
- **ExcelJS**: For Excel report generation
- **pdf-lib**: For PDF generation and manipulation

### Deployment
- **Adapter**: `@sveltejs/adapter-cloudflare`
- **Target**: Cloudflare Pages (with Workers and D1)

## Project Structure

```
src/
├── lib/
│   ├── assets/          # Static assets (images, favicon)
│   ├── components/      # Reusable Svelte components
│   ├── server/
│   │   ├── db/
│   │   │   ├── client.ts     # Drizzle database client
│   │   │   ├── schema.ts     # Database schema definitions
│   │   │   └── functions.ts  # Database utility functions
│   │   ├── s3/
│   │   │   └── client.ts     # S3/R2 client configuration
│   │   ├── admin.ts          # Admin utilities
│   │   └── excel.ts          # Excel generation utilities
│   ├── auth.ts              # Better Auth configuration
│   └── auth-client.ts       # Client-side auth utilities
├── routes/
│   ├── (landing)/           # Public pages (landing, login, signup)
│   ├── (app)/
│   │   └── app/             # Protected app routes
│   │       ├── projets/     # Project management
│   │       ├── admin/       # Admin panels
│   │       ├── inventaire/  # Inventory management
│   │       ├── cerfa/       # CERFA form management
│   │       └── details/     # Project details with Matterport viewer
│   └── +error.svelte        # Error page
├── hooks.server.ts          # SvelteKit server hooks
└── app.d.ts                 # TypeScript type definitions
```

## Database Schema

The database uses SQLite (dev) / Cloudflare D1 (prod) with Drizzle ORM. Main tables include:

### Authentication (Better Auth)
- `user` - User accounts with roles and ban status
- `session` - Active sessions
- `account` - OAuth accounts and credentials
- `verification` - Email verification tokens

### Core Business Logic
- `societe` - Companies
- `etablissement` - Establishments/facilities
- `projet` - Projects linked to establishments
- `user_projet` - User-project associations (Better Auth users)
- `user_legacy` - Legacy user system
- `projet_user` - Project-user associations (legacy)

### Diagnostics & Tags
- `tags_amiante` - Asbestos tags with Matterport positions
- `tags_plomb` - Lead tags
- `tags_structure` - Structural tags
- `tags_termite` - Termite tags
- `tag_mail` - Email tags for communication

### PEMD/Waste Management
- `pemd` - PEMD entries (materials/waste data)
- `extrapolation` - Extrapolation calculations
- `groupe` - Material groups
- `categorie_v2` - Material categories
- `objets` - Objects/materials catalog
- `nature_v2` - Material nature definitions

### CERFA Forms
- `cerfa_diagnostic` - Diagnostic information
- `cerfa_diagnostiqueur` - Diagnostician details
- `cerfa_mtr_ouvrage` - Project owner information
- `cerfa_operation` - Operation details

## Environment Variables

See `/.env.example`

## Database Migration

### Development
```bash
# Generate migration
npm run drizzle-kit generate

# Apply migration
npm run drizzle-kit migrate
```

### Production (Cloudflare D1)
The project is configured to migrate from local SQLite to Cloudflare D1. When deploying:

1. Create D1 database: `npx wrangler d1 create pemd360`
2. Update `wrangler.toml` with D1 bindings
3. Run migrations: `npx wrangler d1 migrations apply pemd360`
4. Update database client to use D1 bindings in production

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format
```

## Key Features

1. **Matterport Integration**: 3D building scans with interactive tag placement
2. **Multi-tenant**: Companies > Establishments > Projects hierarchy
3. **Diagnostics**: Track asbestos, lead, termites, structural issues
4. **PEMD**: Waste management and material reuse planning
5. **CERFA Forms**: French regulatory form management
6. **Export**: Generate Excel and PDF reports
7. **Role-based Access**: Admin users with Better Auth

## Important Notes

### Matterport SDK Usage
- Tags are stored with `anchorPosition` and `stemVector` for 3D positioning
- Images can be captured directly from the Matterport viewer
- The SDK is loaded via CDN (see package.json trusted dependencies)

### Database Migration Strategy
- Current: Local SQLite file (`betterauth_pemd.sqlite`)
- Target: Cloudflare D1
- Migration will require:
  - Updating `src/lib/server/db/client.ts` to detect environment
  - Using platform bindings in production
  - Data migration script

### Authentication
- Uses Better Auth with Drizzle adapter
- Email/password authentication enabled
- Admin plugin for role management
- Session management via cookies

## Common Tasks

### Adding a New Table
1. Define schema in `src/lib/server/db/schema.ts`
2. Add relations if needed
3. Run `npx drizzle-kit generate` to create migration
4. Run `npx drizzle-kit migrate` to apply

### Creating a New Protected Route
1. Add under `src/routes/(app)/app/`
2. Use `+layout.server.ts` for authentication checks
3. Access user via `locals.user`

### Working with Matterport Tags
- Reference existing tag tables (tags_amiante, tags_plomb, etc.)
- Store anchorPosition and stemVector from Matterport SDK
- Image can be base64 data URL or R2 URL
- Link to projet via `sidId` (projet.id)

### Generating Reports
- Use `src/lib/server/excel.ts` for Excel generation with ExcelJS
- Use `pdf-lib` for PDF manipulation
- Export endpoints are in `src/routes/(app)/app/admin/*/export/+server.ts`

## Troubleshooting

### Database Issues
- Ensure `DATABASE_URL` points to a valid SQLite file
- Check file permissions on the database file
- Verify migrations are applied: `npx drizzle-kit push`

### Matterport Not Loading
- Verify `MATTERPORT_SDK_KEY` is set in `.env`
- Check browser console for SDK errors
- Ensure model ID is valid

### Authentication Errors
- Verify `BETTER_AUTH_SECRET` is set
- Clear cookies and sessions if having issues

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Matterport SDK Docs](https://matterport.github.io/showcase-sdk/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [DaisyUI Docs](https://daisyui.com/)
