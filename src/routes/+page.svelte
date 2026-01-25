<script lang="ts">
	import heroBg from '$lib/assets/familia_missionaria.jpeg';

	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import BookSpotlight from '$lib/components/BookSpotlight.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Divider from '$lib/components/Divider.svelte';
	import { reveal } from '$lib/actions/reveal';

	let scrollY = $state(0);
	let innerHeight = $state(0);
</script>

<svelte:window bind:scrollY bind:innerHeight />

<svelte:head>
	<title>Felipe Cunha</title>
	<meta property="og:title" content="Felipe Cunha" />
	<meta
		property="og:description"
		content="Nossa missão é fazer com que Ele se torne a Pessoa mais amada entre os Povos."
	/>
	<meta property="og:image" content={heroBg} />
	<meta property="og:type" content="website" />
</svelte:head>

<main>
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
