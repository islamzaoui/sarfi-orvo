<script lang="ts">
	import type { DateValue } from '@internationalized/date';
	import type { RemoteQuery } from '@sveltejs/kit';

	import { Plus } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	import type { Transaction } from '@/schemas/transaction.schema';

	import { Button } from '@/components/shadcn/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
	} from '@/components/shadcn/dialog';
	import { Input } from '@/components/shadcn/input';
	import { Label } from '@/components/shadcn/label';
	import { createTransactionForm } from '@/remote/transaction.remote';
	import { createTransactionSchema } from '@/schemas/transaction.schema';

	interface Props {
		query: RemoteQuery<Transaction[]>;
		selectedDate: DateValue;
	}

	const { query, selectedDate }: Props = $props();

	let open = $state(false);
</script>

<Dialog bind:open>
	<DialogTrigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class="flex-1" size="lg">
				<Plus class="mr-1.5 h-4 w-4" />
				<span class="hidden mobile:inline">Add Income</span>
			</Button>
		{/snippet}
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add Income</DialogTitle>
			<DialogDescription>Record money coming in</DialogDescription>
		</DialogHeader>
		<form class="grid gap-4" {...createTransactionForm.preflight(createTransactionSchema)}>
			<div class="grid gap-2">
				<Label for="inc-amount">Amount</Label>
				<Input {...createTransactionForm.fields.amount.as('number')} placeholder="0 DA" />
				{#each createTransactionForm.fields.amount.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<div class="grid gap-2">
				<Label for="inc-details">Details (optional)</Label>
				<Input
					{...createTransactionForm.fields.details.as('text')}
					placeholder="e.g., Salary"
				/>
				{#each createTransactionForm.fields.details.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<Input {...createTransactionForm.fields.type.as('hidden', 'income')} />
			<Input {...createTransactionForm.fields.madeAt.as('hidden', selectedDate.toString())} />
			<DialogFooter>
				<Button
					variant="outline"
					{...createTransactionForm.buttonProps.enhance(
						async ({ submit, data, form }) => {
							const newTx = {
								id: crypto.randomUUID(),
								...data,
								madeAt: new Date(data.madeAt),
							};
							await submit().updates(query.withOverride((curr) => [...curr, newTx]));
							open = false;
							form.reset();
							toast.success('Transaction created successfully.');
						}
					)}
				>
					Add Income
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
