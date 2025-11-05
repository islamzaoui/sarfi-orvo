import type { DateValue } from '@internationalized/date';

import type { Transaction } from '@/schemas/transaction.schema';

export function calendarDateToDate(d: DateValue | undefined): Date {
	if (!d) return new Date();
	return new Date(d.year, d.month - 1, d.day);
}

export function isSameDay(d1: Date | undefined, d2: DateValue | undefined): boolean {
	if (!d1 || !d2) return false;
	return (
		d1.getFullYear() === d2.year && d1.getMonth() === d2.month - 1 && d1.getDate() === d2.day
	);
}

export function formatDate(d: DateValue | undefined): string {
	if (!d) return '';
	return calendarDateToDate(d).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export function formatAmount(amount: number): string {
	return amount.toString().replace(/\.0+$/, '');
}

/**
 * Calculate the net amount for a specific date (income - spending)
 */
export function getDailyNetAmount(
	date: DateValue | undefined,
	transactions: Transaction[]
): number {
	if (!date || !transactions) return 0;
	return transactions.reduce((net, transaction) => {
		if (transaction.madeAt && isSameDay(transaction.madeAt, date)) {
			return transaction.type === 'income'
				? net + transaction.amount
				: net - transaction.amount;
		}
		return net;
	}, 0);
}

export type DayColor =
	| 'none'
	| 'green-light'
	| 'green-medium'
	| 'green-high'
	| 'red-light'
	| 'red-medium'
	| 'red-high';

/**
 * Get the color enum for a day based on its net amount (GitHub commit style)
 */
export function getDayColor(netAmount: number): DayColor {
	if (netAmount === 0) {
		return 'none';
	}

	if (netAmount > 0) {
		// Green shades for positive (income)
		if (netAmount >= 1000) {
			return 'green-high';
		} else if (netAmount >= 100) {
			return 'green-medium';
		} else if (netAmount >= 10) {
			return 'green-light';
		} else {
			return 'green-light';
		}
	} else {
		// Red shades for negative (spending)
		const absAmount = Math.abs(netAmount);
		if (absAmount >= 1000) {
			return 'red-high';
		} else if (absAmount >= 100) {
			return 'red-medium';
		} else if (absAmount >= 10) {
			return 'red-light';
		} else {
			return 'red-light';
		}
	}
}

/**
 * Get the color class for a day based on its net amount (GitHub commit style)
 * @deprecated Use getDayColor instead
 */
export function getDayColorClass(netAmount: number): string {
	if (netAmount === 0) {
		return ''; // No color for zero
	}

	if (netAmount > 0) {
		// Green shades for positive (income)
		if (netAmount >= 1000) {
			return 'bg-green-600 dark:bg-green-700'; // High green
		} else if (netAmount >= 100) {
			return 'bg-green-400 dark:bg-green-600'; // Medium green
		} else if (netAmount >= 10) {
			return 'bg-green-300 dark:bg-green-500'; // Light green
		} else {
			return 'bg-green-200 dark:bg-green-400'; // Very light green
		}
	} else {
		// Red shades for negative (spending)
		const absAmount = Math.abs(netAmount);
		if (absAmount >= 1000) {
			return 'bg-red-600 dark:bg-red-700'; // High red
		} else if (absAmount >= 100) {
			return 'bg-red-400 dark:bg-red-600'; // Medium red
		} else if (absAmount >= 10) {
			return 'bg-red-300 dark:bg-red-500'; // Light red
		} else {
			return 'bg-red-200 dark:bg-red-400'; // Very light red
		}
	}
}
