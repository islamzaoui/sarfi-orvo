<script lang="ts">
	import type { DateValue } from '@internationalized/date';

	import type { Transaction } from '@/schemas/transaction.schema';

	import { Calendar } from '@/components/shadcn/calendar';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '@/components/shadcn/card';

	import CalendarDayColored from './calendar-day-colored.svelte';
	import { getDailyNetAmount, getDayColor } from './tracker-utils';

	interface Props {
		selectedDate: DateValue;
		transactions: Transaction[];
	}

	let { selectedDate = $bindable(), transactions }: Props = $props();
</script>

<Card class="overflow-hidden">
	<CardHeader class="pb-3">
		<CardTitle class="text-base">Calendar</CardTitle>
		<CardDescription class="text-xs">Select a date to view details</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center">
		<Calendar type="single" bind:value={selectedDate} class="rounded-md border">
			{#snippet day({ day })}
				{@const netAmount = day ? getDailyNetAmount(day, transactions ?? []) : 0}
				{@const dayColor = getDayColor(netAmount)}
				<CalendarDayColored color={dayColor} />
			{/snippet}
		</Calendar>
		<div class="mt-3 flex gap-4 text-xs">
			<div class="flex items-center gap-1.5">
				<div class="h-2.5 w-2.5 rounded bg-green-300 dark:bg-green-500"></div>
				<span>Income</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="h-2.5 w-2.5 rounded bg-red-300 dark:bg-red-500"></div>
				<span>Spending</span>
			</div>
		</div>
	</CardContent>
</Card>
