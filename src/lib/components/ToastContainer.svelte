<script lang="ts">
	import Toast from './Toast.svelte';
	import { toasts } from '$lib/stores/toastStore';
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<Toast
			type={toast.type}
			message={toast.message}
			duration={toast.duration}
			onClose={() => toasts.remove(toast.id)}
		/>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 2rem;
		right: 2rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		pointer-events: none;
	}

	.toast-container :global(.toast) {
		pointer-events: auto;
	}

	@media (max-width: 640px) {
		.toast-container {
			top: 1rem;
			right: 1rem;
			left: 1rem;
		}

		.toast-container :global(.toast) {
			min-width: auto;
			width: 100%;
		}
	}
</style>
