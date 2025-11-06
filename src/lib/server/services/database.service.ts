import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import { getRequestEvent } from '$app/server';
import { drizzle as memeoryDrizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/d1';

import * as schema from '@/server/database/schema';
import { createServiceIdentifier, injectable } from '@/server/di';

type DatabaseORM = DrizzleD1Database<typeof schema> | BetterSQLite3Database<typeof schema>;

export interface IDatabaseService {
	readonly drizzle: DatabaseORM;
}

export const DatabaseServiceId = createServiceIdentifier<IDatabaseService>('DatabaseService');

@injectable()
export class DatabaseService implements IDatabaseService {
	private _drizzle: DatabaseORM | null = null;

	get drizzle() {
		if (!this._drizzle) {
			const DB = getRequestEvent().platform?.env.DB;
			if (!DB) {
				this._drizzle = memeoryDrizzle({ schema });
				return this._drizzle;
			}

			this._drizzle = drizzle(DB, {
				schema,
			});
		}
		return this._drizzle;
	}
}
