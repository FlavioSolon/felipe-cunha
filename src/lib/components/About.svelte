<script lang="ts">
	import aboutImg from '$lib/assets/felipe.jpeg';
	import { reveal } from '$lib/actions/reveal';
	import { fade } from 'svelte/transition';

	let isAboutExpanded = $state(false);

	function toggleAbout() {
		isAboutExpanded = !isAboutExpanded;
	}
</script>

<section class="section about-immersive">
	<div class="container grid-layout">
		<div class="image-col" use:reveal>
			<div class="image-wrapper">
				<img src={aboutImg} alt="Felipe Cunha" />
			</div>
		</div>
		<div class="text-col">
			<div class="quote-wrapper" use:reveal>
				<h2 class="impact-quote">
					“Somos chamados a nos concentrar no rosto de <span class="highlight">Jesus</span> e encontrá-Lo
					no rosto daquele que está à nossa frente.”
				</h2>
			</div>
			<div class="prose" use:reveal>
				<p class="lead">
					Felipe Cunha é missionário há uma década. Natural de Santa Catarina, é casado com
					Tamyres Stuart e pai de Noah e Esther.
				</p>
				<p>
					Ao longo dos últimos anos, tem servido no Nordeste brasileiro entre povos não alcançados,
					como sertanejos, quilombolas, ciganos e outras comunidades em situação de vulnerabilidade
					social e espiritual.
				</p>
				<p>
					Seu chamado está diretamente ligado ao avanço do Evangelho em regiões de difícil acesso e
					ao cuidado integral de pessoas esquecidas.
				</p>

				{#if isAboutExpanded}
					<div class="expanded-about" transition:fade>
						<p>
							Felipe atua como plantador de bases missionárias e igrejas, contribuindo para o
							fortalecimento da igreja local e a formação de líderes.
						</p>
						<p>Há 8 anos, serve no ministério Iris Global, juntamente com sua esposa e filhos.</p>
						<p>
							Atualmente, a família reside em Mossoró, no estado do Rio Grande do Norte, onde
							continuam comprometidos com a missão de amar, servir e anunciar o Evangelho.
						</p>
					</div>
				{/if}

				<button onclick={toggleAbout} class="read-more-btn">
					{isAboutExpanded ? 'Ler menos' : 'Leia mais'}
				</button>

				<div class="contact-wrapper">
					<span class="contact-label">Contato</span>
					<a href="mailto:felipejcunhaa@gmail.com" class="contact-link">felipejcunhaa@gmail.com</a>
				</div>

				<div class="signature">Felipe Cunha</div>
			</div>
		</div>
	</div>
</section>

<style>
	.section {
		padding: var(--spacing-xl) 0;
	}

	.about-immersive {
		background-color: var(--color-bg-light);
	}

	.grid-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-lg);
		align-items: center;
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
		margin-bottom: 1.5rem;
	}

	.contact-wrapper {
		margin-top: 1rem;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.contact-label {
		font-family: var(--font-secondary);
		text-transform: uppercase;
		font-size: 0.85rem;
		letter-spacing: 0.1em;
		color: var(--color-text-light);
		font-weight: 600;
	}

	.contact-link {
		font-size: 1.1rem;
		color: var(--color-primary);
		text-decoration: none;
		font-weight: 500;
		border-bottom: 1px solid var(--color-primary-light);
		transition: all 0.3s ease;
		width: fit-content;
		padding-bottom: 2px;
	}

	.contact-link:hover {
		color: var(--color-secondary);
		border-color: var(--color-secondary);
	}

	.signature {
		font-family: var(--font-accent);
		font-size: 2rem;
		color: var(--color-text-main);
		margin-top: 2rem;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.grid-layout {
			grid-template-columns: 1fr;
			text-align: center;
		}

		.image-col {
			margin-bottom: 2rem;
		}
	}
</style>
