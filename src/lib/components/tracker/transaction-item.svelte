<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	import type { Transaction } from '@/schemas/transaction.schema';

	import { deleteTransactionCommand } from '@/remote/transaction.remote';

	import { HoldDeleteButton } from './';
	import { formatAmount } from './tracker-utils';

	interface Props {
		transaction: Transaction;
	}

	const { transaction }: Props = $props();

	async function handleDelete() {
		const result = await deleteTransactionCommand({ id: transaction.id });
		if (!result.success) {
			switch (result.code) {
				case 'Unauthorized':
					toast.error('You are not authorized to delete this transaction.');
					goto('/signin');
					break;

				default:
					toast.error('Failed to delete transaction.');
			}
			return;
		}
		toast.success('Transaction deleted successfully.');
	}
</script>

<div class="flex items-center justify-between border p-2.5 transition-colors hover:bg-muted/50">
	<div class="flex-1">
		<p class="text-sm font-medium">{transaction.details || 'No details'}</p>
		<p class="text-xs text-muted-foreground capitalize">{transaction.type}</p>
	</div>
	<div class="flex items-center gap-3">
		<div
			class={`text-sm font-bold ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
		>
			{transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)} DA
		</div>
		<HoldDeleteButton onDelete={handleDelete} ariaLabel="Hold to delete transaction" />
	</div>
</div>
