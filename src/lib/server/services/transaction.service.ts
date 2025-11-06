import { error } from '@sveltejs/kit';

import type { Transaction, TransactionCreate } from '@/schemas/transaction.schema';
import type { ITransactionRepo } from '@/server/repos/transaction.repo';
import type { IAuthService } from '@/server/services/auth.service';

import { createServiceIdentifier, inject, injectable } from '@/server/di';
import { TransactionRepoId } from '@/server/repos/transaction.repo';
import { AuthServiceId } from '@/server/services/auth.service';

export interface ITransactionService {
	getTransactions: () => Promise<Transaction[]>;
	createTransaction: (data: TransactionCreate) => Promise<void>;
	deleteTransactionById: (id: string) => Promise<{ success: boolean; code?: string }>;
}

export const TransactionServiceId =
	createServiceIdentifier<ITransactionService>('TransactionService');

@injectable()
export class TransactionService implements ITransactionService {
	constructor(
		@inject(TransactionRepoId) private readonly transactionRepo: ITransactionRepo,
		@inject(AuthServiceId) private readonly authService: IAuthService
	) {}

	async getTransactions(): Promise<Transaction[]> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			return error(401, 'Unauthorized');
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

	async createTransaction(data: TransactionCreate): Promise<void> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			return error(401, 'Unauthorized');
		}

		await this.transactionRepo.createTransaction({
			userId,
			amount: data.amount,
			type: data.type,
			details: data.details ?? null,
			madeAt: data.madeAt,
		});
	}

	async deleteTransactionById(id: string): Promise<{ success: boolean; code?: string }> {
		const userId = this.authService.session?.user.id;
		if (!userId) {
			return { success: false, code: 'Unauthorized' };
		}

		await this.transactionRepo.deleteTransactionById(id);

		return { success: true };
	}
}
