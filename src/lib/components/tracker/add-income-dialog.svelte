<script lang="ts">
	import type { DateValue } from '@internationalized/date';

	import { Plus } from '@lucide/svelte';
	import { beforeNavigate } from '$app/navigation';

	import { Button } from '@/components/shadcn/button';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger,
	} from '@/components/shadcn/dialog';
	import { Input } from '@/components/shadcn/input';
	import { Label } from '@/components/shadcn/label';
	import { createTransactionForm } from '@/remote/transaction.remote';
	import { createTransactionSchema } from '@/schemas/transaction.schema';

	interface Props {
		selectedDate: DateValue;
	}

	let { selectedDate = $bindable() }: Props = $props();

	let open = $state(false);

	beforeNavigate(() => {
		open = false;
	});
</script>

<Dialog bind:open>
	<DialogTrigger>
		{#snippet child({ props })}
			<Button {...props} class="w-full" size="lg">
				<Plus class="mr-1.5 h-4 w-4" />Add Income
			</Button>
		{/snippet}
	</DialogTrigger>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Add Income</DialogTitle>
			<DialogDescription>Record money coming in</DialogDescription>
		</DialogHeader>
		<form {...createTransactionForm.preflight(createTransactionSchema)} class="grid gap-3 py-2">
			<div>
				<Label for="inc-amount">Amount</Label>
				<Input {...createTransactionForm.fields.amount.as('number')} placeholder="0 DA" />
			</div>
			<div>
				<Label for="inc-details">Details (optional)</Label>
				<Input
					{...createTransactionForm.fields.details.as('text')}
					placeholder="e.g., Salary"
				/>
			</div>
			<Input {...createTransactionForm.fields.type.as('hidden', 'income')} />
			<Input {...createTransactionForm.fields.madeAt.as('hidden', selectedDate.toString())} />
			<Button {...createTransactionForm.buttonProps} class="w-full">Add Income</Button>
		</form>
	</DialogContent>
</Dialog>
