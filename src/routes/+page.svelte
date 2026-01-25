<script lang="ts">
	import heroBg from '$lib/assets/familia_missionaria.jpeg';

	import Hero from '$lib/components/Hero.svelte';
	import About from '$lib/components/About.svelte';
	import BookSpotlight from '$lib/components/BookSpotlight.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import Footer from '$lib/components/Footer.svelte';

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
	<Gallery />
	<BookSpotlight />
	<Footer />
</main>
