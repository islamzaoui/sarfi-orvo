import alchemy from 'alchemy';
import { D1Database, SvelteKit } from 'alchemy/cloudflare';

import packageJson from './package.json';

const app = await alchemy(packageJson.name);

const database = await D1Database(`${packageJson.name}-db`, {
	name: `${packageJson.name}-db`,
	migrationsDir: './migrations',
});

export const worker = await SvelteKit('website', {
	name: `${packageJson.name}-website-islamzaoui`,
	bindings: {
		DB: database,
	},
	domains: ['sarfi.orvo.top'],
});

// eslint-disable-next-line no-console
console.log('🌐 url:', worker.url);

await app.finalize();
