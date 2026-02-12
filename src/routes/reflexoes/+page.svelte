<script lang="ts">
	import VerticalFeed from '$lib/components/VerticalFeed.svelte';
	import { reflexoes } from '$lib/data/feed';
</script>

<svelte:head>
	<title>Reflexões do Campo | Felipe Cunha</title>
	<meta
		name="description"
		content="Reflexões espirituais nascidas na simplicidade do sertão nordestino."
	/>
</svelte:head>

<VerticalFeed items={reflexoes} title="Reflexões" />
