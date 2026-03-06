<script lang="ts">
	import FeedItem from './FeedItem.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import type { FeedPost } from '$lib/data/feed';
	import { onMount } from 'svelte';

	import { subscribeUser } from '$lib/push';

	export let items: FeedPost[] = [];

	let selectedItem: FeedPost | null = null;
	let isSheetOpen = false;

	function handleReadMore(item: FeedPost) {
		selectedItem = item;
		isSheetOpen = true;
	}

	function closeSheet() {
		isSheetOpen = false;
	}

	function surpriseMe() {
		// Simple random selection for now
		const randomIndex = Math.floor(Math.random() * items.length);
		const element = document.getElementById(`post-${items[randomIndex].id}`);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	let showNotificationBtn = false;

	onMount(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			showNotificationBtn = true;
		}
	});

	async function handleSubscribe() {
		const granted = await Notification.requestPermission();
		if (granted === 'granted') {
			const success = await subscribeUser();
			if (success) {
				alert('Notificações ativadas! Você receberá novidades em breve.');
				showNotificationBtn = false;
			} else {
				alert('Erro ao ativar notificações.');
			}
		} else {
			alert('Permissão de notificação negada.');
		}
	}
</script>

<div class="feed-container">
	<!-- Dynamic Navigation Bar (Bottom on Mobile, Left Side on Desktop) -->
	<nav class="feed-nav" aria-label="Navegação do Feed">
		<a href="/" class="nav-action-btn" aria-label="Voltar para Home">
			<!-- Home Icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="nav-icon"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
				/>
			</svg>
		</a>

		{#if showNotificationBtn}
			<button class="nav-action-btn" on:click={handleSubscribe} aria-label="Ativar Notificações">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="nav-icon"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
					/>
				</svg>
			</button>
		{/if}

		<button class="nav-action-btn" on:click={surpriseMe} aria-label="Post Aleatório">
			<!-- Shuffle Icon -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="nav-icon"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
				/>
			</svg>
		</button>
	</nav>

	<main class="feed-scroller">
		{#each items as item, index (item.id)}
			<div id="post-{item.id}" class="snap-item">
				<FeedItem {item} isFirstPost={index === 0} onReadMore={handleReadMore} />
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
		background-color: #000; /* Pure black */
		position: relative;
	}

	/* Navigation Base - Mobile Bottom Menu Style */
	.feed-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 60px;
		background: #000;
		border-top: 1px solid #222;
		display: flex;
		justify-content: space-around;
		align-items: center;
		z-index: 1002;
		padding-bottom: env(safe-area-inset-bottom); /* iOS support */
	}

	.nav-action-btn {
		background: none;
		border: none;
		color: #e0e0e0;
		width: 50px;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.nav-action-btn:hover {
		color: white;
		transform: scale(1.1);
	}

	.nav-action-btn:active {
		transform: scale(0.95);
	}

	.nav-icon {
		width: 28px;
		height: 28px;
	}

	.feed-scroller {
		height: 100%;
		overflow-y: scroll;
		scroll-behavior: smooth;
		scrollbar-width: none; /* Hide scrollbar Firefox */
		/* Continuous scrolling without top gap */
		padding-top: 0;
		padding-bottom: 80px; /* Space for the bottom navigation on mobile */
	}

	.feed-scroller::-webkit-scrollbar {
		display: none; /* Hide scrollbar Chrome/Safari */
	}

	.snap-item {
		width: 100%;
		display: flex;
		justify-content: center;
		padding-top: 0; /* Remove gap */
		min-height: auto; /* Let it wrap content on mobile perfectly */
	}

	.date {
		color: #666;
		margin-top: 1rem;
		text-align: right;
		display: block;
	}

	/* Desktop Modal Effect & Left Side Nav */
	@media (min-width: 850px) {
		.feed-container {
			background: transparent; /* Allow home to show through on very large monitor */
		}

		/* Adaptive Background based on System Theme */
		.feed-container::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(244, 241, 234, 0.95); /* Light theme default (Areia) */
			z-index: 0;
			backdrop-filter: blur(5px);
		}

		@media (prefers-color-scheme: dark) {
			.feed-container::before {
				background: rgba(20, 20, 20, 0.95); /* Dark theme */
			}
		}

		.feed-scroller {
			position: relative;
			z-index: 1;
			padding-bottom: 2rem;
			padding-top: 2rem;
		}

		.snap-item {
			padding-top: 5rem; /* Good breathing room on desktop */
			padding-bottom: 5rem;
			min-height: auto;
		}

		/* Desktop Side Navigation */
		.feed-nav {
			position: fixed;
			top: 50%;
			left: 2rem;
			bottom: auto;
			transform: translateY(-50%);
			width: auto;
			height: auto;
			flex-direction: column;
			gap: 1.5rem;
			background: transparent;
			border: none;
		}

		.nav-action-btn {
			background: rgba(0, 0, 0, 0.1);
			color: #333;
			border-radius: 50%;
			width: 56px;
			height: 56px;
			border: 1px solid rgba(0, 0, 0, 0.1);
			backdrop-filter: blur(8px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		}

		@media (prefers-color-scheme: dark) {
			.nav-action-btn {
				background: rgba(255, 255, 255, 0.1);
				color: #e0e0e0;
				border-color: rgba(255, 255, 255, 0.1);
			}
			.nav-action-btn:hover {
				background: rgba(255, 255, 255, 0.2);
				color: white;
			}
		}

		.nav-action-btn:hover {
			background: rgba(0, 0, 0, 0.15);
		}
	}
</style>
