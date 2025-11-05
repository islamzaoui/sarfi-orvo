<script lang="ts">
	import type { DateValue } from '@internationalized/date';

	import { Calendar } from '@/components/shadcn/calendar';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle,
	} from '@/components/shadcn/card';

	interface Props {
		selectedDate: DateValue;
	}

	let { selectedDate = $bindable() }: Props = $props();
</script>

<Card class="overflow-hidden">
	<CardHeader class="pb-3">
		<CardTitle class="text-base">Calendar</CardTitle>
		<CardDescription class="text-xs">Select a date to view details</CardDescription>
	</CardHeader>
	<CardContent class="flex flex-col items-center">
		<Calendar type="single" bind:value={selectedDate} class="rounded-md border" />
		<div class="mt-3 flex gap-4 text-xs">
			<div class="flex items-center gap-1.5">
				<div class="h-2.5 w-2.5 rounded bg-green-100 dark:bg-green-900"></div>
				<span>Income</span>
			</div>
			<div class="flex items-center gap-1.5">
				<div class="h-2.5 w-2.5 rounded bg-red-100 dark:bg-red-900"></div>
				<span>Spending</span>
			</div>
		</div>
	</CardContent>
</Card>
