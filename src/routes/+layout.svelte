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

	const layoutClass = page.route.id?.startsWith('/(auth)') ? 'justify-center' : 'justify-start';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
<Toaster richColors />

<div class="flex min-h-svh flex-col items-center {layoutClass} gap-6 bg-background p-6 md:p-10">
	<div class="w-full max-w-sm">
		<AuthProvider>
			{@render children()}
		</AuthProvider>
	</div>
</div>
