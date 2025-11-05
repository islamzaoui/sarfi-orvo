<script lang="ts">
	import { Trash2 } from '@lucide/svelte';

	interface Props {
		onDelete: () => void | Promise<void>;
		ariaLabel?: string;
	}

	const { onDelete, ariaLabel = 'Hold to delete' }: Props = $props();

	let deleteTimeout: ReturnType<typeof setTimeout> | null = $state(null);

	function handleMouseDown() {
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
		}

		deleteTimeout = setTimeout(() => {
			handleDelete();
		}, 2000);
	}

	function handleMouseUp() {
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
			deleteTimeout = null;
		}
	}

	function handleMouseLeave() {
		handleMouseUp();
	}

	async function handleDelete() {
		if (deleteTimeout) {
			clearTimeout(deleteTimeout);
			deleteTimeout = null;
		}

		await onDelete();
	}
</script>

<button
	type="button"
	class="hold-delete-button relative flex items-center justify-center p-1.5 text-muted-foreground transition-transform hover:bg-muted"
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	ontouchstart={handleMouseDown}
	ontouchend={handleMouseUp}
	ontouchcancel={handleMouseUp}
	aria-label={ariaLabel}
>
	<div aria-hidden="true" class="hold-overlay">
		<Trash2 class="h-4 w-4" />
	</div>
	<Trash2 class="relative h-4 w-4" />
</button>

<style>
	.hold-delete-button {
		transition: transform 160ms ease-out;
	}

	.hold-delete-button:active {
		transform: scale(0.97);
	}

	.hold-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--destructive);
		color: var(--destructive-foreground);
		clip-path: inset(0px 100% 0px 0px);
		transition: clip-path 200ms ease-out;
	}

	.hold-delete-button:active .hold-overlay {
		transition: clip-path 2s linear;
		clip-path: inset(0px 0px 0px 0px);
	}
</style>
