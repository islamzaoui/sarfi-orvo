import type { InferSelectModel } from 'drizzle-orm';

import type { transactionsTable } from '../database/schema';

export type ITransaction = InferSelectModel<typeof transactionsTable>;

export type ITransactionCreate = Omit<ITransaction, 'id'>;

export type ITransactionUpdate = Partial<ITransactionCreate>;
