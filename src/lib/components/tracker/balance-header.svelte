<script lang="ts">
	import type { RemoteQuery } from '@sveltejs/kit';

	import { LoaderCircle } from '@lucide/svelte';

	import type { Transaction } from '@/schemas/transaction.schema';

	interface Props {
		query: RemoteQuery<Transaction[]>;
		balance: number;
		formatAmount: (amount: number) => string;
	}

	const { query, balance, formatAmount }: Props = $props();
</script>

<header class="flex items-center justify-between">
	<div>
		<h1 class="text-2xl font-bold tracking-tight">Wallet Tracker</h1>
		<p class="text-sm text-muted-foreground">Track income & spending</p>
	</div>
	<div class="text-3xl font-bold text-primary">
		{#if query.loading || !query.ready}
			<LoaderCircle class="h-8 w-8 animate-spin text-muted-foreground" />
		{:else}
			{formatAmount(balance)} DA
		{/if}
	</div>
</header>
