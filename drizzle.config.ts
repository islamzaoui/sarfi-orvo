import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/database/schema.ts',
	out: './migrations',
	dialect: 'sqlite',
});
