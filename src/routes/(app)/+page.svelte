<script lang="ts">
	import type { DateValue } from '@internationalized/date';

	import { CalendarDate } from '@internationalized/date';

	import {
		AddIncomeDialog,
		AddSpendingDialog,
		BalanceHeader,
		CalendarCard,
		TransactionsCard,
	} from '@/components/tracker';
	import { formatAmount, formatDate, isSameDay } from '@/components/tracker/tracker-utils';
	import { getTransactionsQuery } from '@/remote/transaction.remote';

	const query = getTransactionsQuery();
	const transactions = $derived.by(() => query.current ?? []);

	const today = new Date();
	let selectedDate: DateValue = $state(
		new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
	);

	const balance = $derived.by(() =>
		transactions.reduce((s, t) => (t.type === 'income' ? s + t.amount : s - t.amount), 0)
	);

	const selectedDateTransactions = $derived.by(() =>
		transactions.filter((t) => isSameDay(t.madeAt, selectedDate))
	);
</script>

<div class="flex flex-col gap-6">
	<BalanceHeader {query} {balance} {formatAmount} />

	<CalendarCard bind:selectedDate />

	<div class="flex flex-col gap-2">
		<AddIncomeDialog bind:selectedDate />
		<AddSpendingDialog bind:selectedDate />
	</div>

	<TransactionsCard {query} {selectedDate} {selectedDateTransactions} {formatDate} />
</div>
