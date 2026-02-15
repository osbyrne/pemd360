import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

async function dropRedundantColumn() {
	console.log('🔄 Removing redundant id_etablissement_id column from projet table...\n');

	try {
		// SQLite doesn't support DROP COLUMN directly, need to recreate table
		console.log('Step 1: Dropping old index on id_etablissement_id...');
		await client.execute("DROP INDEX IF EXISTS projet_id_etablissement_id_idx");
		console.log('✅ Index dropped\n');

		console.log('Step 2: Attempting to drop column...');
		// Try the DROP COLUMN (newer SQLite/libSQL may support it)
		try {
			await client.execute("ALTER TABLE projet DROP COLUMN id_etablissement_id");
			console.log('✅ Column dropped successfully!\n');
		} catch (error: any) {
			console.log('⚠️  DROP COLUMN not supported, will need table recreation');
			console.log('   Error:', error.message);
			console.log('\n   The column remains but is no longer used in the application.');
			console.log('   It can be removed in a future maintenance window.\n');
		}

		// Verify final state
		console.log('📋 Final verification...');
		const columns = await client.execute("PRAGMA table_info(projet)");
		console.log('\nprojet table columns:');
		columns.rows.forEach((col: any) => {
			const marker = col.name === 'id_etablissement_id' ? ' ⚠️ (redundant)' : '';
			console.log(`  - ${col.name}${marker}`);
		});

	} catch (error: any) {
		console.error('❌ Error:', error.message);
		throw error;
	}

	client.close();
}

dropRedundantColumn();
