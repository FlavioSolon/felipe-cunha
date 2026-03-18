<script lang="ts">
	import type { PageData } from './$types';
	import ImageBlock from '$lib/components/ImageBlock.svelte';
	import AppNav from '$lib/components/AppNav.svelte';
	import { fade } from 'svelte/transition';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import cactoOn from '$lib/assets/icones/cacto_chamas.ico';
	import cactoOff from '$lib/assets/icones/cacto.ico';

	export let data: PageData;

	let carta = data.carta;
	let liked = false;
	let likesCount = carta.likes ?? 0;

	const storageKey = `carta_liked_${carta.id}`;

	onMount(() => {
		try {
			liked = localStorage.getItem(storageKey) === 'true';
		} catch (_) {}
	});

	async function toggleLike() {
		liked = !liked;
		likesCount = liked ? likesCount + 1 : Math.max(0, likesCount - 1);
		try {
			if (liked) localStorage.setItem(storageKey, 'true');
			else localStorage.removeItem(storageKey);
		} catch (_) {}
		await supabase.from('carta_campo').update({ likes: likesCount }).eq('id', carta.id);
	}

	function formatPostmark(d: string) {
		const dt = new Date(d);
		const day = String(dt.getDate()).padStart(2, '0');
		const month = String(dt.getMonth() + 1).padStart(2, '0');
		const year = dt.getFullYear();
		return `${day} / ${month} / ${year}`;
	}
</script>

<svelte:head>
	<title>{carta.title} | Cartas do Campo – Felipe Cunha</title>
	<meta name="description" content={carta.excerpt} />
	<meta property="og:title" content={carta.title} />
	<meta property="og:description" content={carta.excerpt} />
	{#if carta.images?.[0]}
		<meta property="og:image" content={carta.images[0]} />
	{/if}
</svelte:head>

<div class="letter-page" in:fade={{ duration: 200 }}>
	<AppNav />
	<!-- Back navigation -->
	<nav class="top-nav">
		<a href="/cartas" class="nav-back">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
				/>
			</svg>
			Cartas do Campo
		</a>
	</nav>

	<!-- Parchment background -->
	<div class="parchment">
		<!-- Big stamp postmark -->
		<header class="letter-header">
			<div class="big-stamp">
				<div class="stamp-inner">
					<span class="stamp-label">ENVIADA</span>
					<span class="stamp-date">{formatPostmark(carta.date_sent)}</span>
					{#if carta.location}
						<span class="stamp-location">{carta.location}</span>
					{/if}
				</div>
			</div>
			<div class="header-text">
				<h1 class="carta-title">{carta.title}</h1>
				<p class="carta-excerpt">{carta.excerpt}</p>
			</div>
		</header>

		<div class="divider-lines">
			<div class="div-line thick"></div>
			<div class="div-line thin"></div>
		</div>

		<!-- Letter body: intercalated text + images -->
		<article class="letter-body">
			{#each carta.content_blocks ?? [] as block, i}
				{#if block.type === 'text'}
					<p class="letter-para" in:fade={{ delay: i * 50, duration: 300 }}>{@html block.value}</p>
				{:else if block.type === 'image'}
					<ImageBlock
						src={block.value}
						caption={block.caption ?? ''}
						layout={block.layout ?? 'full'}
						rotation={i % 2 === 0 ? -2 : 2}
					/>
				{/if}
			{/each}

			<!-- Fallback if no content blocks yet: show all images at the end -->
			{#if !carta.content_blocks?.length}
				{#each carta.images ?? [] as imgUrl}
					<ImageBlock src={imgUrl} layout="full" />
				{/each}
			{/if}
		</article>

		<!-- Footer: signature + Like -->
		<footer class="carta-footer">
			<div class="clearfix">
				<p class="letter-closing">
					Com amor do campo,<br />
					<span class="signature">Felipe Cunha</span>
				</p>
			</div>

			<div class="engagement">
				<button class="like-btn" class:liked on:click={toggleLike} aria-label="Curtir">
					<img
						src={liked ? cactoOn : cactoOff}
						alt="Cacto like"
						class="icon-cactus"
						class:animate-pop={liked}
					/>
					<span>{likesCount}</span>
				</button>

				<a href="/cartas" class="all-cartas-link">Ver outras cartas →</a>
			</div>
		</footer>
	</div>
</div>

<style>
	/* ---------- Page shell ---------- */
	.letter-page {
		min-height: 100vh;
		background: #2c1e0e;
		background-image:
			radial-gradient(ellipse at top left, rgba(100, 60, 20, 0.4) 0%, transparent 60%),
			radial-gradient(ellipse at bottom right, rgba(80, 50, 15, 0.3) 0%, transparent 60%);
		padding-bottom: 4rem;
	}

	/* ---------- Top nav ---------- */
	.top-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		position: sticky;
		top: 0;
		z-index: 100;
		background: rgba(44, 30, 14, 0.85);
		backdrop-filter: blur(12px);
	}

	.nav-back {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.75);
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: color 0.2s;
	}
	.nav-back svg {
		width: 18px;
		height: 18px;
	}
	.nav-back:hover {
		color: #fff;
	}

	/* ---------- Parchment ---------- */
	.parchment {
		max-width: 860px;
		margin: 2.5rem auto;
		background: #fdf8f0;
		background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeBlend in='SourceGraphic' mode='multiply'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
		border-radius: 4px 4px 2px 2px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		padding: 3.5rem;
		position: relative;
		/* Left margin rule, like lined paper */
		border-left: 4px solid rgba(200, 100, 80, 0.12);
	}

	/* Horizontal ruled lines subtle bg */
	.parchment::after {
		content: '';
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			transparent,
			transparent 31px,
			rgba(180, 150, 100, 0.06) 31px,
			rgba(180, 150, 100, 0.06) 32px
		);
		pointer-events: none;
		border-radius: inherit;
	}

	/* ---------- Header / Big Stamp ---------- */
	.letter-header {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		margin-bottom: 2rem;
		position: relative;
		z-index: 1;
	}

	.big-stamp {
		flex-shrink: 0;
		width: 100px;
		height: 100px;
		border: 3px solid rgba(139, 90, 43, 0.6);
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-6deg);
		background: rgba(255, 255, 255, 0.5);
		box-shadow: inset 0 0 0 4px rgba(139, 90, 43, 0.15);
	}

	.stamp-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 2px;
	}

	.stamp-label {
		font-size: 0.5rem;
		font-weight: 800;
		letter-spacing: 3px;
		color: rgba(139, 90, 43, 0.8);
		text-transform: uppercase;
	}

	.stamp-date {
		font-size: 0.65rem;
		font-weight: 700;
		color: #5d3c1e;
		font-family: monospace;
	}

	.stamp-location {
		font-size: 0.5rem;
		color: #8b6d4d;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.header-text {
		flex: 1;
		position: relative;
		z-index: 1;
	}

	.carta-title {
		font-family: 'Merriweather', serif;
		font-size: 2.2rem;
		color: #1e130a;
		font-weight: 900;
		line-height: 1.2;
		margin: 0 0 0.75rem;
	}

	.carta-excerpt {
		font-size: 1.05rem;
		color: #5d4631;
		font-style: italic;
		line-height: 1.7;
		margin: 0;
	}

	/* ---------- Divider ---------- */
	.divider-lines {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 2.5rem;
		position: relative;
		z-index: 1;
	}

	.div-line {
		height: 1px;
	}
	.div-line.thick {
		background: rgba(139, 90, 43, 0.5);
	}
	.div-line.thin {
		background: rgba(139, 90, 43, 0.2);
	}

	/* ---------- Letter body ---------- */
	.letter-body {
		overflow: hidden; /* clearfix */
		position: relative;
		z-index: 1;
	}

	.letter-para {
		font-family: 'Inter', sans-serif;
		font-size: 1.05rem;
		line-height: 1.9;
		color: #3b2c1e;
		text-align: justify;
		text-indent: 1.5em;
		margin: 0 0 1.2rem;
	}

	/* ---------- Footer ---------- */
	.carta-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(139, 90, 43, 0.2);
		position: relative;
		z-index: 1;
	}

	.clearfix::after {
		content: '';
		display: table;
		clear: both;
	}

	.letter-closing {
		font-size: 1rem;
		color: #6b5040;
		margin: 0 0 1.5rem;
		line-height: 1.7;
	}

	.signature {
		font-family: 'Pinyon Script', cursive;
		font-size: 2.2rem;
		color: #3b2c1e;
		display: block;
		margin-top: 0.3rem;
	}

	.engagement {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}

	/* ---------- Like Button ---------- */
	.like-btn {
		display: flex;
		align-items: center;
		gap: 0.2rem; /* Reduzi o gap porque a margem da imagem já vai dar um respiro */
		background: rgba(255, 255, 255, 0.15);
		border: 1px solid rgba(139, 90, 43, 0.3);
		padding: 0.4rem 1.5rem; /* Mantém o botão elegante */
		border-radius: 40px;
		color: #7b6a58;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.25s;
	}
	.like-btn:hover {
		background: rgba(255, 255, 255, 0.5);
		transform: translateY(-2px);
	}
	.like-btn.liked {
		color: #d97706;
		border-color: rgba(217, 119, 6, 0.5);
		background: rgba(255, 250, 240, 0.9);
	}

	.icon-cactus {
		width: 65px; /* Quase o tamanho original para o cacto aparecer bem */
		height: 65px;
		/* A MÁGICA AQUI: Margens negativas cortam o espaço transparente invisível 
           para cima/baixo (-15px) e para os lados (-8px), sem deformar o botão */
		margin: -15px -8px;
		object-fit: contain;
		transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	.animate-pop {
		animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	/* Ajuste na animação para respeitar a nova escala inicial (1.3) */
	@keyframes pop {
		0% {
			transform: scale(1.3);
		}
		50% {
			transform: scale(1.6);
		}
		100% {
			transform: scale(1.3);
		}
	}

	.all-cartas-link {
		font-size: 0.8rem;
		color: #8b5a2b;
		text-decoration: none;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: color 0.2s;
	}
	.all-cartas-link:hover {
		color: #3b2c1e;
	}

	/* ---------- Mobile ---------- */
	@media (max-width: 849px) {
		.parchment {
			margin: 0;
			border-radius: 0;
			padding: 2rem 1.25rem;
			box-shadow: none;
		}

		.letter-page {
			padding-bottom: 90px; /* Room for AppNav bottom bar */
		}

		.carta-title {
			font-size: 1.6rem;
		}

		.letter-header {
			flex-direction: column;
			gap: 1rem;
		}

		.big-stamp {
			width: 80px;
			height: 80px;
		}
	}
</style>
