import { command, form, query } from '$app/server';

import { createTransactionSchema, deleteTransactionSchema } from '@/schemas/transaction.schema';
import { useService } from '@/server/container';

export const getTransactionsQuery = query(
	async () => await useService('TransactionService').getTransactions()
);

export const createTransactionForm = form(createTransactionSchema, async (data) => {
	await useService('TransactionService').createTransaction(data);
});

export const deleteTransactionCommand = command(
	deleteTransactionSchema,
	async (data) => await useService('TransactionService').deleteTransactionById(data.id)
);
