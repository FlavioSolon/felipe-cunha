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

	function toggleLike() {
		liked = !liked;
		// In a real app, this would update the backend
	}

	async function share() {
		if (navigator.share) {
			try {
				await navigator.share({
					title: item.title,
					text: item.content.substring(0, 100) + '...',
					url: window.location.href // Or specific post URL if routing allowed
				});
			} catch (err) {
				console.log('Error sharing:', err);
			}
		} else {
			// Fallback for desktop/unsupported browsers
			navigator.clipboard.writeText(window.location.href);
			shareText = 'Link Copiado!';
			setTimeout(() => (shareText = 'Compartilhar'), 2000);
		}
	}
</script>

<div class="feed-item">
	<!-- Background Image Carousel -->
	<div class="image-container">
		{#each item.images as image, index}
			<div
				class="image-slide"
				class:active={index === currentImageIndex}
				style="background-image: url('{image}');"
			></div>
		{/each}

		<!-- Gradient Overlay -->
		<div class="gradient-overlay"></div>

		<!-- Navigation/Indicators -->
		{#if item.images.length > 1}
			<div class="carousel-indicators">
				{#each item.images as _, index}
					<button
						class="indicator"
						class:active={index === currentImageIndex}
						on:click|stopPropagation={() => (currentImageIndex = index)}
						aria-label="Go to image {index + 1}"
					></button>
				{/each}
			</div>

			<!-- Touch areas for navigation could be added here, 
                 but simple click on sides usually requires more logic. 
                 For now, let's keep it simple or use swipe libraries later. 
                 Since user asked for 'horizontal image carousels', adding simple side buttons if multiple images.
            -->
			<button
				class="nav-btn prev"
				on:click|stopPropagation={prevImage}
				class:hidden={currentImageIndex === 0}
				aria-label="Previous image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>
			<button
				class="nav-btn next"
				on:click|stopPropagation={nextImage}
				class:hidden={currentImageIndex === item.images.length - 1}
				aria-label="Next image"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Content Overlay -->
	<div class="content-overlay">
		<h2 class="title">{item.title}</h2>
		<p class="preview-text">
			{item.content.slice(0, 120)}...
		</p>

		<div class="actions">
			<button class="read-more-btn" on:click={() => onReadMore(item)}>
				Ler tudo
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-5 h-5 ml-2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
					/>
				</svg>
			</button>

			<div class="social-actions">
				<button class="icon-btn like-btn" class:liked on:click={toggleLike} aria-label="Like">
					{#if liked}
						<img src={cactoChamasIcon} alt="Liked" class="cacto-icon liked-anim" />
					{:else}
						<img src={cactoIcon} alt="Like" class="cacto-icon" />
					{/if}
					<span class="count">{item.likes + (liked ? 1 : 0)}</span>
				</button>

				<button class="icon-btn share-btn" on:click={share} aria-label="Share">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-8 h-8"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093s-.107.77-.287 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
						/>
					</svg>
					<!-- Removed text label for cleaner share button -->
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	/* ... (unchanged styles) */

	/* Custom overrides specifically for buttons to fine-tune sizes */

	.share-btn svg {
		width: 32px !important;
		height: 32px !important;
	}

	.like-btn {
		flex-direction: row !important; /* Force horizontal layout for like button */
		gap: 0 !important; /* Removed gap to bring count closer */
		align-items: center;
	}

	.cacto-icon {
		width: 104px;
		height: 104px;
		transition: transform 0.2s;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
		object-fit: contain; /* Ensure aspect ratio */
	}

	/* 
       The fire animation image likely has padding for the flames, making the cactus part smaller.
       We scale it up slightly to visually match the non-fire cactus size.
    */
	.icon-btn.liked .cacto-icon {
		transform: scale(1.3); /* Scale up the liked icon to match visual size */
	}

	.liked-anim {
		animation: fire-pop 1.5s ease-out; /* Slower animation as requested */
	}

	@keyframes fire-pop {
		0% {
			transform: scale(1);
			filter: brightness(1);
		}
		50% {
			transform: scale(1.3);
			filter: brightness(1.2) drop-shadow(0 0 10px orange);
		}
		100% {
			transform: scale(1.3); /* Keep it scaled up at the end state */
			filter: brightness(1);
		}
	}

	.nav-btn {
		/* Make nav buttons cleaner */
		background: transparent !important; /* Remove background */
		backdrop-filter: none !important;
		opacity: 0.7;
	}

	.nav-btn:hover {
		opacity: 1;
		transform: scale(1.2);
	}

	.nav-btn svg {
		width: 32px;
		height: 32px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
	}
	.feed-item {
		height: 100dvh; /* Dynamic Viewport Height for mobile browsers */
		width: 100%;
		position: relative;
		overflow: hidden;
		scroll-snap-align: start;
		background-color: #1a1a1a; /* Fallback */
	}

	.image-container {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}

	.image-slide {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-size: cover;
		background-position: center;
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
	}

	.image-slide.active {
		opacity: 1;
	}

	.gradient-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 60%;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.5) 50%,
			rgba(0, 0, 0, 0) 100%
		);
		pointer-events: none;
	}

	.content-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		padding: 2rem 1.5rem 3rem 1.5rem; /* Reduced bottom padding to lower content */
		color: white;
		z-index: 10;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.title {
		font-family: 'Merriweather', serif;
		font-size: 2rem;
		margin: 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
		line-height: 1.2;
	}

	.preview-text {
		font-family: 'Montserrat', sans-serif;
		font-size: 1rem;
		margin: 0.5rem 0 1rem 0;
		opacity: 0.9;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
		max-width: 90%;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		flex-direction: row; /* Horizontal alignment */
		justify-content: space-between;
		align-items: center;
		width: 100%;
		gap: 0; /* Gap handled by justify-between */
		margin-top: 1rem;
	}

	.read-more-btn {
		background: transparent;
		/* backdrop-filter: blur(5px); Removed blur for cleaner look */
		border: 1px solid rgba(255, 255, 255, 0.6);
		color: white;
		padding: 0.5rem 1rem; /* Smaller padding */
		border-radius: 50px;
		font-family: 'Montserrat', sans-serif;
		font-weight: 500; /* Lighter weight */
		font-size: 0.9rem; /* Smaller font */
		cursor: pointer;
		display: flex;
		align-items: center;
		width: fit-content;
		transition: all 0.3s ease;
	}

	.read-more-btn:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: translateY(-2px);
	}

	.social-actions {
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.icon-btn {
		background: none;
		border: none;
		color: white;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		padding: 0;
		transition: transform 0.2s;
	}

	.icon-btn:hover {
		transform: scale(1.1);
	}

	.icon-btn:active {
		transform: scale(0.9);
	}

	/* 
    .like-btn.liked { color: #ff4d4d; } 
    .like-btn.liked svg { fill: #ff4d4d; }
    Replaced by image logic above
    */

	.count {
		font-size: 0.9rem; /* Slightly larger font */
		font-family: 'Montserrat', sans-serif;
		opacity: 1; /* More visible */
		font-weight: 600;
		margin-left: -20px; /* Further increased negative margin to pull count much closer */
		margin-bottom: 20px; /* Adjusted vertical alignment for new position */
		z-index: 5; /* Ensure it's above any potential overlap */
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8); /* Enhance readability against icon overlap if any */
	}

	/* Carousel Indicators */
	.carousel-indicators {
		position: absolute;
		top: 6rem; /* Moved down to avoid header overlap */
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		z-index: 20;
	}

	.indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		border: none;
		padding: 0;
		transition: all 0.3s;
	}

	.indicator.active {
		background: white;
		transform: scale(1.2);
	}

	.nav-btn {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.2);
		color: white;
		border: none;
		border-radius: 50%;
		padding: 0.5rem;
		cursor: pointer;
		z-index: 20;
		backdrop-filter: blur(2px);
	}

	.nav-btn.prev {
		left: 1rem;
	}
	.nav-btn.next {
		right: 1rem;
	}

	.nav-btn.hidden {
		display: none;
	}

	@media (min-width: 768px) {
		.title {
			font-size: 3rem;
		}
		.preview-text {
			font-size: 1.2rem;
			max-width: 600px;
		}
		.feed-item {
			/* Consider max-width for desktop if we want a mobile-like feel, 
                or full width. For now full width to resemble typical immersive scroll sites. */
		}
		.content-overlay {
			padding-bottom: 3rem;
		}
		.actions {
			flex-direction: row;
			justify-content: space-between;
			align-items: center; /* Enforce center alignment on desktop too */
		}
		.read-more-btn {
			font-size: 1.1rem;
		}
	}
</style>
