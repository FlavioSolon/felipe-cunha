<script lang="ts">
	import { fade } from 'svelte/transition';

	export let src: string;
	export let caption: string = '';
	export let layout: 'left' | 'right' | 'full' = 'full';
	export let rotation: number = 0; // slight tilt for organic feel

	let loaded = false;
	let imgEl: HTMLImageElement;

	function onLoad() {
		loaded = true;
	}
</script>

<figure class="image-block layout-{layout}" style="--rotation: {rotation}deg">
	{#if !loaded}
		<div class="img-skeleton"></div>
	{/if}
	<div class="polaroid">
		<img
			bind:this={imgEl}
			{src}
			alt={caption || 'Carta do campo'}
			loading="lazy"
			decoding="async"
			on:load={onLoad}
			class:loaded
		/>
		<!-- Decorative tape strip -->
		<div class="tape"></div>
	</div>
	{#if caption}
		<figcaption class="polaroid-caption">{caption}</figcaption>
	{/if}
</figure>

<style>
	.image-block {
		margin: 1.5rem 0;
		display: block;
		clear: both;
	}

	.image-block.layout-left {
		float: left;
		max-width: 45%;
		margin: 0.5rem 1.5rem 1rem 0;
		clear: left;
	}

	.image-block.layout-right {
		float: right;
		max-width: 45%;
		margin: 0.5rem 0 1rem 1.5rem;
		clear: right;
	}

	.image-block.layout-full {
		width: 100%;
		max-width: 100%;
		clear: both;
		margin: 2rem 0;
	}

	.polaroid {
		background: #fff;
		padding: 0.75rem 0.75rem 2.5rem;
		box-shadow:
			0 4px 15px rgba(0, 0, 0, 0.15),
			2px 2px 6px rgba(0, 0, 0, 0.08);
		transform: rotate(var(--rotation, 0deg));
		position: relative;
		display: inline-block;
		width: 100%;
		transition: transform 0.3s ease;
	}

	.polaroid:hover {
		transform: rotate(0deg) scale(1.02);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
	}

	/* Decorative tape */
	.tape {
		position: absolute;
		top: -12px;
		left: 50%;
		transform: translateX(-50%) rotate(-5deg);
		width: 60px;
		height: 20px;
		background: rgba(255, 230, 100, 0.7);
		border-radius: 2px;
		pointer-events: none;
		z-index: 1;
	}

	.image-block.layout-left .tape {
		transform: translateX(-50%) rotate(3deg);
	}

	.image-block.layout-right .tape {
		transform: translateX(-50%) rotate(-7deg);
	}

	img {
		width: 100%;
		height: auto;
		display: block;
		opacity: 0;
		transition: opacity 0.5s ease;
		object-fit: cover;
	}

	img.loaded {
		opacity: 1;
	}

	.img-skeleton {
		width: 100%;
		aspect-ratio: 4/3;
		background: linear-gradient(90deg, #e0d9c8 25%, #ece5d5 50%, #e0d9c8 75%);
		background-size: 400% 100%;
		animation: shimmer 1.5s infinite linear;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.polaroid-caption {
		text-align: center;
		font-family: 'Pinyon Script', cursive;
		font-size: 1.5rem;
		color: #4a321f;
		margin-top: 0.75rem;
		line-height: 1.3;
		letter-spacing: 0.3px;
	}

	/* Mobile: reset floats */
	@media (max-width: 849px) {
		.image-block.layout-left,
		.image-block.layout-right {
			float: none;
			max-width: 100%;
			margin: 1.5rem 0;
		}
	}
</style>
