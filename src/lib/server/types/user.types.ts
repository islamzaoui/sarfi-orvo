import type { InferSelectModel } from 'drizzle-orm';

import type { usersTable } from '../database/schema';

export type IUser = InferSelectModel<typeof usersTable>;

export type ICreateUser = Omit<IUser, 'id' | 'createdAt' | 'updatedAt'>;

export type IUpdateUser = Partial<ICreateUser>;
