<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import { getFlash } from 'sveltekit-flash-message';

	import favicon from '@/assets/favicon.svg';
	import { Toaster } from '@/components/shadcn/sonner';

	const { children } = $props();

	const flash = getFlash(page);
	$effect(() => {
		if (!$flash) return;
		switch ($flash.type) {
			case 'success':
				toast.success($flash.message, {
					description: $flash.description,
				});
				break;
			case 'error':
				toast.error($flash.message, {
					description: $flash.description,
				});
				break;
		}
		$flash = undefined;
	});

	const layoutClass = $derived.by(() =>
		page.route.id?.startsWith('/(auth)') ? 'justify-center' : 'justify-start'
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Sarfi</title>
</svelte:head>

<ModeWatcher />
<Toaster richColors />

<div class="flex min-h-screen flex-col items-center {layoutClass} gap-6 bg-background p-6 md:p-10">
	<div class="w-full max-w-sm">
		{@render children()}
	</div>
</div>
