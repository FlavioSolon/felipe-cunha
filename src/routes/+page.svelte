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
		<div class="gallery-scroll">
			{#each galleryImages as img}
				<div class="gallery-item">
					<img src={img} alt="Momento no campo" />
				</div>
			{/each}
		</div>
	</section>

	<!-- Book Spotlight Section -->
	<section id="livro" class="section book-spotlight">
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
		<div class="container">
			<p>© {new Date().getFullYear()} Felipe Cunha. Todos os direitos reservados.</p>
			<div class="socials">
				<a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
				<a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
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
		position: relative;
		height: 500px; /* Fixed height for slideshow */
		align-items: center;
	}

	.book-slide {
		max-width: 300px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
		position: absolute;
		opacity: 0;
		transition: opacity 1s ease-in-out;
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

		.book-wrapper {
			padding: 1rem;
			height: 400px; /* Adjust for mobile */
		}

		.book-slide {
			max-width: 250px; /* Larger on mobile as requested (relative to screen) */
			width: 70%;
		}
	}
</style>
