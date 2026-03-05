<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	export let isOpen = false;
	export let title = '';

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		}
	}

	// Lock body scroll when open
	$: if (typeof document !== 'undefined') {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
	}

	// Touch to dismiss logic
	let touchStartY = 0;
	let currentTranslateY = 0;
	let isDragging = false;
	const swipeThreshold = 100;

	function handleTouchStart(e: TouchEvent) {
		touchStartY = e.touches[0].clientY;
		isDragging = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;

		const currentY = e.touches[0].clientY;
		const deltaY = currentY - touchStartY;

		// Only allow dragging downwards
		if (deltaY > 0) {
			currentTranslateY = deltaY;
		}
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;

		if (currentTranslateY > swipeThreshold) {
			close();
		}

		// Reset visually with animation or immediately if not closing
		currentTranslateY = 0;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="backdrop"
		on:click={close}
		transition:fade={{ duration: 300 }}
		role="button"
		tabindex="0"
		aria-label="Close modal"
		on:keydown={(e) => e.key === 'Enter' && close()}
	></div>

	<div
		class="sheet"
		style="transform: translateY({currentTranslateY}px); transition: {isDragging
			? 'none'
			: 'transform 0.3s ease-out'}"
		transition:fly={{ y: 300, duration: 400, opacity: 1 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby="sheet-title"
	>
		<div
			class="sheet-header"
			on:touchstart={handleTouchStart}
			on:touchmove={handleTouchMove}
			on:touchend={handleTouchEnd}
		>
			<div class="drag-handle"></div>
			<div class="header-content">
				<h2 id="sheet-title">{title}</h2>
				<button class="close-btn" on:click={close} aria-label="Close">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		</div>

		<div class="sheet-content">
			<slot />
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.6);
		z-index: 1000;
		backdrop-filter: blur(2px);
	}

	.sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		max-height: 85vh;
		background: var(--color-bg, #f4f1ea); /* Using Areia/Bg color */
		border-radius: 20px 20px 0 0;
		z-index: 1001;
		display: flex;
		flex-direction: column;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
	}

	.sheet-header {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
	}

	.drag-handle {
		width: 40px;
		height: 5px;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 10px;
		margin-bottom: 1rem;
	}

	.header-content {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	h2 {
		margin: 0;
		font-family: 'Merriweather', serif;
		font-size: 1.25rem;
		color: var(--color-primary, #4a5d23); /* Oliva */
	}

	.close-btn {
		background: none;
		border: none;
		cursor: pointer;
		color: #666;
		padding: 0.5rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background-color 0.2s;
	}

	.close-btn:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.close-btn svg {
		width: 24px;
		height: 24px;
	}

	.sheet-content {
		padding: 2rem 1.5rem;
		overflow-y: auto;
		overscroll-behavior: contain;

		/* Letter-style formatting */
		font-family: 'Inter', 'Georgia', serif;
		line-height: 2;
		color: #2c2416;
		font-size: 1.05rem;
		white-space: pre-wrap;
		padding-bottom: 3rem;

		/* Letter aesthetics */
		text-align: justify;
		text-indent: 2em; /* First line indent */
		letter-spacing: 0.01em;
		word-spacing: 0.05em;

		/* Paragraph spacing */
		background: linear-gradient(to bottom, rgba(253, 246, 227, 0) 0%, rgba(253, 246, 227, 1) 5%);
	}

	/* Scrollbar styling */
	.sheet-content::-webkit-scrollbar {
		width: 6px;
	}
	.sheet-content::-webkit-scrollbar-track {
		background: transparent;
	}
	.sheet-content::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.1);
		border-radius: 3px;
	}

	@media (min-width: 640px) {
		.sheet {
			max-width: 600px;
			left: 50%;
			transform: translateX(
				-50%
			) !important; /* Override fly transition transform on finish, but we handle enter via transition */
			margin-left: -300px; /* simple centering hack if left is 50% */
			left: 50%;
			bottom: 2rem;
			max-height: 80vh;
			border-radius: 20px;
		}

		/* Fix for transition conflict with margin centering */
		.sheet {
			transform: none !important;
			margin-left: 0;
			left: 0;
			right: 0;
			margin: 0 auto;
		}
	}
</style>
