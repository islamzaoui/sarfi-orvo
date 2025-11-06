<script lang="ts">
	import { LogOut } from '@lucide/svelte';

	import favicon from '@/assets/favicon.svg';
	import { Button } from '@/components/shadcn/button';
	import { logoutForm } from '@/remote/auth.remote';

	interface Props {
		balance: number;
		formatAmount: (amount: number) => string;
	}

	const { balance, formatAmount }: Props = $props();
</script>

<header class="flex items-center justify-between">
	<div>
		<img src={favicon} alt="Wallet Tracker" class="h-12 w-auto" />
	</div>
	<div class="flex items-center gap-3">
		<div class="text-3xl font-bold text-primary-foreground">
			{formatAmount(balance)} DA
		</div>
		<form {...logoutForm}>
			<Button {...logoutForm.buttonProps} variant="outline" size="icon" title="Logout">
				<LogOut class="h-4 w-4" />
			</Button>
		</form>
	</div>
</header>
