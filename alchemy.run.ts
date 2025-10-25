import alchemy from 'alchemy';
import { SvelteKit } from 'alchemy/cloudflare';

import packageJson from './package.json';

const app = await alchemy(packageJson.name);

export const worker = await SvelteKit('website', {
	name: `${packageJson.name}-website-islamzaoui`
});

// eslint-disable-next-line no-console
console.log('🌐 url:', worker.url);

await app.finalize();
