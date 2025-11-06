import { SessionRepo, SessionRepoId } from '@/server/repos/session.repo';
import { TransactionRepo, TransactionRepoId } from '@/server/repos/transaction.repo';
import { UserRepo, UserRepoId } from '@/server/repos/user.repo';
import { AuthService, AuthServiceId } from '@/server/services/auth.service';
import { DatabaseService, DatabaseServiceId } from '@/server/services/database.service';
import { TransactionService, TransactionServiceId } from '@/server/services/transaction.service';

import {
	buildContainer,
	createServiceContainerHandle,
	createUseService,
	scoped,
	singleton,
} from './di';

const services = [
	singleton('DatabaseService', DatabaseServiceId, DatabaseService),
	singleton('UserRepo', UserRepoId, UserRepo),
	singleton('SessionRepo', SessionRepoId, SessionRepo),
	singleton('TransactionRepo', TransactionRepoId, TransactionRepo),
	scoped('AuthService', AuthServiceId, AuthService),
	scoped('TransactionService', TransactionServiceId, TransactionService),
] as const;

const container = buildContainer(services);

export const useService = createUseService(container);

export const serviceContainerHandle = createServiceContainerHandle(container);
