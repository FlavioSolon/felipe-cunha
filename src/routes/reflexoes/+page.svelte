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
			.eq('type', 'reflexao')
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
	<title>Reflexões do Campo | Felipe Cunha</title>
	<meta
		name="description"
		content="Reflexões espirituais nascidas na simplicidade do sertão nordestino."
	/>
</svelte:head>

<VerticalFeed {items} title="Reflexões do Campo" />
