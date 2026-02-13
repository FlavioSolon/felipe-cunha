<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let type: 'success' | 'error' | 'info' | 'warning' = 'info';
	export let message = '';
	export let duration = 4000;
	export let onClose: () => void = () => {};

	let visible = true;

	const icons = {
		success: '✓',
		error: '✕',
		info: 'ℹ',
		warning: '⚠'
	};

	const colors = {
		success: '#10b981',
		error: '#ef4444',
		info: '#3b82f6',
		warning: '#f59e0b'
	};

	if (duration > 0) {
		setTimeout(() => {
			visible = false;
			setTimeout(onClose, 300);
		}, duration);
	}

	function close() {
		visible = false;
		setTimeout(onClose, 300);
	}
</script>

{#if visible}
	<div
		class="toast {type}"
		style="--toast-color: {colors[type]}"
		transition:fly={{ y: -20, duration: 300, easing: quintOut }}
	>
		<div class="toast-icon">{icons[type]}</div>
		<div class="toast-message">{message}</div>
		<button class="toast-close" on:click={close} aria-label="Fechar">✕</button>
	</div>
{/if}

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		background: white;
		border-left: 4px solid var(--toast-color);
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		min-width: 300px;
		max-width: 500px;
		font-family: var(--font-secondary);
	}

	.toast-icon {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--toast-color);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		flex-shrink: 0;
	}

	.toast-message {
		flex: 1;
		color: var(--color-text-main);
		font-size: 0.95rem;
	}

	.toast-close {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: transparent;
		color: var(--color-text-light);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.toast-close:hover {
		background: rgba(0, 0, 0, 0.05);
		color: var(--color-text-main);
	}
</style>
