<script lang="ts">
	import heroBg from '$lib/assets/familia_missionaria.jpeg';
	import { reveal } from '$lib/actions/reveal';

	export let scrollY = 0;

	function scrollToBook() {
		const bookSection = document.getElementById('livro');
		if (bookSection) {
			bookSection.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<header class="hero">
	<div class="hero-bg" style="transform: translateY({scrollY * 0.5}px);">
		<img src={heroBg} alt="Campo Missionário" />
		<div class="overlay"></div>
	</div>
	<div class="hero-content container">
		<div class="badge" use:reveal>Felipe Cunha</div>
		<h1 class="hero-title" use:reveal>
			"Nossa missão é fazer com que <span class="highlight">Ele</span> se torne a Pessoa mais amada entre
			os Povos."
		</h1>
		<button class="scroll-btn" onclick={scrollToBook} use:reveal> Conheça meu livro </button>
	</div>
</header>

<style>
	.hero {
		position: relative;
		height: 100vh;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		color: var(--color-white);
	}

	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 120%; /* Taller for parallax */
		z-index: -1;
		will-change: transform; /* Hint for GPU */
	}

	.hero-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 80%; /* Focus lower on family */
		filter: brightness(0.7); /* Slightly darken for text contrast, keep color */
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5));
	}

	.hero-content {
		text-align: center;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding-bottom: 4rem; /* Lift slightly */
	}

	.badge {
		text-transform: uppercase;
		font-family: var(--font-secondary);
		letter-spacing: 0.2em;
		font-size: 1.2rem; /* Increased size */
		opacity: 0.9;
		margin-bottom: -1rem;
	}

	.hero-title {
		font-family: var(--font-primary);
		font-size: var(--text-3xl); /* Slightly smaller than massive to fit quote */
		line-height: 1.3;
		font-weight: 300;
		max-width: 900px;
		font-style: italic;
	}

	.highlight {
		font-family: var(--font-accent);
		color: var(--color-primary-light);
		font-style: normal;
		font-size: 1.2em;
	}

	.scroll-btn {
		margin-top: 2rem;
		background: transparent;
		color: var(--color-white);
		border: 1px solid rgba(255, 255, 255, 0.5);
		padding: 0.8rem 2rem;
		border-radius: 50px;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.8rem;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.scroll-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-white);
		transform: translateY(-2px);
	}

	/* Utility Animations */
	:global(.visible) {
		animation: fadeInUp 0.8s ease-out forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
