<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	import type { WithElementRef } from '@/utils/cn.js';

	import { cn } from '@/utils/cn.js';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	class={cn('relative flex flex-col gap-4 md:flex-row', className)}
	{...restProps}
>
	{@render children?.()}
</div>
