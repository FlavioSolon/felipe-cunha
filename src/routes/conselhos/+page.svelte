<script lang="ts">
	import VerticalFeed from '$lib/components/VerticalFeed.svelte';
	import { conselhos } from '$lib/data/feed';
</script>

<svelte:head>
	<title>Conselhos de Pai | Felipe Cunha</title>
	<meta
		name="description"
		content="Sabedoria prática e conselhos de vida inspirados na vivência do campo."
	/>
</svelte:head>

<VerticalFeed items={conselhos} title="Conselhos" />
