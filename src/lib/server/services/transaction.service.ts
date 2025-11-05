import type { Transaction, TransactionCreate } from '@/schemas/transaction.schema';

import type { ITransactionRepo } from '../repos/transaction.repo';
import type { IAuthService } from './auth.service';

import { createServiceIdentifier, inject, Scoped } from '../di';
import { ServiceError } from '../error';
import { TransactionRepoId } from '../repos/transaction.repo';
import { AuthServiceId } from './auth.service';

export interface ITransactionService {
	getTransactions: () => Promise<Transaction[]>;
	createTransaction: (data: TransactionCreate) => Promise<Transaction>;
	deleteTransactionById: (id: string) => Promise<void>;
}

export const TransactionServiceId = createServiceIdentifier<ITransactionService>();

@Scoped(TransactionServiceId)
export class TransactionService implements ITransactionService {
	constructor(
		@inject(TransactionRepoId) private readonly transactionRepo: ITransactionRepo,
		@inject(AuthServiceId) private readonly authService: IAuthService
	) {}

	async getTransactions(): Promise<Transaction[]> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			throw new ServiceError('UNAUTHORIZED');
		}

		const transactions = await this.transactionRepo.getTransactionsByuserId(userId);

		return transactions.map(
			(t) =>
				({
					id: t.id,
					amount: t.amount,
					type: t.type,
					details: t.details ?? undefined,
					madeAt: t.madeAt,
				}) satisfies Transaction
		);
	}

	async createTransaction(data: TransactionCreate): Promise<Transaction> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			throw new ServiceError('UNAUTHORIZED');
		}

		const transaction = await this.transactionRepo.createTransaction({
			userId,
			amount: data.amount,
			type: data.type,
			details: data.details ?? null,
			madeAt: data.madeAt,
		});

		return {
			id: transaction.id,
			amount: transaction.amount,
			type: transaction.type,
			details: transaction.details ?? undefined,
			madeAt: transaction.madeAt,
		} satisfies Transaction;
	}

	async deleteTransactionById(id: string): Promise<void> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			throw new ServiceError('UNAUTHORIZED');
		}

		await this.transactionRepo.deleteTransactionById(id);
	}
}
