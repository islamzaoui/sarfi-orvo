import { z } from 'zod/v4-mini';

const date = z.pipe(
	z.string(),
	z.transform((z) => new Date(z))
);

export const transactionSchema = z.object({
	id: z.string(),
	amount: z.number().check(z.positive()),
	type: z.enum(['spending', 'income']),
	details: z.optional(z.string()),
	madeAt: date,
});

export type Transaction = z.infer<typeof transactionSchema>;

export const createTransactionSchema = z.object({
	amount: z.number().check(z.positive()),
	type: z.enum(['spending', 'income']),
	details: z.optional(z.string()),
	madeAt: date,
});

export type TransactionCreate = z.infer<typeof createTransactionSchema>;

export const deleteTransactionSchema = z.object({ id: z.string() });
