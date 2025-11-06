<script lang="ts">
	import type { DateValue } from '@internationalized/date';
	import type { RemoteQuery } from '@sveltejs/kit';

	import type { Transaction } from '@/schemas/transaction.schema';

	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '@/components/shadcn/card';

	import TransactionItem from './transaction-item.svelte';

	interface Props {
		query: RemoteQuery<Transaction[]>;
		selectedDate: DateValue;
		selectedDateTransactions: Transaction[];
		formatDate: (date: DateValue) => string;
	}

	const { query, selectedDate, selectedDateTransactions, formatDate }: Props = $props();
</script>

<Card class="flex flex-1 flex-col">
	<CardHeader class="pb-2">
		<CardTitle class="text-base">Transactions – {formatDate(selectedDate)}</CardTitle>
		<CardDescription class="text-xs">
			{selectedDateTransactions.length}
			{selectedDateTransactions.length === 1 ? ' transaction' : ' transactions'}
		</CardDescription>
	</CardHeader>
	<CardContent class="flex-1 overflow-y-auto">
		{#if selectedDateTransactions.length === 0}
			<p class="py-6 text-center text-sm text-muted-foreground">
				No transactions for this date
			</p>
		{:else}
			<div class="space-y-2">
				{#each selectedDateTransactions as tx (tx.id)}
					<TransactionItem {query} transaction={tx} />
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>
