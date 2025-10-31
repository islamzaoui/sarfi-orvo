<script module lang="ts">
	import type { Session } from '@/server/types/session.types';

	const GUEST_PATHS = ['/signin', '/signup'];

	let session = $state<Session | null>(null);

	export function useSession() {
		return {
			get value() {
				return session;
			},
			set(value: Session | null) {
				session = value;
			},
		};
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import { getSessionQuery } from '@/remote/auth.remote';

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
				goto('/');
			}
		}, 5000);
		return () => clearInterval(interval);
	});
</script>

{@render children()}
