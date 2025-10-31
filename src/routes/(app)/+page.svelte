<script>
	import { useSession } from '@/components/providers/auth-provider.svelte';
	import { Button } from '@/components/shadcn/button';
	import { logoutForm } from '@/remote/auth.remote';

	const session = useSession();
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<pre>{JSON.stringify(session.value, null, 2)}</pre>
<form
	{...logoutForm.enhance(() => {
		session.set(null);
	})}
>	
	<Button {...logoutForm.buttonProps}>Logout</Button>
</form>
