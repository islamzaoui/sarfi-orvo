<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import { getFlash } from 'sveltekit-flash-message';

	import favicon from '@/assets/favicon.svg';
	import AuthProvider from '@/components/providers/auth-provider.svelte';
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
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster richColors />

<AuthProvider>
	{@render children()}
</AuthProvider>
