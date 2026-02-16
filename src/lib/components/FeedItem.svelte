<script lang="ts">
	import type { FeedPost } from '$lib/data/feed';
	import { fade } from 'svelte/transition';
	import cactoIcon from '$lib/assets/icones/cacto.ico';
	import cactoChamasIcon from '$lib/assets/icones/cacto_chamas.ico';

	export let item: FeedPost;
	export let onReadMore: (item: FeedPost) => void;

	let currentImageIndex = 0;
	let liked = false;
	let shareText = 'Compartilhar';
	let likesCount = item.likes;
	let preloadedImages = new Set<string>();

	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	// Mobile truncation limit - prioritize image
	const MOBILE_CHAR_LIMIT = 150;

	// Format content into paragraphs
	function formatContent(text: string, limit?: number) {
		const truncated = limit && text.length > limit ? text.substring(0, limit) + '...' : text;
		return truncated.split('\n').filter((p) => p.trim());
	}

	// Preload image function
	function preloadImage(url: string) {
		if (!url || preloadedImages.has(url)) return;
		const img = new Image();
		img.src = url;
		preloadedImages.add(url);
	}

	// Preload current and next image
	$: {
		if (item.images[currentImageIndex]) {
			preloadImage(item.images[currentImageIndex]);
		}
		if (item.images[currentImageIndex + 1]) {
			preloadImage(item.images[currentImageIndex + 1]);
		}
	}

	function nextImage() {
		if (currentImageIndex < item.images.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	onMount(() => {
		const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
		if (likedPosts.includes(item.id)) {
			liked = true;
		}
	});

	async function toggleLike() {
		liked = !liked;

		if (liked) {
			likesCount++;
		} else {
			likesCount = Math.max(0, likesCount - 1);
		}

		const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
		if (liked) {
			if (!likedPosts.includes(item.id)) likedPosts.push(item.id);
		} else {
			const index = likedPosts.indexOf(item.id);
			if (index > -1) likedPosts.splice(index, 1);
		}
		localStorage.setItem('liked_posts', JSON.stringify(likedPosts));

		try {
			const { data } = await supabase.from('posts').select('likes').eq('id', item.id).single();
			if (data) {
				const currentDbLikes = data.likes;
				const updatedLikes = liked ? currentDbLikes + 1 : Math.max(0, currentDbLikes - 1);
				await supabase.from('posts').update({ likes: updatedLikes }).eq('id', item.id);
			}
		} catch (err) {
			console.error('Error updating likes:', err);
		}
	}

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: item.title,
					text: item.content.substring(0, 100) + '...',
					url: window.location.href
				});
			} catch (err) {
				console.log('Error sharing:', err);
			}
		} else {
			navigator.clipboard.writeText(window.location.href);
			shareText = 'Link Copiado!';
			setTimeout(() => (shareText = 'Compartilhar'), 2000);
		}
	}
</script>

<div class="feed-item">
	<div class="immersive-background"></div>

	<div class="content-wrapper">
		<!-- Image Section -->
		<div class="image-section">
			<div class="instagram-frame">
				<div class="image-container">
					{#each item.images as image, index}
						<div class="image-slide" class:active={index === currentImageIndex}>
							<img
								src={image}
								alt="{item.title} - Imagem {index + 1}"
								loading={index === 0 ? 'eager' : 'lazy'}
								decoding="async"
							/>
						</div>
					{/each}

					<!-- Carousel Indicators -->
					{#if item.images.length > 1}
						<div class="carousel-indicators">
							{#each item.images as _, index}
								<button
									class="indicator"
									class:active={index === currentImageIndex}
									on:click|stopPropagation={() => (currentImageIndex = index)}
									aria-label="Ir para imagem {index + 1}"
								></button>
							{/each}
						</div>

						<!-- Navigation -->
						<button
							class="nav-btn prev"
							on:click|stopPropagation={prevImage}
							class:hidden={currentImageIndex === 0}
							aria-label="Anterior"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15.75 19.5L8.25 12l7.5-7.5"
								/>
							</svg>
						</button>
						<button
							class="nav-btn next"
							on:click|stopPropagation={nextImage}
							class:hidden={currentImageIndex === item.images.length - 1}
							aria-label="Próximo"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8.25 4.5l7.5 7.5-7.5 7.5"
								/>
							</svg>
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Letter Description Section -->
		<div class="description-section">
			<div class="field-letter-card">
				<div class="stamp-mark"></div>
				<div class="card-header">
					<h2 class="letter-title">{item.title}</h2>
					<div class="separator-line"></div>
					<p class="letter-date">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
				</div>

				<!-- Content area -->
				<div class="card-body-scroll">
					<!-- Mobile: Truncated -->
					<div class="content-mobile">
						{#each formatContent(item.content, MOBILE_CHAR_LIMIT) as paragraph}
							<p class="letter-paragraph">{paragraph}</p>
						{/each}
					</div>

					<!-- Desktop: Full content -->
					<div class="content-desktop">
						{#each formatContent(item.content) as paragraph}
							<p class="letter-paragraph">{paragraph}</p>
						{/each}
					</div>
				</div>

				<!-- Footer with buttons -->
				<div class="card-footer">
					<!-- "Ler mais" button - mobile only -->
					<button class="read-more-link read-more-mobile" on:click={() => onReadMore(item)}>
						Ler na íntegra
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
							/>
						</svg>
					</button>

					<div class="interaction-group">
						<button
							class="action-icon like-trigger"
							class:liked
							on:click={toggleLike}
							aria-label="Curtir"
						>
							{#if liked}
								<img src={cactoChamasIcon} alt="Fogo" class="social-icon flame-anim" />
							{:else}
								<img src={cactoIcon} alt="Cacto" class="social-icon" />
							{/if}
							<span class="like-counter">{likesCount}</span>
						</button>

						<button class="action-icon" on:click={share} aria-label="Compartilhar">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.77-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Clean Black Background */
	.feed-item {
		height: 100dvh;
		width: 100%;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #000; /* Pure black */
	}

	.immersive-background {
		display: none; /* Removed textured background */
	}

	.content-wrapper {
		width: 100%;
		max-width: 100%; /* Full width on mobile */
		height: 100%;
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0;
		gap: 0;
	}

	/* Image Section (Instagram-Style) */
	.image-section {
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.instagram-frame {
		width: 100%;
		max-width: 100%; /* Full width */
		background: #000;
		border-radius: 0;
		overflow: hidden;
		box-shadow: none;
		border: none;
	}

	.image-container {
		width: 100%;
		position: relative;
		aspect-ratio: 4 / 5; /* Instagram portrait standard */
		background: #000;
	}

	.image-slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
	}

	.image-slide.active {
		opacity: 1;
		pointer-events: auto;
	}

	.image-slide img {
		width: 100%;
		height: 100%;
		object-fit: contain; /* Full content visible as requested */
	}

	/* Description Section (Field Letter) */
	.description-section {
		flex: 0 0 auto;
		display: flex;
		justify-content: center;
		position: relative;
	}

	.field-letter-card {
		width: 100%;
		max-width: 500px;
		background-color: #fdf6e3;
		background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' stitchTiles='stitch'/%3E%3CfeComposite operator='in' in2='SourceGraphic'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23fdf6e3' filter='url(%23paperNoise)' opacity='0.2'/%3E%3C/svg%3E");
		padding: 1.5rem;
		border-radius: 2px;
		box-shadow:
			5px 5px 15px rgba(0, 0, 0, 0.3),
			inset 0 0 80px rgba(139, 115, 85, 0.15);
		border: 1px solid #dcd4c1;
		position: relative;
		transform: rotate(-0.5deg);
	}

	/* Card Details */
	.stamp-mark {
		position: absolute;
		top: 1rem;
		right: 1.5rem;
		width: 50px;
		height: 50px;
		background: rgba(139, 69, 19, 0.08);
		border: 2px dashed rgba(139, 69, 19, 0.15);
		border-radius: 50%;
		pointer-events: none;
	}

	.letter-title {
		font-family: 'Merriweather', serif;
		color: #3b2c1e;
		font-size: 1.3rem;
		margin: 0 0 0.5rem 0;
		font-weight: 800;
		line-height: 1.3;
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
	}

	.letter-date {
		font-family: 'Inter', sans-serif;
		color: #8b6d4d;
		font-size: 0.85rem;
		margin: 0.5rem 0 0 0;
		font-weight: 500;
		font-style: italic;
	}

	.separator-line {
		width: 40px;
		height: 3px;
		background: #8b6d4d;
		margin-bottom: 0.8rem;
	}

	.letter-paragraph {
		font-family: 'Inter', sans-serif;
		color: #4a3a2a;
		font-size: 1rem;
		line-height: 1.8;
		margin: 0 0 1rem 0;
		font-weight: 450;
		text-align: justify;
		text-indent: 1.5em; /* First line indent like a letter */
	}

	.letter-paragraph:last-child {
		margin-bottom: 0;
	}

	/* Card footer - fixed at bottom of screen */
	.card-footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		max-width: 100vw;
		padding: 1rem 1.5rem;
		padding-bottom: max(1rem, env(safe-area-inset-bottom));
		background: #fdf6e3; /* Solid color to match card */
		border-top: 1px solid rgba(139, 115, 85, 0.2);
		display: flex;
		justify-content: space-between;
		align-items: center;
		z-index: 100;
		box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
	}

	.read-more-link {
		background: none;
		border: none;
		color: #8b6d4d;
		font-family: 'Inter', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: transform 0.2s;
	}

	.read-more-link svg {
		width: 18px;
		height: 18px;
	}

	.read-more-link:hover {
		transform: translateX(4px);
		color: #5d4631;
	}

	/* Mobile: Show truncated content */
	.content-mobile {
		display: block;
	}

	.content-desktop {
		display: none;
	}

	/* Mobile: Show read more button */
	.read-more-mobile {
		display: flex;
	}

	/* Interacion Styles */
	.interaction-group {
		display: flex;
		gap: 1.2rem;
		align-items: center;
	}

	.action-icon {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		color: #8b6d4d;
		padding: 0;
		transition: transform 0.2s;
	}

	.action-icon svg {
		width: 24px;
		height: 24px;
	}

	.social-icon {
		width: 72px; /* Much larger for visibility */
		height: 72px;
		object-fit: contain;
	}

	.like-counter {
		font-family: 'Inter', sans-serif;
		font-weight: 700;
		font-size: 0.9rem;
		color: #3b2c1e;
	}

	.flame-anim {
		animation: flame-pulse 1.2s infinite ease-in-out;
	}

	@keyframes flame-pulse {
		0%,
		100% {
			transform: scale(1);
			filter: brightness(1);
		}
		50% {
			transform: scale(1.15);
			filter: brightness(1.2);
		}
	}

	/* Carousel controls */
	.carousel-indicators {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 6px;
		z-index: 10;
	}

	.indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.4);
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.indicator.active {
		background: #fff;
		transform: scale(1.2);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		border: none;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		z-index: 10;
		backdrop-filter: blur(4px);
		opacity: 1; /* Always visible on mobile */
		transition:
			opacity 0.3s,
			background 0.3s;
	}

	.nav-btn:active {
		background: rgba(0, 0, 0, 0.7);
	}

	.nav-btn.prev {
		left: 10px;
	}
	.nav-btn.next {
		right: 10px;
	}
	.nav-btn.hidden {
		display: none;
	}
	.nav-btn svg {
		width: 20px;
		height: 20px;
	}

	/* Desktop Adaptation */
	@media (min-width: 850px) {
		.content-wrapper {
			max-width: 1400px;
			flex-direction: row;
			align-items: center;
			gap: 2rem;
			padding: 2rem;
		}

		.image-section {
			flex: 0 0 50%;
			justify-content: center;
		}

		.instagram-frame {
			max-width: 600px;
			border-radius: 12px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		}

		.description-section {
			flex: 0 0 50%;
			justify-content: center;
		}

		.field-letter-card {
			max-width: 550px;
			max-height: 80vh; /* Limit height on desktop */
			transform: rotate(0.5deg);
			padding: 2.5rem;
			display: flex;
			flex-direction: column;
			overflow: hidden;
		}

		/* Desktop: Scrollable content */
		.card-body-scroll {
			flex: 1;
			overflow-y: auto;
			overflow-x: hidden;
			margin: 0.8rem 0;
			padding-right: 0.5rem;
			-webkit-overflow-scrolling: touch;
		}

		.card-body-scroll::-webkit-scrollbar {
			width: 4px;
		}

		.card-body-scroll::-webkit-scrollbar-track {
			background: rgba(139, 115, 85, 0.1);
			border-radius: 2px;
		}

		.card-body-scroll::-webkit-scrollbar-thumb {
			background: rgba(139, 115, 85, 0.3);
			border-radius: 2px;
		}

		.card-body-scroll::-webkit-scrollbar-thumb:hover {
			background: rgba(139, 115, 85, 0.5);
		}

		/* Desktop: Fixed footer */
		.card-footer {
			position: static; /* Remove fixed position */
			margin-top: auto;
			flex-shrink: 0;
			padding: 1rem 0 0 0;
			background: none;
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		/* Desktop: Show full content, hide mobile content */
		.content-mobile {
			display: none;
		}

		.content-desktop {
			display: block;
		}

		/* Desktop: Hide read more button */
		.read-more-mobile {
			display: none;
		}

		.letter-title {
			font-size: 1.8rem;
		}

		.letter-paragraph {
			font-size: 1.05rem;
			line-height: 1.9;
		}

		/* Desktop: Show arrows only on hover */
		.nav-btn {
			opacity: 0;
		}

		.instagram-frame:hover .nav-btn {
			opacity: 1;
		}
	}

	@media (max-height: 700px) and (min-width: 850px) {
		.instagram-frame {
			max-width: 400px;
		}
	}
</style>
