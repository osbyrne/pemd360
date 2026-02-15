import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

async function applyMigration() {
	console.log('🔄 Connecting to Turso database...\n');

	// Read the migration file
	const migrationSQL = readFileSync('drizzle/0000_schema_cleanup.sql', 'utf-8');

	// Split by statement-breakpoint
	const parts = migrationSQL.split('--> statement-breakpoint');

	// Extract actual SQL statements (not comments)
	const statements: string[] = [];
	for (const part of parts) {
		const lines = part.split('\n');
		const sqlLines: string[] = [];

		for (const line of lines) {
			const trimmed = line.trim();
			// Skip empty lines and comment-only lines
			if (trimmed && !trimmed.startsWith('--')) {
				sqlLines.push(line);
			}
		}

		const sql = sqlLines.join('\n').trim();
		if (sql && !sql.startsWith('--')) {
			statements.push(sql);
		}
	}

	console.log(`📝 Found ${statements.length} statements to execute\n`);

	let successCount = 0;
	let skipCount = 0;
	let errorCount = 0;

	for (let i = 0; i < statements.length; i++) {
		const statement = statements[i];
		// Get first line for preview
		const preview = statement.split('\n')[0].substring(0, 100);

		try {
			console.log(`[${i + 1}/${statements.length}] ${preview}...`);
			await client.execute(statement);
			console.log('  ✅ Success\n');
			successCount++;
		} catch (error: any) {
			const errorMsg = error.message || String(error);

			// Check if it's an acceptable "already done" error
			if (
				errorMsg.includes('already exists') ||
				errorMsg.includes('no such column to rename') ||
				errorMsg.includes('no such index')
			) {
				console.log(`  ⚠️  Skipped: ${errorMsg}\n`);
				skipCount++;
			} else {
				console.error(`  ❌ Error: ${errorMsg}\n`);
				errorCount++;
				// Continue with other statements instead of throwing
			}
		}
	}

	console.log('═══════════════════════════════════════');
	console.log(`📊 Migration Results:`);
	console.log(`   ✅ Successful: ${successCount}`);
	console.log(`   ⚠️  Skipped: ${skipCount}`);
	console.log(`   ❌ Failed: ${errorCount}`);
	console.log('═══════════════════════════════════════\n');

	// Verify the changes
	console.log('🔍 Verifying database state...\n');

	try {
		// Check if columns were renamed
		const checks = [
			{
				name: 'etablissement.societe_id',
				query: "SELECT societe_id FROM etablissement LIMIT 0",
				expect: 'Column should exist'
			},
			{
				name: 'projet.etablissement_id',
				query: "SELECT etablissement_id FROM projet LIMIT 0",
				expect: 'Column should exist'
			},
			{
				name: 'tag_mail.projet_id',
				query: "SELECT projet_id FROM tag_mail LIMIT 0",
				expect: 'Column should exist'
			},
			{
				name: 'cerfa_diagnostic.documents_consultes',
				query: "SELECT documents_consultes FROM cerfa_diagnostic LIMIT 0",
				expect: 'Column should exist'
			}
		];

		for (const check of checks) {
			try {
				await client.execute(check.query);
				console.log(`✅ ${check.name}: ${check.expect}`);
			} catch (error: any) {
				console.log(`❌ ${check.name}: ${error.message}`);
			}
		}

		console.log('\n📋 Checking indexes...');
		const indexes = await client.execute(
			"SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name LIKE '%pemd%' OR name LIKE '%etablissement%' OR name LIKE '%projet%' OR name LIKE '%tag_mail%'"
		);
		console.log(indexes.rows);

	} catch (error: any) {
		console.error('Error during verification:', error.message);
	}

	client.close();
}

applyMigration().catch((error) => {
	console.error('\n❌ Migration failed:', error);
	process.exit(1);
});
