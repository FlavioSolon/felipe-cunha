<script lang="ts">
	import heroBg from '$lib/assets/familia_missionaria.jpeg';
	import ogImage from '$lib/assets/casal.jpg'; /* Using casal photo for better social centering */

	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import BookSpotlight from '$lib/components/BookSpotlight.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import FloatingSocials from '$lib/components/FloatingSocials.svelte';
	import { reveal } from '$lib/actions/reveal';

	let scrollY = $state(0);
	let innerHeight = $state(0);
</script>

<svelte:window bind:scrollY bind:innerHeight />

<svelte:head>
	<title>Felipe Cunha | O Evangelho nasce na poeira</title>
	<meta
		name="description"
		content="Missionário no sertão nordestino, servindo famílias e comunidades. 'Somos chamados a nos concentrar no rosto de Jesus'."
	/>
	<meta
		name="keywords"
		content="Felipe Cunha, Missionário, Sertão, Evangelho, Missões, Nordeste, Iris Global, Cartas do Campo"
	/>
	<meta name="author" content="Felipe Cunha" />
	<meta property="og:title" content="Felipe Cunha | Missões no Sertão" />
	<meta
		property="og:description"
		content="Nossa missão é fazer com que Ele se torne a Pessoa mais amada entre os Povos."
	/>
	<meta property="og:image" content={ogImage} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:title" content="Felipe Cunha | Missões no Sertão" />
	<meta
		name="twitter:description"
		content="Nossa missão é fazer com que Ele se torne a Pessoa mais amada entre os Povos."
	/>
</svelte:head>

<main>
	<FloatingSocials />
	<Hero {scrollY} />

	<About />

	<div class="subtle-separator" use:reveal></div>

	<Gallery />

	<Divider />

	<BookSpotlight />

	<Footer />
</main>

<style>
	.subtle-separator {
		width: 60%;
		height: 1px;
		background-color: var(--color-primary-light);
		opacity: 0.3;
		margin: 2rem auto;
	}
</style>
