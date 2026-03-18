<script lang="ts">
	import type { PageData } from './$types';
	import type { CartaCampo } from '$lib/data/cartasCampo';
	import ImageBlock from '$lib/components/ImageBlock.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';

	export let data: PageData;

	let allCartas: CartaCampo[] = data.cartas;
	let isMobile = false;

	// Year filter
	let selectedYear: string | null = null;
	$: availableYears = Array.from(
		new Set(allCartas.map((c) => new Date(c.date_sent).getFullYear().toString()))
	).sort((a, b) => Number(b) - Number(a));

	$: cartas = selectedYear
		? allCartas.filter((c) => new Date(c.date_sent).getFullYear().toString() === selectedYear)
		: allCartas;

	let selectedCartaId: string | null = null;

	// Check screen width
	$: if (typeof window !== 'undefined') {
		isMobile = window.innerWidth < 900;
	}

	function selectCarta(carta: CartaCampo) {
		if (isMobile) {
			goto(`/cartas/${carta.id}`);
		} else {
			selectedCartaId = carta.id;
			const el = document.getElementById(`carta-preview-${carta.id}`);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}
	}

	function stripHtml(html: string) {
		if (typeof window === 'undefined') {
			return html.replace(/<[^>]*>?/gm, '');
		}
		const tmp = document.createElement('DIV');
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || '';
	}
	function formatDate(d: string) {
		return new Date(d).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatPostmark(d: string) {
		const dt = new Date(d);
		const day = String(dt.getDate()).padStart(2, '0');
		const month = String(dt.getMonth() + 1).padStart(2, '0');
		const year = dt.getFullYear();
		return `${day} / ${month} / ${year}`;
	}

	const rotations = [-1.5, 1.2, -0.8, 1.8, -1.2, 0.5];
</script>

<svelte:head>
	<title>Cartas do Campo | Felipe Cunha</title>
	<meta
		name="description"
		content="Relatos do campo missionário escritos por Felipe Cunha do sertão nordestino."
	/>
</svelte:head>

<svelte:window on:resize={() => (isMobile = window.innerWidth < 900)} />

<div class="page-wrapper">
	<AppNav />
	<header class="cartas-header">
		<div class="header-center">
			<span class="header-eyebrow">Família Cunha · Do sertão</span>
			<h1 class="header-title">Cartas do Campo</h1>
		</div>
	</header>

	{#if cartas.length === 0}
		<div class="empty-state" in:fade>
			<p class="empty-icon">📬</p>
			<p>Nenhuma carta publicada ainda.</p>
			<p class="empty-sub">Volte em breve!</p>
		</div>
	{:else}
		<div class="layout">
			<!-- Left: Filing Cabinet (desktop) / Card Stack (mobile) -->
			<aside class="filing-panel">
				<!-- Year Filter -->
				<div class="year-filter-wrapper">
					<p class="panel-hint">Filtrar por ano</p>
					<div class="year-pills">
						<button
							class="year-pill"
							class:active={selectedYear === null}
							on:click={() => (selectedYear = null)}
						>
							Todas
						</button>
						{#each availableYears as year}
							<button
								class="year-pill"
								class:active={selectedYear === year}
								on:click={() => (selectedYear = year)}
							>
								{year}
							</button>
						{/each}
					</div>
				</div>

				<div class="carta-list">
					{#each cartas as carta, i (carta.id)}
						<button
							class="carta-envelope"
							class:active={selectedCartaId === carta.id}
							on:click={() => selectCarta(carta)}
							style="--rot: {rotations[i % rotations.length]}deg"
							transition:fly={{ y: 30, delay: i * 50 }}
						>
							<div class="stamp-area">
								<div class="postmark">
									<span class="postmark-date">{formatPostmark(carta.date_sent)}</span>
									{#if carta.location}
										<span class="postmark-loc">{carta.location}</span>
									{/if}
								</div>
								<div class="stamp-box"></div>
							</div>
							<div class="envelope-body">
								<h3 class="envelope-title">{carta.title}</h3>
								<p class="envelope-excerpt">{carta.excerpt?.substring(0, 100)}…</p>
								{#if carta.images?.[0]}
									<div class="envelope-thumb-wrap">
										<img
											src={carta.images[0]}
											alt={carta.title}
											class="envelope-thumb"
											loading="lazy"
										/>
										<div class="clip"></div>
									</div>
								{/if}
							</div>
							<span class="unfold-hint">
								{isMobile ? 'Abrir relato →' : 'Ler carta →'}
							</span>
						</button>
					{/each}
				</div>
			</aside>

			<!-- Right: Reading panel (desktop only) - Scrolling Feed -->
			<main class="reading-panel">
				<div class="feed-container">
					{#each cartas as carta (carta.id)}
						<article id={`carta-preview-${carta.id}`} class="letter-sheet">
							<div class="letter-postmark">
								<span class="postmark-badge">{formatPostmark(carta.date_sent)}</span>
								{#if carta.location}
									<span class="postmark-place">✈ {carta.location}</span>
								{/if}
							</div>
							<h2 class="letter-title">{carta.title}</h2>
							<div class="separator"></div>

							<div class="letter-body">
								<!-- Show first 2 text blocks, stripped of HTML, NO IMAGES -->
								{#each (carta.content_blocks ?? [])
									.filter((b) => b.type === 'text')
									.slice(0, 2) as block (block.value)}
									<p class="letter-para">{stripHtml(block.value)}</p>
								{/each}
								{#if !carta.content_blocks?.length && carta.excerpt}
									<p class="letter-para">{carta.excerpt}</p>
								{/if}
								<div class="read-more-fade"></div>
							</div>

							<footer class="letter-footer">
								<a href={`/cartas/${carta.id}`} class="read-full-link"> Ler carta completa → </a>
							</footer>
						</article>
					{/each}
				</div>
			</main>
		</div>
	{/if}
</div>

<style>
	/* ---------- Page Shell ---------- */
	.page-wrapper {
		min-height: 100vh;
		background: #f5f0e8;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c4a87a' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
		font-family: 'Inter', sans-serif;
	}

	/* ---------- Header ---------- */
	.cartas-header {
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(139, 90, 43, 0.9);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		padding: 0.9rem 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
	}

	.header-center {
		display: flex;
		flex-direction: column;
	}
	.header-eyebrow {
		color: rgba(255, 255, 255, 0.6);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 2px;
	}
	.header-title {
		font-family: 'Merriweather', serif;
		color: #fff;
		font-size: 1.3rem;
		margin: 0;
		font-weight: 700;
	}

	/* ---------- Layout ---------- */
	.layout {
		display: grid;
		grid-template-columns: 340px 1fr;
		min-height: calc(100vh - 60px);
	}

	/* On desktop, push all content right of the fixed AppNav sidebar (≈80px) */
	@media (min-width: 850px) {
		.page-wrapper {
			padding-left: 80px;
		}
	}

	/* ---------- Left panel: envelope list ---------- */
	.filing-panel {
		background: rgba(220, 210, 190, 0.4);
		border-right: 1px solid rgba(139, 90, 43, 0.15);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		height: calc(100vh - 76px);
		position: sticky;
		top: 76px;
	}

	.year-filter-wrapper {
		margin-bottom: 2rem;
	}

	.panel-hint {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(139, 90, 43, 0.7);
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgba(139, 90, 43, 0.15);
	}

	.year-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.year-pill {
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(139, 90, 43, 0.2);
		color: #6b4c3a;
		padding: 0.4rem 0.8rem;
		border-radius: 20px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.year-pill:hover {
		background: rgba(255, 255, 255, 0.9);
		border-color: rgba(139, 90, 43, 0.4);
	}

	.year-pill.active {
		background: #8b5a2b;
		color: white;
		border-color: #8b5a2b;
	}

	.carta-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-right: 0.5rem;
		padding-bottom: 2rem;
		scrollbar-width: thin;
		scrollbar-color: rgba(139, 90, 43, 0.35) transparent;
	}
	.carta-list::-webkit-scrollbar {
		width: 5px;
	}
	.carta-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.carta-list::-webkit-scrollbar-thumb {
		background: rgba(139, 90, 43, 0.35);
		border-radius: 10px;
	}
	.carta-list::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 90, 43, 0.6);
	}

	.carta-envelope {
		background: #fdf8f0;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		text-align: left;
		transition: all 0.25s ease;
		width: 100%;
		position: relative;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
	}

	.carta-envelope:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(139, 90, 43, 0.15);
		border-color: rgba(139, 90, 43, 0.5);
	}

	.carta-envelope.active {
		background: #fff;
		border-color: #8b5a2b;
		box-shadow: 0 4px 20px rgba(139, 90, 43, 0.2);
	}

	/* Stamp / Postmark area */
	.stamp-area {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.75rem;
	}

	.postmark {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.postmark-date {
		font-size: 0.7rem;
		font-weight: 700;
		color: #5d3c1e;
		font-family: 'Inter', monospace;
		letter-spacing: 1px;
		text-transform: uppercase;
	}

	.postmark-loc {
		font-size: 0.65rem;
		color: #8b6d4d;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stamp-box {
		width: 36px;
		height: 36px;
		border: 2px dashed rgba(139, 90, 43, 0.3);
		border-radius: 2px;
		flex-shrink: 0;
	}

	.envelope-body {
		position: relative;
	}

	.envelope-title {
		font-family: 'Merriweather', serif;
		font-size: 0.95rem;
		color: #3b2c1e;
		font-weight: 700;
		margin: 0 0 0.4rem;
		line-height: 1.35;
	}

	.envelope-excerpt {
		font-size: 0.78rem;
		color: #6b5040;
		line-height: 1.5;
		margin: 0 0 0.6rem;
	}

	.envelope-thumb-wrap {
		position: relative;
		display: inline-block;
		margin-top: 0.3rem;
	}

	.envelope-thumb {
		width: 80px;
		height: 60px;
		object-fit: cover;
		border: 2px solid #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: block;
	}

	/* Paper clip */
	.clip {
		position: absolute;
		top: -14px;
		left: 8px;
		width: 20px;
		height: 28px;
		border: 3px solid #888;
		border-radius: 10px 10px 0 0;
		border-bottom: none;
		pointer-events: none;
	}

	.unfold-hint {
		display: block;
		margin-top: 0.6rem;
		font-size: 0.72rem;
		color: #8b5a2b;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	/* ---------- Right: Reading Panel ---------- */
	.reading-panel {
		background: #fdfaf5;
		position: relative;
	}

	.feed-container {
		display: flex;
		flex-direction: column;
		gap: 4rem;
		padding: 3rem 4rem;
		max-width: 900px;
		margin: 0 auto;
	}

	.letter-sheet {
		background: #fff;
		padding: 3rem 3.5rem;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.05),
			0 1px 3px rgba(0, 0, 0, 0.02);
		position: relative;
		border-radius: 4px;
	}
	/* Subtle paper folds */
	.letter-sheet::before,
	.letter-sheet::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 2px;
		left: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 0, 0, 0.03) 20%,
			transparent 50%,
			rgba(0, 0, 0, 0.01) 80%,
			transparent 100%
		);
	}
	.letter-sheet::before {
		top: 30%;
	}
	.letter-sheet::after {
		top: 60%;
	}

	.letter-postmark {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		font-family: 'Courier New', Courier, monospace;
		font-size: 0.9rem;
		color: #7b6a58;
		margin-bottom: 2rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	.postmark-badge {
		background: rgba(139, 90, 43, 0.1);
		color: #5d3c1e;
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 2px;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		border: 1px solid rgba(139, 90, 43, 0.2);
		font-family: monospace;
	}

	.postmark-place {
		font-size: 0.8rem;
		color: #8b6d4d;
		font-style: italic;
	}

	.letter-title {
		font-family: 'Merriweather', serif;
		font-size: 2rem;
		color: #2c1e0e;
		margin: 0 0 0.75rem;
		line-height: 1.3;
		font-weight: 900;
	}

	.separator {
		width: 60px;
		height: 3px;
		background: #8b5a2b;
		margin-bottom: 1.5rem;
	}

	.letter-body {
		position: relative;
	}

	.letter-para {
		font-family: 'Literata', 'Merriweather', serif;
		font-size: 1.15rem;
		line-height: 1.8;
		color: #333;
		margin-bottom: 1.5rem;
		text-indent: 1.5rem;
	}

	.read-more-fade {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 80px;
		background: linear-gradient(to bottom, transparent, #fff);
	}
	.letter-footer {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(139, 90, 43, 0.15);
		display: flex;
		justify-content: center;
		margin-top: 2rem;
		padding-top: 1rem;
	}

	.read-full-link {
		display: inline-block;
		font-family: 'Inter', sans-serif;
		font-size: 0.95rem;
		font-weight: 600;
		color: #8b5a2b;
		text-decoration: none;
		padding: 0.6rem 2rem;
		border: 1px solid rgba(139, 90, 43, 0.3);
		border-radius: 30px;
		transition: all 0.2s;
	}
	.read-full-link:hover {
		background: rgba(139, 90, 43, 0.05);
		border-color: #8b5a2b;
		transform: translateY(-2px);
	}

	/* ---------- Empty state ---------- */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		color: #8b6d4d;
		gap: 0.5rem;
	}
	.empty-icon {
		font-size: 4rem;
	}
	.empty-sub {
		opacity: 0.6;
		font-size: 0.9rem;
	}

	/* ---------- Mobile ---------- */
	@media (max-width: 899px) {
		.layout {
			grid-template-columns: 1fr;
		}

		.filing-panel {
			height: auto;
			position: static;
			padding-bottom: 80px; /* Space for AppNav bottom bar */
		}

		.reading-panel {
			display: none; /* On mobile, detail is a separate page */
		}

		.carta-envelope {
			margin-bottom: 1rem;
		}

		.page-wrapper {
			padding-bottom: 80px;
		}
	}
</style>
