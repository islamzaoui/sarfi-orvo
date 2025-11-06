<script module lang="ts">
	import type { Session } from '@/server/types/session.types';

	import { getSessionQuery } from '@/remote/auth.remote';

	const GUEST_PATHS = ['/signin', '/signup'];

	let session = $state<Session | null>(null);

	export function useSession() {
		return {
			get value() {
				return session;
			},
		};
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();

	const query = getSessionQuery();

	session = page.data.session;

	$effect(() => {
		const interval = setInterval(async () => {
			await query.refresh();
			session = query.current ?? null;
			if (!session && !GUEST_PATHS.includes(page.url.pathname)) {
				goto('/signin');
			}
		}, 5000);
		return () => clearInterval(interval);
	});

	beforeNavigate(async (e) => {
		if ($effect.pending()) {
			await query.refresh();
			session = query.current ?? null;
			if (!session && e.to && !GUEST_PATHS.includes(e.to.url.pathname)) {
				goto('/signin');
			}
		}
	});
</script>

{@render children()}
