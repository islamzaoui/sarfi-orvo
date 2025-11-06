<script lang="ts">
	import type { DateValue } from '@internationalized/date';
	import type { RemoteQuery } from '@sveltejs/kit';

	import { Plus } from '@lucide/svelte';
	import { beforeNavigate } from '$app/navigation';

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

	beforeNavigate(() => {
		open = false;
	});
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
		<form
			{...createTransactionForm
				.preflight(createTransactionSchema)
				.enhance(async ({ submit, data }) => {
					const newTx = {
						id: crypto.randomUUID(),
						...data,
						madeAt: new Date(data.madeAt),
					};
					await submit().updates(query.withOverride((curr) => [...curr, newTx]));
				})}
			oninput={() => createTransactionForm.validate()}
			class="grid gap-4"
		>
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
				<Button {...createTransactionForm.buttonProps} variant="outline">Add Income</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
