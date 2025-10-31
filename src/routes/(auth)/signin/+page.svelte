<script lang="ts">
	import { Button } from '@/components/shadcn/button';
	import * as Card from '@/components/shadcn/card';
	import { Input } from '@/components/shadcn/input';
	import { Label } from '@/components/shadcn/label';
	import { getSessionQuery, loginForm } from '@/remote/auth.remote';
	import { loginSchema } from '@/schemas/auth.schema';
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Sign In</Card.Title>
		<Card.Description>Enter your email and password to sign in.</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<form
			{...loginForm.preflight(loginSchema).enhance(async ({ submit }) => {
				await submit().updates(getSessionQuery());
			})}
			oninput={() => loginForm.validate()}
			class="grid gap-4"
		>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input {...loginForm.fields.email.as('email')} placeholder="you@example.com" />
				{#each loginForm.fields.email.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input
					{...loginForm.fields.password.as('password')}
					placeholder="●●●●●●●●●●●●●●●"
				/>
				{#each loginForm.fields.password.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<Button class="w-full" {...loginForm.buttonProps}>Sign in</Button>
		</form>
	</Card.Content>
	<Card.Footer class="flex-col gap-2">
		<p class="text-center text-sm text-muted-foreground">
			<span>Don't have an account?</span>
			<a href="/signup" class="underline underline-offset-4 hover:text-primary"> Sign up </a>
		</p>
	</Card.Footer>
</Card.Root>
