<script lang="ts">
	import { Button } from '@/components/shadcn/button';
	import * as Card from '@/components/shadcn/card';
	import { Input } from '@/components/shadcn/input';
	import { Label } from '@/components/shadcn/label';
	import { registerForm } from '@/remote/auth.remote';
	import { registerSchema } from '@/schemas/auth.schema';
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">Sign Up</Card.Title>
		<Card.Description>Enter your email below to create an account.</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<form
			{...registerForm.preflight(registerSchema)}
			oninput={() => registerForm.validate()}
			class="grid gap-4"
		>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					{...registerForm.fields.email.as('email')}
					autocomplete="email"
					placeholder="you@example.com"
				/>
				{#each registerForm.fields.email.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input
					{...registerForm.fields.password.as('password')}
					autocomplete="new-password"
					placeholder="●●●●●●●●●●●●●●●"
				/>
				{#each registerForm.fields.password.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<div class="grid gap-2">
				<Label for="confirmPassword">Confirm Password</Label>
				<Input
					{...registerForm.fields.confirmPassword.as('password')}
					autocomplete="new-password"
					placeholder="●●●●●●●●●●●●●●●"
				/>
				{#each registerForm.fields.confirmPassword.issues() as issue}
					<small class="text-red-500">{issue.message}</small>
				{/each}
			</div>
			<Button type="submit" class="w-full">Create an account</Button>
		</form>
	</Card.Content>
	<Card.Footer class="flex-col gap-2">
		<p class="text-center text-sm text-muted-foreground">
			<span>Already have an account?</span>
			<a href="/signin" class="underline underline-offset-4 hover:text-primary"> Sign In </a>
		</p>
		<p class="text-center text-sm text-muted-foreground">
			<span>By clicking continue, you agree to our</span>
			<a href="/terms" class="underline underline-offset-4 hover:text-primary">
				Terms of Service
			</a>
			<span>and</span>
			<a href="/privacy" class="underline underline-offset-4 hover:text-primary">
				Privacy Policy
			</a>
			<span>.</span>
		</p>
	</Card.Footer>
</Card.Root>
