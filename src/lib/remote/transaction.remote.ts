import { error, isRedirect } from '@sveltejs/kit';
import { command, form, getRequestEvent, query } from '$app/server';
import { redirect } from 'sveltekit-flash-message/server';

import type { ServiceErrorCode } from '@/server/error';

import { createTransactionSchema, deleteTransactionSchema } from '@/schemas/transaction.schema';
import { useService } from '@/server/di';
import { ServiceError } from '@/server/error';
import { TransactionServiceId } from '@/server/services/transaction.service';

export const getTransactionsQuery = query(async () => {
	try {
		return useService(TransactionServiceId).getTransactions();
	} catch (err) {
		if (err instanceof ServiceError) {
			return error(err.statusCode, err.message);
		}
		return error(500, 'Something went wrong.');
	}
});

export const createTransactionForm = form(createTransactionSchema, async (data) => {
	const event = getRequestEvent();
	try {
		await useService(TransactionServiceId).createTransaction({
			amount: data.amount,
			type: data.type,
			details: data.details,
			madeAt: data.madeAt,
		});
		await getTransactionsQuery().refresh();
	} catch (err) {
		if (isRedirect(err)) return err;
		if (err instanceof ServiceError) {
			switch (err.code) {
				case 'UNAUTHORIZED':
					return redirect('/signin', { type: 'error', message: 'Unauthorized.' }, event);
				default:
					return redirect(
						{
							type: 'error',
							message: 'Unable to create transaction due to internal server error.',
						},
						event
					);
			}
		}
		return error(500, 'Something went wrong.');
	}
	return redirect({ type: 'success', message: 'Transaction created successfully.' }, event);
});

interface DeleteTransactionSuccess {
	success: true;
	err?: never;
}

interface DeleteTransactionFailure {
	success: false;
	err: ServiceErrorCode;
}

export const deleteTransactionCommand = command(
	deleteTransactionSchema,
	async ({ id }): Promise<DeleteTransactionSuccess | DeleteTransactionFailure> => {
		try {
			await useService(TransactionServiceId).deleteTransactionById(id);
			await getTransactionsQuery().refresh();
			return { success: true };
		} catch (err) {
			if (err instanceof ServiceError) {
				return { success: false, err: err.code };
			}
			return { success: false, err: 'INTERNAL_SERVER_ERROR' };
		}
	}
);
