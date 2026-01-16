/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: 'pemd360',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			home: 'cloudflare'
		};
	},
	async run() {
		// Cloudflare D1 Database
		const db = new sst.cloudflare.D1('Database');

		// Cloudflare R2 Bucket
		const bucket = new sst.cloudflare.Bucket('Storage');

		// Secrets for BetterAuth and R2
		const betterAuthSecret = new sst.Secret('BetterAuthSecret');
		const betterAuthUrl = new sst.Secret('BetterAuthUrl');
		const s3ApiUrl = new sst.Secret('S3_API_URL');
		const r2AccessKeyId = new sst.Secret('R2_ACCESS_KEY_ID');
		const r2SecretAccessKey = new sst.Secret('R2_SECRET_ACCESS_KEY');

		new sst.cloudflare.SvelteKit('Web', {
			link: [
				db,
				bucket,
				betterAuthSecret,
				betterAuthUrl,
				s3ApiUrl,
				r2AccessKeyId,
				r2SecretAccessKey
			]
		});
	}
});
