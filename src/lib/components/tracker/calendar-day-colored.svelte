<script lang="ts">
	import { Calendar as CalendarPrimitive } from 'bits-ui';

	import { buttonVariants } from '@/components/shadcn/button/index.js';
	import { cn } from '@/utils/cn.js';

	import type { DayColor } from './tracker-utils';

	let {
		ref = $bindable(null),
		class: className,
		color = 'none',
		...restProps
	}: CalendarPrimitive.DayProps & {
		color?: DayColor;
	} = $props();

	const colorClasses: Record<DayColor, string> = {
		none: '',
		'green-light': 'bg-green-300 dark:bg-green-500',
		'green-medium': 'bg-green-400 dark:bg-green-600',
		'green-high': 'bg-green-600 dark:bg-green-700',
		'red-light': 'bg-red-300 dark:bg-red-500',
		'red-medium': 'bg-red-400 dark:bg-red-600',
		'red-high': 'bg-red-600 dark:bg-red-700',
	};
</script>

<div
	class="relative size-(--cell-size) [&:has(button:hover:not([data-selected]))_>_div]:opacity-100 [&:has(button:hover:not([data-selected]))_>_div]:brightness-110 [&:has(button[data-selected])_>_div]:opacity-30 [&:has(button[data-selected])_>_div]:ring-2 [&:has(button[data-selected])_>_div]:ring-current [&:has(button[data-selected])_>_div]:ring-inset"
>
	<CalendarPrimitive.Day
		bind:ref
		class={cn(
			buttonVariants({ variant: 'ghost' }),
			'relative z-10 flex size-full flex-col items-center justify-center gap-1 p-0 leading-none font-normal whitespace-nowrap select-none',
			'[&[data-today]:not([data-selected])]:border-2 [&[data-today]:not([data-selected])]:border-muted-foreground [&[data-today]:not([data-selected])]:text-foreground [&[data-today][data-disabled]]:text-muted-foreground',
			'data-selected:border-2 data-selected:border-primary data-selected:bg-transparent data-selected:text-primary-foreground dark:data-selected:hover:bg-accent/50',
			// Outside months
			'[&[data-outside-month]:not([data-selected])]:text-muted-foreground [&[data-outside-month]:not([data-selected])]:hover:text-accent-foreground',
			// Disabled
			'data-disabled:pointer-events-none data-disabled:text-muted-foreground data-disabled:opacity-50',
			// Unavailable
			'data-unavailable:text-muted-foreground data-unavailable:line-through',
			// hover
			'dark:hover:text-accent-foreground',
			// focus
			'focus:relative focus:border-ring focus:ring-ring/50',
			// inner spans
			'[&>span]:text-xs [&>span]:opacity-70',
			className
		)}
		{...restProps}
	/>
	{#if color !== 'none'}
		<div class="absolute inset-0 {colorClasses[color]} pointer-events-none opacity-50"></div>
	{/if}
</div>
