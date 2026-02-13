<script lang="ts">
	import VerticalFeed from '$lib/components/VerticalFeed.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import type { FeedPost } from '$lib/data/feed';

	let items: FeedPost[] = [];

	onMount(async () => {
		const { data } = await supabase
			.from('posts')
			.select('*')
			.eq('type', 'conselho')
			.order('created_at', { ascending: false });
		if (data) {
			items = data.map((post: any) => ({
				id: post.id,
				title: post.title || '',
				content: post.description || '',
				images: post.images || [post.image_url],
				date: post.created_at,
				likes: post.likes,
				shares: 0
			}));
		}
	});
</script>

<svelte:head>
	<title>Conselhos de Pai | Felipe Cunha</title>
	<meta
		name="description"
		content="Sabedoria prática e conselhos de vida inspirados na vivência do campo."
	/>
</svelte:head>

<VerticalFeed {items} title="Conselhos do Campo" />
