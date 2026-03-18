<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { reveal } from '$lib/actions/reveal';

	import bookCoverFront from '$lib/assets/cartas_campo.jpeg';
	import bookCoverBack from '$lib/assets/cartas_felipe.jpeg';
	import bookInterior from '$lib/assets/cartas_mão.jpeg';

	const bookImages = [bookCoverFront, bookCoverBack, bookInterior];
	let currentBookIndex = $state(0);
	let isExpanded = $state(false);
	let pixFeedback = $state('');

	function toggleExpand() {
		isExpanded = !isExpanded;
	}

	function copyPix() {
		const pixKey = '08105478994';
		navigator.clipboard.writeText(pixKey).then(() => {
			pixFeedback = 'Chave Pix copiada!';
			setTimeout(() => {
				pixFeedback = '';
			}, 3000);
		});
	}

	onMount(() => {
		const interval = setInterval(() => {
			currentBookIndex = (currentBookIndex + 1) % bookImages.length;
		}, 3000);

		return () => clearInterval(interval);
	});
</script>

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
							Jesus é a nossa prioridade. Vivemos dias difíceis e, por isso, precisamos tê-Lo como o
							fundamento das nossas vidas. Assim, a casa permanecerá de pé mesmo quando os ventos
							soprarem contra nós.
						</p>
						<p class="book-desc">
							Nossa maior oração é que cada pessoa que ler este pequeno livro seja impulsionada a
							crescer ainda mais na oração, na leitura da Palavra e no testemunho do evangelho entre
							os perdidos. Queremos Jesus — e nada mais.
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
					href="https://wa.me/5547997557857?text=Ol%C3%A1+Felipe,+quero+adquirir+o+livro+%F0%9F%98%80"
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-primary"
				>
					Adquirir via WhatsApp
				</a>
				<button onclick={copyPix} class="btn btn-secondary"> Ofertar via Pix </button>
			</div>

			<div class="cartas-cta" use:reveal>
				<a href="/cartas" class="btn-cartas">
					<div class="cartas-cta-icon">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z"
							/>
						</svg>
					</div>
					<div class="cartas-cta-text">
						<span class="cartas-cta-label">Do campo para você</span>
						<span class="cartas-cta-title">Cartas do Campo</span>
						<span class="cartas-cta-sub">Relatos das missões enviados direto do sertão</span>
					</div>
					<svg
						class="cartas-cta-arrow"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="2"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
						/>
					</svg>
				</a>
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

<style>
	.section {
		padding: var(--spacing-xl) 0;
	}

	.book-spotlight {
		background-color: var(--color-white);
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

	.eyebrow {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-secondary);
		font-weight: 600;
		font-size: 0.9rem;
		display: block;
		margin-bottom: 1rem;
	}

	.section-title {
		font-size: var(--text-3xl);
		margin-bottom: 0.5rem;
		color: var(--color-primary);
	}

	.book-desc {
		font-size: 1.1rem;
		line-height: 1.7;
		margin-bottom: 1rem;
		color: var(--color-text-light); /* Ensure text color consistency */
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

	.cta-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.cartas-cta {
		margin-top: 1.8rem;
	}

	.btn-cartas {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.1rem 1.4rem;
		background: linear-gradient(135deg, #fdf6e3 0%, #f5ead0 100%);
		border: 2px solid rgba(139, 90, 43, 0.25);
		border-radius: 14px;
		text-decoration: none;
		color: #5d3c1e;
		transition: all 0.3s ease;
		box-shadow: 0 4px 14px rgba(139, 90, 43, 0.1);
		position: relative;
		overflow: hidden;
	}

	.btn-cartas::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(139, 90, 43, 0.06), transparent);
		opacity: 0;
		transition: opacity 0.3s;
	}

	.btn-cartas:hover {
		border-color: rgba(139, 90, 43, 0.5);
		box-shadow: 0 8px 24px rgba(139, 90, 43, 0.18);
		transform: translateY(-2px);
	}

	.btn-cartas:hover::before {
		opacity: 1;
	}

	.cartas-cta-icon {
		width: 44px;
		height: 44px;
		background: rgba(139, 90, 43, 0.12);
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.cartas-cta-icon svg {
		width: 22px;
		height: 22px;
		color: #8b5a2b;
	}

	.cartas-cta-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
	}

	.cartas-cta-label {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: rgba(93, 60, 30, 0.6);
		font-weight: 600;
	}

	.cartas-cta-title {
		font-family: 'Merriweather', serif;
		font-size: 1rem;
		font-weight: 700;
		color: #3b2c1e;
	}

	.cartas-cta-sub {
		font-size: 0.75rem;
		color: rgba(93, 60, 30, 0.7);
		line-height: 1.4;
	}

	.cartas-cta-arrow {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		color: #8b5a2b;
		transition: transform 0.2s;
	}

	.btn-cartas:hover .cartas-cta-arrow {
		transform: translateX(4px);
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
		will-change: opacity; /* Hint for GPU */
	}

	.book-slide.active {
		opacity: 1;
	}

	/* Responsive */
	@media (max-width: 900px) {
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
