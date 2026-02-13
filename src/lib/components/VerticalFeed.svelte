<script lang="ts">
	import FeedItem from './FeedItem.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import type { FeedPost } from '$lib/data/feed';
	import { onMount } from 'svelte';

	export let items: FeedPost[] = [];
	export let title = 'Feed';

	let selectedItem: FeedPost | null = null;
	let isSheetOpen = false;

	function handleReadMore(item: FeedPost) {
		selectedItem = item;
		isSheetOpen = true;
	}

	function closeSheet() {
		isSheetOpen = false;
		// Small delay to clear selected item after animation could be nice, but not strictly necessary
	}

	function surpriseMe() {
		// Simple random selection for now
		const randomIndex = Math.floor(Math.random() * items.length);
		const element = document.getElementById(`post-${items[randomIndex].id}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="feed-container">
	<!-- Fixed Header/Nav Overlay -->
	<header class="feed-header">
		<a href="/" class="back-link" aria-label="Voltar para Home">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
				/>
			</svg>
		</a>
		<h1 class="feed-title">{title}</h1>
		<button class="surprise-btn" on:click={surpriseMe} aria-label="Surpreenda-me">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
				/>
			</svg>
		</button>
	</header>

	<main class="feed-scroller">
		{#each items as item (item.id)}
			<div id="post-{item.id}" class="snap-item">
				<FeedItem {item} onReadMore={handleReadMore} />
			</div>
		{/each}
	</main>

	<BottomSheet isOpen={isSheetOpen} title={selectedItem?.title || ''} on:close={closeSheet}>
		{#if selectedItem}
			<p>{selectedItem.content}</p>
			<br />
			<p class="date"><small>{new Date(selectedItem.date).toLocaleDateString('pt-BR')}</small></p>
		{/if}
	</BottomSheet>
</div>

<style>
	.feed-container {
		width: 100%;
		height: 100dvh;
		background-color: #000;
		position: relative;
	}

	.feed-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		padding: 1rem 1.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 50;
		background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%);
		pointer-events: none; /* Let clicks pass through to scroller where not strictly on buttons */
	}

	.feed-header > * {
		pointer-events: auto; /* Re-enable clicks for buttons */
	}

	.feed-title {
		font-family: 'Merriweather', serif;
		color: white;
		font-size: 1.2rem;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		font-weight: 700;
		letter-spacing: 0.5px;
	}

	.back-link,
	.surprise-btn {
		color: white;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		width: 44px;
		height: 44px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.back-link:hover,
	.surprise-btn:hover {
		background: rgba(255, 255, 255, 0.25);
		transform: scale(1.05);
		border-color: rgba(255, 255, 255, 0.4);
	}

	.back-link:active,
	.surprise-btn:active {
		transform: scale(0.95);
	}

	.feed-scroller {
		height: 100%;
		overflow-y: scroll;
		scroll-snap-type: y mandatory;
		scroll-behavior: smooth;
		scrollbar-width: none; /* Hide scrollbar Firefox */
	}

	.feed-scroller::-webkit-scrollbar {
		display: none; /* Hide scrollbar Chrome/Safari */
	}

	.snap-item {
		scroll-snap-align: start;
		height: 100dvh;
		width: 100%;
	}

	.date {
		color: #666;
		margin-top: 1rem;
		text-align: right;
		display: block;
	}
</style>
