<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	// Assets
	import heroBg from '$lib/assets/familia_missionaria.jpg';
	import aboutImg from '$lib/assets/casal.jpg'; // Using casal for about if user didn't specify one, or empty string logic

	import bookCoverFront from '$lib/assets/cartas_campo.jpeg';
	import bookCoverBack from '$lib/assets/cartas_felipe.jpeg'; // Assuming this mapping based on names
	import bookInterior from '$lib/assets/cartas_mão.jpeg';

	import gallery1 from '$lib/assets/casal.jpg';
	import gallery2 from '$lib/assets/culto.jpg';
	import gallery3 from '$lib/assets/felipe_pregando.jpg';
	import gallery4 from '$lib/assets/igreja.jpg';

	let pixFeedback = $state('');
	let scrollY = $state(0);
	let innerHeight = $state(0);
	let isExpanded = $state(false);

	function toggleExpand() {
		isExpanded = !isExpanded;
	}

	// Book Slideshow Images
	const bookImages = [bookCoverFront, bookCoverBack, bookInterior];
	let currentBookIndex = $state(0);

	const galleryImages = [gallery1, gallery2, gallery3, gallery4];

	onMount(() => {
		const interval = setInterval(() => {
			currentBookIndex = (currentBookIndex + 1) % bookImages.length;
		}, 3000);

		return () => clearInterval(interval);
	});

	function copyPix() {
		const pixKey = '[CHAVE_PIX_AQUI]';
		navigator.clipboard.writeText(pixKey).then(() => {
			pixFeedback = 'Chave Pix copiada!';
			setTimeout(() => {
				pixFeedback = '';
			}, 3000);
		});
	}

	function scrollToBook() {
		const bookSection = document.getElementById('livro');
		if (bookSection) {
			bookSection.scrollIntoView({ behavior: 'smooth' });
		}
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
	<title>Felipe Cunha</title>
	<meta property="og:title" content="Felipe Cunha" />
	<meta property="og:description" content="Levar Jesus até a poeira da terra." />
	<meta property="og:image" content={heroBg} />
	<meta property="og:type" content="website" />
</svelte:head>

<main>
	<!-- Full Screen Hero -->
	<header class="hero">
		<div class="hero-bg" style="transform: translateY({scrollY * 0.5}px);">
			<img src={heroBg} alt="Campo Missionário" />
			<div class="overlay"></div>
		</div>
		<div class="hero-content container">
			<div class="badge" use:reveal>Felipe Cunha</div>
			<h1 class="hero-title" use:reveal>
				"Nossa missão é fazer com que <span class="highlight">Ele</span> se torne a Pessoa mais amada
				entre os Povos."
			</h1>
			<button class="scroll-btn" onclick={scrollToBook} use:reveal> Conheça meu livro </button>
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
					<div class="signature">Felipe Cunha - O Evangelho nasce na poeira.</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Horizontal Scrolling Gallery -->
	<section class="section gallery-section" use:reveal>
		<div class="container">
			<h2 class="section-title center">Retalhos do Campo</h2>
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

	<!-- Book Spotlight Section -->
	<section id="livro" class="section book-spotlight">
		<div class="container grid-layout reverse">
			<div class="text-col">
				<span class="eyebrow" use:reveal>Novo Lançamento</span>
				<h2 class="section-title" use:reveal>Cartas do Campo</h2>
				<div class="book-desc-container" use:reveal>
					<p class="book-desc">
						Cartas do Campo é uma série de devocionais escritos no campo missionário com o propósito
						de encorajar e despertar os leitores para um relacionamento profundo com Jesus. Este
						compilado reúne testemunhos, conselhos, reflexões e orientações para uma vida firmada no
						Senhor.
					</p>

					{#if isExpanded}
						<div class="expanded-content" transition:fade>
							<p class="book-desc">
								Jesus é a nossa prioridade. Vivemos dias difíceis e, por isso, precisamos tê-Lo como
								o fundamento das nossas vidas. Assim, a casa permanecerá de pé mesmo quando os
								ventos soprarem contra nós.
							</p>
							<p class="book-desc">
								Nossa maior oração é que cada pessoa que ler este pequeno livro seja impulsionada a
								crescer ainda mais na oração, na leitura da Palavra e no testemunho do evangelho
								entre os perdidos. Queremos Jesus — e nada mais.
							</p>
							<p class="book-desc">Que o seu coração seja aquecido!</p>
						</div>
					{/if}

					<button onclick={toggleExpand} class="read-more-btn">
						{isExpanded ? 'Ler menos' : 'Leia mais'}
					</button>
				</div>

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
					{#each bookImages as img, i}
						<img
							src={img}
							alt="Livro Cartas do Campo"
							class="book-slide {i === currentBookIndex ? 'active' : ''}"
						/>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer">
		<div class="container placeholder-footer">
			<p>&copy; {new Date().getFullYear()} Felipe Cunha. Todos os direitos reservados.</p>

			<div class="developer-credit">
				<p>
					Feito com amor <span style="color: #2ecc71;">💚</span> por Flávio Sólon
					<span style="font-size: 1.2em;">🌵</span>
				</p>
			</div>

			<div class="socials">
				<a href="https://www.instagram.com/solonflavi/" target="_blank" rel="noopener noreferrer"
					>Instagram</a
				>
				<a
					href="https://www.linkedin.com/in/fl%C3%A1vio-s-8941b9212/"
					target="_blank"
					rel="noopener noreferrer">LinkedIn</a
				>
				<a href="https://github.com/FlavioSolon" target="_blank" rel="noopener noreferrer">GitHub</a
				>
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
		object-position: center 30%; /* Focus on faces (upper center) */
		filter: grayscale(100%) contrast(1.2) brightness(0.6); /* Force P&B look */
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
	}

	.scroll-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--color-white);
		transform: translateY(-2px);
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
		margin-bottom: 0.5rem;
		color: var(--color-primary);
	}

	.section-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-light);
		margin-bottom: var(--spacing-md);
		font-weight: 500;
		font-family: var(--font-secondary);
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
		font-size: var(--text-base);
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
		padding: 4rem 0 0;
		overflow: hidden;
	}

	.gallery-section .section-title {
		margin-bottom: 3rem;
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
		font-size: 1.1rem;
		line-height: 1.7;
		margin-bottom: 1rem;
	}

	.book-desc-container {
		margin-bottom: 2rem;
	}

	.read-more-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		font-size: 1rem;
		margin-top: 0.5rem;
	}

	.book-wrapper {
		position: relative;
		width: 100%;
		max-width: 500px; /* Increased desktop max-width */
		aspect-ratio: 2 / 3;
		margin: 0 auto;
		background: transparent;
		padding: 0;
		height: auto;
		display: block;
	}

	.book-slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 1s ease-in-out;
		border-radius: 12px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
		max-width: none;
	}

	.book-slide.active {
		opacity: 1;
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

	.developer-credit {
		margin: 1rem 0;
		font-weight: 500;
		color: #aaa;
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
			font-size: 2.5rem;
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

		/* Mobile Book Size Increase */
		.book-wrapper {
			max-width: none;
			width: 85vw; /* Much larger on mobile */
		}

		.book-slide {
			width: 100%;
			max-width: none;
		}
	}
</style>
