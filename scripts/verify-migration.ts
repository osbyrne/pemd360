import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config({ path: '.env' });

const client = createClient({
	url: process.env.TURSO_CONNECTION_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!
});

async function verify() {
	console.log('🔍 Checking database schema after migration...\n');

	// Check cerfa_diagnostic columns
	const cerfaColumns = await client.execute("PRAGMA table_info(cerfa_diagnostic)");
	console.log('cerfa_diagnostic columns:');
	console.table(cerfaColumns.rows);

	// Check projet columns - looking for the redundant id_etablissement_id
	const projetColumns = await client.execute("PRAGMA table_info(projet)");
	console.log('\nprojet columns:');
	console.table(projetColumns.rows);

	// Quick query test
	console.log('\n📊 Testing queries...\n');

	try {
		const result = await client.execute("SELECT COUNT(*) as count FROM projet");
		console.log('✅ Can query projet table:', result.rows[0]);
	} catch (error: any) {
		console.log('❌ Error querying projet:', error.message);
	}

	try {
		const result = await client.execute("SELECT COUNT(*) as count FROM etablissement");
		console.log('✅ Can query etablissement table:', result.rows[0]);
	} catch (error: any) {
		console.log('❌ Error querying etablissement:', error.message);
	}

	client.close();
}

verify();
