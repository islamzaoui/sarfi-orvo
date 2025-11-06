import { eq } from 'drizzle-orm';

import type { IDatabaseService } from '../services/database.service';
import type { ITransaction, ITransactionCreate } from '../types/transaction.types';

import { transactionsTable } from '../database/schema';
import { createServiceIdentifier, inject, injectable } from '../di';
import { DatabaseServiceId } from '../services/database.service';

export interface ITransactionRepo {
	getTransactionsByuserId: (userId: string) => Promise<ITransaction[]>;
	createTransaction: (data: ITransactionCreate) => Promise<ITransaction>;
	deleteTransactionById: (id: string) => Promise<void>;
}

export const TransactionRepoId = createServiceIdentifier<ITransactionRepo>('TransactionRepo');

@injectable()
export class TransactionRepo implements ITransactionRepo {
	constructor(@inject(DatabaseServiceId) private readonly dbService: IDatabaseService) {}

	async getTransactionsByuserId(userId: string): Promise<ITransaction[]> {
		const { drizzle } = this.dbService;
		return await drizzle
			.select()
			.from(transactionsTable)
			.where(eq(transactionsTable.userId, userId));
	}

	async createTransaction(data: ITransactionCreate): Promise<ITransaction> {
		const { drizzle } = this.dbService;
		const [transaction] = await drizzle.insert(transactionsTable).values(data).returning();
		return transaction;
	}

	async deleteTransactionById(id: string): Promise<void> {
		const { drizzle } = this.dbService;
		await drizzle.delete(transactionsTable).where(eq(transactionsTable.id, id));
	}
}
