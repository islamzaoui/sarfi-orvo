import type { InferSelectModel } from 'drizzle-orm';

import type { sessionsTable } from '../database/schema';
import type { IUser } from './user.types';

export type ISession = InferSelectModel<typeof sessionsTable>;

export interface ISessionWithToken extends ISession {
	token: string;
}

export interface ISessionWithUser extends Omit<ISession, 'userId'> {
	user: IUser;
}
