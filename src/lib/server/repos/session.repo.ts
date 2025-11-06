import { eq } from 'drizzle-orm';

import type { IDatabaseService } from '@/server/services/database.service';
import type { ISession, ISessionWithToken, ISessionWithUser } from '@/server/types/session.types';

import { sessionsTable, usersTable } from '@/server/database/schema';
import { createServiceIdentifier, inject, injectable } from '@/server/di';
import { DatabaseServiceId } from '@/server/services/database.service';

export interface ISessionRepo {
	readonly INACTIVE_TIMEOUT_IN_SECONDS: number;
	readonly ACTIVITY_CHECK_INTERVAL_IN_SECONDS: number;
	createSession: (userId: string) => Promise<ISessionWithToken>;
	deleteSessionById: (id: string) => Promise<void>;
	getSessionById: (id: string) => Promise<ISession | null>;
	validateSessionToken: (token: string) => Promise<ISessionWithUser | null>;
}

export const SessionRepoId = createServiceIdentifier<ISessionRepo>('SessionRepo');

@injectable()
export class SessionRepo implements ISessionRepo {
	readonly INACTIVE_TIMEOUT_IN_SECONDS = 60 * 60 * 24 * 7;
	readonly ACTIVITY_CHECK_INTERVAL_IN_SECONDS = 60 * 60;

	constructor(@inject(DatabaseServiceId) private readonly dbService: IDatabaseService) {}

	private async hashSecret(secret: string): Promise<Uint8Array> {
		const secretBytes = new TextEncoder().encode(secret);
		const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
		return new Uint8Array(secretHashBuffer);
	}

	private constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
		if (a.byteLength !== b.byteLength) {
			return false;
		}
		let c = 0;
		for (let i = 0; i < a.byteLength; i++) {
			c |= a[i] ^ b[i];
		}
		return c === 0;
	}

	private createId(): string {
		const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
		const bytes = new Uint8Array(24);
		crypto.getRandomValues(bytes);
		let id = '';
		for (let i = 0; i < bytes.length; i++) {
			id += alphabet[bytes[i] >> 3];
		}
		return id;
	}

	async createSession(userId: string): Promise<ISessionWithToken> {
		const { drizzle } = this.dbService;
		const id = this.createId();
		const secret = this.createId();
		const secretHash = await this.hashSecret(secret);
		const token = `${id}.${secret}`;

		const [session] = await drizzle
			.insert(sessionsTable)
			.values({
				id,
				userId,
				secretHash,
			})
			.returning()
			.execute();

		return {
			...session,
			token,
		};
	}

	async deleteSessionById(id: string): Promise<void> {
		const { drizzle } = this.dbService;
		await drizzle.delete(sessionsTable).where(eq(sessionsTable.id, id));
	}

	async getSessionById(id: string): Promise<ISession | null> {
		const now = new Date();
		const { drizzle } = this.dbService;

		const result = await drizzle.query.sessionsTable.findFirst({
			where: eq(sessionsTable.id, id),
		});

		if (!result) {
			return null;
		}

		const session = result;
		if (
			now.getTime() - session.createdAt.getTime() >=
			this.INACTIVE_TIMEOUT_IN_SECONDS * 1000
		) {
			await this.deleteSessionById(id);
			return null;
		}

		return session;
	}

	async validateSessionToken(token: string): Promise<ISessionWithUser | null> {
		const now = new Date();
		const { drizzle } = this.dbService;

		const tokenParts = token.split('.');
		if (tokenParts.length !== 2) {
			return null;
		}

		const sessionId = tokenParts[0];
		const sessionSecret = tokenParts[1];
		const session = await this.getSessionById(sessionId);

		if (!session) {
			return null;
		}

		const secretHash = await this.hashSecret(sessionSecret);
		if (!this.constantTimeEqual(secretHash, session.secretHash)) {
			return null;
		}

		if (
			now.getTime() - session.lastVerifiedAt.getTime() >=
			this.ACTIVITY_CHECK_INTERVAL_IN_SECONDS * 1000
		) {
			session.lastVerifiedAt = now;
			await drizzle
				.update(sessionsTable)
				.set({
					lastVerifiedAt: session.lastVerifiedAt,
				})
				.where(eq(sessionsTable.id, session.id))
				.execute();
		}

		const user = (await drizzle.query.usersTable.findFirst({
			where: eq(usersTable.id, session.userId),
		}))!;

		return {
			id: session.id,
			user,
			secretHash: session.secretHash,
			createdAt: session.createdAt,
			lastVerifiedAt: session.lastVerifiedAt,
		};
	}
}
