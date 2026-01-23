<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	let pixFeedback = $state('');
	let scrollY = $state(0);
	let innerHeight = $state(0);

	// Mock placeholders for missing images
	const heroBg = 'https://placehold.co/1920x1080/333333/FFF?text=Hero+Image+Missionary+Field';
	const aboutImg = 'https://placehold.co/800x1200/F5F5DC/A0522D?text=Portrait:+Felipe+Cunha';
	const bookMockup = 'https://placehold.co/600x800/A0522D/FFF?text=Book+Cover:+Cartas+do+Campo';
	const galleryImages = [
		'https://placehold.co/600x400/556B2F/FFF?text=Mission+Moment+1',
		'https://placehold.co/600x400/A0522D/FFF?text=Mission+Moment+2',
		'https://placehold.co/600x400/333333/FFF?text=Mission+Moment+3',
		'https://placehold.co/600x400/F5F5DC/333333?text=Mission+Moment+4'
	];

	function copyPix() {
		const pixKey = '[CHAVE_PIX_AQUI]';
		navigator.clipboard.writeText(pixKey).then(() => {
			pixFeedback = 'Chave Pix copiada!';
			setTimeout(() => {
				pixFeedback = '';
			}, 3000);
		});
	}

	// Intersection Observer Action
	function reveal(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						node.classList.add('visible');
						observer.unobserve(node); // Reveal once
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<svelte:window bind:scrollY bind:innerHeight />

<svelte:head>
	<title>Felipe Cunha | Ministério</title>
</svelte:head>

<main>
	<!-- Full Screen Hero -->
	<header class="hero">
		<div class="hero-bg" style="transform: translateY({scrollY * 0.5}px);">
			<img src={heroBg} alt="Campo Missionário" />
			<div class="overlay"></div>
		</div>
		<div class="hero-content container">
			<div class="badge" use:reveal>Ministério Felipe Cunha</div>
			<h1 class="hero-title" use:reveal>
				Levar <span class="highlight">Jesus</span> até a<br />
				poeira da terra.
			</h1>
			<p class="hero-subtitle" use:reveal>
				Nossa missão é fazer com que Ele se torne a Pessoa mais amada entre os Povos.
			</p>
			<div class="scroll-indicator">
				<span>Explore a missão</span>
				<div class="line"></div>
			</div>
		</div>
	</header>

	<!-- Immersive About Section -->
	<section class="section about-immersive">
		<div class="container grid-layout">
			<div class="image-col" use:reveal>
				<div class="image-wrapper">
					<img src={aboutImg} alt="Felipe Cunha" />
				</div>
			</div>
			<div class="text-col">
				<h2 class="section-title" use:reveal>
					Uma vida dedicada<br />ao <span class="italic">Ide</span>.
				</h2>
				<div class="prose" use:reveal>
					<p class="lead">
						Felipe Cunha vive o evangelho na prática, servindo no Nordeste brasileiro entre povos
						não alcançados.
					</p>
					<p>
						Nascido em Santa Catarina, Felipe trocou o conforto pelo chamado. Há mais de 10 anos,
						ele, sua esposa Tamyres e seus filhos Noah e Esther, dedicam suas vidas ao cuidado
						integral de sertanejos, quilombolas e ciganos.
					</p>
					<p>
						Como parte do ministério Iris Global, eles plantam bases missionárias e igrejas, levando
						esperança onde ela é escassa.
					</p>
					<div class="signature">Felipe Cunha</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Horizontal Scrolling Gallery -->
	<section class="section gallery-section" use:reveal>
		<div class="container">
			<h2 class="section-title center">Retalhos do Campo</h2>
		</div>
		<div class="gallery-scroll">
			{#each galleryImages as img}
				<div class="gallery-item">
					<img src={img} alt="Momento no campo" />
				</div>
			{/each}
		</div>
	</section>

	<!-- Book Spotlight Section -->
	<section class="section book-spotlight">
		<div class="container grid-layout reverse">
			<div class="text-col">
				<span class="eyebrow" use:reveal>Novo Lançamento</span>
				<h2 class="section-title" use:reveal>Cartas do Campo</h2>
				<p class="book-desc" use:reveal>
					Um compilado de devocionais escritos na poeira da missão. Testemunhos, conselhos e
					reflexões para quem deseja profundidade em Deus em tempos superficiais.
				</p>

				<div class="cta-group" use:reveal>
					<a
						href="https://wa.me/5500000000000"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary"
					>
						Adquirir via WhatsApp
					</a>
					<button onclick={copyPix} class="btn btn-secondary"> Ofertar via Pix </button>
				</div>

				{#if pixFeedback}
					<div class="toast" transition:fly={{ y: 20 }}>
						{pixFeedback}
					</div>
				{/if}
			</div>

			<div class="image-col" use:reveal>
				<div class="book-wrapper">
					<img src={bookMockup} alt="Livro Cartas do Campo" class="book-shadow" />
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="container">
			<p>© {new Date().getFullYear()} Ministério Felipe Cunha. Todos os direitos reservados.</p>
			<div class="socials">
				<a href="#">Instagram</a>
				<a href="#">YouTube</a>
			</div>
		</div>
	</footer>
</main>

<style>
	/* Hero */
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
	}

	.hero-bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
	}

	.hero-content {
		text-align: center;
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.badge {
		text-transform: uppercase;
		font-family: var(--font-secondary);
		letter-spacing: 0.2em;
		font-size: 0.9rem;
		opacity: 0.9;
		margin-bottom: -1rem;
	}

	.hero-title {
		font-family: var(--font-primary);
		font-size: var(--text-4xl);
		line-height: 1.1;
		font-weight: 300;
	}

	.highlight {
		font-style: italic;
		font-family: var(--font-accent);
		color: var(--color-primary-light);
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		max-width: 600px;
		opacity: 0.9;
		font-weight: 300;
	}

	.scroll-indicator {
		position: absolute;
		bottom: 3rem; /* Fixed: Relative to hero, but pushed down */
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.7;
	}

	/* Move scroll indicator differently to not be hidden if content is large */
	@media (min-height: 600px) {
		.scroll-indicator {
			position: absolute;
			bottom: 40px;
		}
	}

	.line {
		width: 1px;
		height: 60px;
		background: var(--color-white);
	}

	/* Section Layouts */
	.section {
		padding: var(--spacing-xl) 0;
	}

	.grid-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.grid-layout.reverse .text-col {
		order: 2;
	}

	/* About */
	.about-immersive {
		background-color: var(--color-bg-light);
	}

	.image-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: 4px;
	}

	.image-wrapper img {
		width: 100%;
		display: block;
		transition: transform 1.5s ease;
	}

	.image-wrapper:hover img {
		transform: scale(1.05);
	}

	.section-title {
		font-size: var(--text-3xl);
		margin-bottom: var(--spacing-md);
		color: var(--color-primary);
	}

	.italic {
		font-style: italic;
		font-family: var(--font-primary);
	}

	.lead {
		font-size: var(--text-lg);
		font-weight: 500;
		color: var(--color-primary);
		margin-bottom: 1.5rem;
	}

	.prose p {
		margin-bottom: 1.5rem;
		font-size: var(--text-baase);
		color: var(--color-text-light);
	}

	.signature {
		font-family: var(--font-accent);
		font-size: 2rem;
		color: var(--color-text-main);
		margin-top: 2rem;
	}

	/* Gallery */
	.gallery-section {
		background-color: var(--color-bg-neutral);
		padding: var(--spacing-xl) 0;
		overflow: hidden;
	}

	.center {
		text-align: center;
	}

	.gallery-scroll {
		display: flex;
		gap: var(--spacing-md);
		padding: 0 var(--spacing-md);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none; /* Hide scrollbar Firefox */
		margin-top: var(--spacing-md);
	}

	.gallery-scroll::-webkit-scrollbar {
		display: none; /* Hide scrollbar Chrome */
	}

	.gallery-item {
		flex: 0 0 400px;
		height: 300px;
		scroll-snap-align: center;
		border-radius: 8px;
		overflow: hidden;
	}

	.gallery-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Book Section */
	.book-spotlight {
		background-color: var(--color-white);
	}

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-secondary);
		font-weight: 600;
		font-size: 0.9rem;
		display: block;
		margin-bottom: 1rem;
	}

	.book-desc {
		font-size: var(--text-base);
		color: var(--color-text-light);
		margin-bottom: 2rem;
		max-width: 500px;
	}

	.book-wrapper {
		display: flex;
		justify-content: center;
		padding: 3rem;
		background: radial-gradient(circle at center, var(--color-bg-neutral) 0%, transparent 70%);
	}

	.book-shadow {
		max-width: 300px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		transform: rotate(-5deg);
		transition: transform 0.5s ease;
	}

	.book-wrapper:hover .book-shadow {
		transform: rotate(0deg) scale(1.05);
	}

	.cta-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.toast {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		background: var(--color-secondary);
		color: white;
		padding: 1rem 2rem;
		border-radius: 8px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		z-index: 100;
	}

	/* Footer */
	.footer {
		background-color: #222;
		color: #888;
		padding: 4rem 0;
		text-align: center;
		font-size: 0.9rem;
	}

	.socials {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		gap: 1.5rem;
	}

	.socials a:hover {
		color: white;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.hero-title {
			font-size: 3rem;
		}

		.grid-layout {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.grid-layout.reverse .text-col {
			order: unset; /* Reset order on mobile */
		}

		.image-col {
			margin-bottom: 2rem;
		}

		.cta-group {
			justify-content: center;
		}

		.book-wrapper {
			padding: 1rem;
		}

		.book-shadow {
			max-width: 200px;
		}
	}
</style>
