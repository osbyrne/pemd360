import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

async function applyMigration() {
	console.log('🔄 Connecting to Turso database...');

	// Read the migration file
	const migrationSQL = readFileSync('drizzle/0000_schema_cleanup.sql', 'utf-8');

	// Split by statement-breakpoint and filter out comments/empty lines
	const statements = migrationSQL
		.split('--> statement-breakpoint')
		.map(s => s.trim())
		.filter(s => s && !s.startsWith('--') && s !== '');

	console.log(`📝 Found ${statements.length} statements to execute\n`);

	let successCount = 0;
	let skipCount = 0;

	for (let i = 0; i < statements.length; i++) {
		const statement = statements[i];
		const preview = statement.split('\n')[0].substring(0, 80);

		try {
			console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`);
			await client.execute(statement);
			console.log('  ✅ Success\n');
			successCount++;
		} catch (error: any) {
			// Check if it's a "already exists" or "not found" error - these are OK to skip
			if (
				error.message?.includes('already exists') ||
				error.message?.includes('no such column') ||
				error.message?.includes('no such index')
			) {
				console.log(`  ⚠️  Skipped (${error.message})\n`);
				skipCount++;
			} else {
				console.error(`  ❌ Failed: ${error.message}\n`);
				throw error;
			}
		}
	}

	console.log('═══════════════════════════════════════');
	console.log(`✅ Migration completed!`);
	console.log(`   Executed: ${successCount} statements`);
	console.log(`   Skipped: ${skipCount} statements`);
	console.log('═══════════════════════════════════════\n');

	// Verify the changes
	console.log('🔍 Verifying changes...\n');

	const checks = [
		{ name: 'etablissement columns', query: "PRAGMA table_info(etablissement)" },
		{ name: 'projet columns', query: "PRAGMA table_info(projet)" },
		{ name: 'tag_mail columns', query: "PRAGMA table_info(tag_mail)" },
		{ name: 'cerfa_diagnostic columns', query: "PRAGMA table_info(cerfa_diagnostic)" },
		{ name: 'pemd indexes', query: "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='pemd'" }
	];

	for (const check of checks) {
		console.log(`Checking ${check.name}:`);
		const result = await client.execute(check.query);
		console.log(result.rows);
		console.log('');
	}

	client.close();
}

applyMigration().catch((error) => {
	console.error('❌ Migration failed:', error);
	process.exit(1);
});
