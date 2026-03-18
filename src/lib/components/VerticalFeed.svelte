<script lang="ts">
	import FeedItem from './FeedItem.svelte';
	import BottomSheet from './BottomSheet.svelte';
	import AppNav from './AppNav.svelte';
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
	<AppNav />

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
		background-color: #000;
		position: relative;
	}

	.feed-scroller {
		height: 100%;
		overflow-y: scroll;
		scroll-behavior: smooth;
		scrollbar-width: none;
		padding-top: 0;
		padding-bottom: 80px;
	}

	.feed-scroller::-webkit-scrollbar {
		display: none;
	}

	.snap-item {
		width: 100%;
		display: flex;
		justify-content: center;
		padding-top: 0;
		min-height: auto;
	}

	.date {
		color: #666;
		margin-top: 1rem;
		text-align: right;
		display: block;
	}

	@media (min-width: 850px) {
		.feed-container {
			background: transparent;
		}

		.feed-container::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(244, 241, 234, 0.95);
			z-index: 0;
			backdrop-filter: blur(5px);
		}

		@media (prefers-color-scheme: dark) {
			.feed-container::before {
				background: rgba(20, 20, 20, 0.95);
			}
		}

		.feed-scroller {
			position: relative;
			z-index: 1;
			padding-bottom: 2rem;
			padding-top: 2rem;
		}

		.snap-item {
			padding-top: 5rem;
			padding-bottom: 5rem;
			min-height: auto;
		}
	}
</style>
