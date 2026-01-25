<script lang="ts">
	import gallery1 from '$lib/assets/casal.jpg';
	import gallery2 from '$lib/assets/culto.jpg';
	import gallery3 from '$lib/assets/felipe_pregando.jpg';
	import gallery4 from '$lib/assets/igreja.jpg';
	import { reveal } from '$lib/actions/reveal';

	const galleryImages = [gallery1, gallery2, gallery3, gallery4];
</script>

<section class="section gallery-section" use:reveal>
	<div class="container">
		<h2 class="section-title center">Reflexões do campo</h2>
	</div>
	<div class="marquee-wrapper">
		<div class="marquee-content">
			<!-- Duplicate logical functionality for infinite loop -->
			{#each [...galleryImages, ...galleryImages] as img, i}
				<div class="gallery-item">
					<img src={img} alt="Momento {i}" loading="lazy" />
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.section {
		padding: var(--spacing-xl) 0;
	}

	.gallery-section {
		padding: 4rem 0 0;
		overflow: hidden;
	}

	.center {
		text-align: center;
	}

	.gallery-section .section-title {
		margin-bottom: 3rem;
		font-size: var(--text-3xl);
		color: var(--color-primary);
	}

	.marquee-wrapper {
		width: 100%;
		overflow: hidden;
		white-space: nowrap;
		padding-bottom: 4rem;
	}

	.marquee-content {
		display: inline-flex;
		animation: scroll 40s linear infinite;
		will-change: transform; /* Hint for GPU */
	}

	.gallery-item {
		flex: 0 0 auto;
		width: 300px;
		height: 200px;
		margin-right: 1.5rem;
		border-radius: 8px;
		overflow: hidden;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.gallery-item:hover img {
		transform: scale(1.1);
	}

	@keyframes scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
</style>
