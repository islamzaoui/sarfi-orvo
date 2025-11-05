import type { DateValue } from '@internationalized/date';

export function calendarDateToDate(d: DateValue): Date {
	return new Date(d.year, d.month - 1, d.day);
}

export function isSameDay(d1: Date, d2: DateValue): boolean {
	return (
		d1.getFullYear() === d2.year && d1.getMonth() === d2.month - 1 && d1.getDate() === d2.day
	);
}

export function formatDate(d: DateValue): string {
	return calendarDateToDate(d).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

export function formatAmount(amount: number): string {
	return amount.toString().replace(/\.0+$/, '');
}
