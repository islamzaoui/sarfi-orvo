import { eq } from 'drizzle-orm';

import type { IDatabaseService } from '@/server/services/database.service';
import type { ISessionWithUser } from '@/server/types/session.types';
import type { ICreateUser, IUser } from '@/server/types/user.types';

import { usersTable } from '@/server/database/schema';
import { createServiceIdentifier, inject, Singleton } from '@/server/di';
import { DatabaseServiceId } from '@/server/services/database.service';

export interface IUserRepo {
	session: ISessionWithUser | null;
	createUser: (data: ICreateUser) => Promise<IUser>;
	getUserById: (id: string) => Promise<IUser | null>;
	getUserByEmail: (email: string) => Promise<IUser | null>;
}

export const UserRepoId = createServiceIdentifier<IUserRepo>();

@Singleton(UserRepoId)
export class UserRepo implements IUserRepo {
	session: ISessionWithUser | null = null;

	constructor(@inject(DatabaseServiceId) private readonly dbService: IDatabaseService) {}

	async createUser(data: ICreateUser): Promise<IUser> {
		const [user] = await this.dbService.drizzle.insert(usersTable).values(data).returning();

		return user;
	}

	async getUserById(id: string): Promise<IUser | null> {
		const [user] = await this.dbService.drizzle
			.select()
			.from(usersTable)
			.where(eq(usersTable.id, id))
			.limit(1);

		if (!user) {
			return null;
		}

		return user;
	}

	async getUserByEmail(email: string): Promise<IUser | null> {
		const [user] = await this.dbService.drizzle
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, email))
			.limit(1);

		if (!user) {
			return null;
		}

		return user;
	}
}
