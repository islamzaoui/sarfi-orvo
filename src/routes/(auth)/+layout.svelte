<script lang="ts">
	const { children } = $props();
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
	<div class="w-full max-w-sm">
		{@render children()}
	</div>
</div>
