<script lang="ts">
	import reflexoesImg from '$lib/assets/pastora.jpeg';
	import conselhosImg from '$lib/assets/felipe_pregando.jpg';
	import { reveal } from '$lib/actions/reveal';
</script>

<section class="section gallery-section" use:reveal>
	<div class="container">
		<h2 class="section-title center">Explore o Ministério</h2>
		<p class="section-subtitle center">Mergulhe em nossas histórias e aprendizados diários</p>
	</div>

	<div class="cards-container">
		<a href="/reflexoes" class="card">
			<div class="card-bg" style="background-image: url('{reflexoesImg}')"></div>
			<div class="card-content">
				<h3>Reflexões</h3>
				<p>Espiritualidade e vida no campo</p>
				<span class="btn-text">Ler mais &rarr;</span>
			</div>
		</a>

		<a href="/conselhos" class="card">
			<div class="card-bg" style="background-image: url('{conselhosImg}')"></div>
			<div class="card-content">
				<h3>Conselhos</h3>
				<p>Sabedoria para o dia a dia</p>
				<span class="btn-text">Ver conselhos &rarr;</span>
			</div>
		</a>
	</div>
</section>

<style>
	.section {
		padding: var(--spacing-xl) 0;
	}

	.gallery-section {
		padding: 4rem 1.5rem;
	}

	.center {
		text-align: center;
	}

	.gallery-section .section-title {
		margin-bottom: 0.5rem;
		font-size: var(--text-3xl);
		color: var(--color-primary);
	}

	.section-subtitle {
		font-family: 'Montserrat', sans-serif;
		color: #666;
		margin-bottom: 3rem;
		font-size: 1.1rem;
	}

	.cards-container {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	@media (min-width: 768px) {
		.cards-container {
			grid-template-columns: 1fr 1fr;
		}
	}

	.card {
		position: relative;
		height: 60vh; /* Large touch targets */
		min-height: 400px;
		border-radius: 20px;
		overflow: hidden;
		text-decoration: none;
		color: white;
		display: flex;
		align-items: flex-end;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
	}

	.card-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		transition: transform 0.6s ease;
		z-index: 1;
	}

	.card:hover .card-bg {
		transform: scale(1.05);
	}

	/* Overlay */
	.card::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.8) 0%,
			rgba(0, 0, 0, 0.2) 50%,
			rgba(0, 0, 0, 0) 100%
		);
		z-index: 2;
		transition: opacity 0.3s;
	}

	.card:hover::after {
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.9) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0) 100%
		);
	}

	.card-content {
		position: relative;
		z-index: 3;
		padding: 2.5rem;
		width: 100%;
	}

	.card h3 {
		font-family: 'Merriweather', serif;
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}

	.card p {
		font-family: 'Montserrat', sans-serif;
		font-size: 1.1rem;
		opacity: 0.9;
		margin: 0 0 1.5rem 0;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}

	.btn-text {
		font-family: 'Montserrat', sans-serif;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-size: 0.9rem;
		border-bottom: 2px solid rgba(255, 255, 255, 0.5);
		padding-bottom: 0.2rem;
		transition: border-color 0.3s;
	}

	.card:hover .btn-text {
		border-color: white;
	}
</style>
