import cuid from 'cuid';
import { relations } from 'drizzle-orm';
import { sqliteTable } from 'drizzle-orm/sqlite-core';

import { uint8Array } from './custom-types';

export const usersTable = sqliteTable('users', (t) => ({
	id: t.text().primaryKey().$default(cuid),
	email: t.text().unique().notNull(),
	passwordHash: t.text().notNull(),
	createdAt: t
		.integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	updatedAt: t
		.integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date())
		.$onUpdate(() => new Date()),
}));

export const sessionsTable = sqliteTable('sessions', (t) => ({
	id: t.text().primaryKey(),
	userId: t
		.text()
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	secretHash: uint8Array().notNull().unique(),
	createdAt: t
		.integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
	lastVerifiedAt: t
		.integer({ mode: 'timestamp' })
		.notNull()
		.$default(() => new Date()),
}));

export const transactionsTable = sqliteTable('transactions', (t) => ({
	id: t.text().primaryKey().$default(cuid),
	userId: t
		.text()
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	amount: t.real().notNull(),
	type: t.text({ enum: ['income', 'spending'] }).notNull(),
	details: t.text(),
	madeAt: t.integer({ mode: 'timestamp' }).notNull(),
}));

export const userRelations = relations(usersTable, ({ many }) => ({
	sessions: many(sessionsTable),
	transactions: many(transactionsTable),
}));

export const sessionRelations = relations(sessionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [sessionsTable.userId],
		references: [usersTable.id],
	}),
}));

export const transactionRelations = relations(transactionsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [transactionsTable.userId],
		references: [usersTable.id],
	}),
}));
