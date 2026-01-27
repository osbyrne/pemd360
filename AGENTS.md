Read /docs/README.md

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
