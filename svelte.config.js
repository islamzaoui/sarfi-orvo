import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import alchemy from 'alchemy/cloudflare/sveltekit';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: alchemy(),
		experimental: {
			remoteFunctions: true,
		},
		alias: {
			'@': './src/lib',
			'@/*': './src/lib/*',
		},
	},
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
};

export default config;
