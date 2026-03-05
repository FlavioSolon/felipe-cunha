<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { toastStore } from '$lib/stores/toastStore';
	import type { FeedPost } from '$lib/data/feed';

	export let isOpen = false;
	export let post: FeedPost | null = null;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) close();
	}

	function getShareUrl() {
		if (!post) return '';
		const currentUrl = window.location.href.split('#')[0];
		return `${currentUrl}#post-${post.id}`;
	}

	function buildRichText() {
		if (!post) return '';
		const url = getShareUrl();
		const preview = post.content.substring(0, 150).replace(/\n/g, ' ') + '...';
		return `*${post.title}*\n\n${preview}\n\n👉 Leia na íntegra: ${url}`;
	}

	async function copyLink() {
		if (!post) return;
		try {
			await navigator.clipboard.writeText(buildRichText());
			toastStore.success('Link e texto copiados com sucesso!');
		} catch (err) {
			console.error('Falha ao copiar:', err);
			// Fallback in case clipboard API requires secure context and we don't have it
			const textArea = document.createElement('textarea');
			textArea.value = buildRichText();
			document.body.appendChild(textArea);
			textArea.select();
			try {
				document.execCommand('copy');
				toastStore.success('Link e texto copiados com sucesso!');
			} catch (fallbackErr) {
				console.error('Fallback falhou:', fallbackErr);
			}
			document.body.removeChild(textArea);
		}
		close();
	}

	function shareFacebook() {
		const url = encodeURIComponent(getShareUrl());
		window.open(
			`https://www.facebook.com/sharer/sharer.php?u=${url}`,
			'_blank',
			'width=600,height=400'
		);
		close();
	}

	function shareMessenger() {
		const url = encodeURIComponent(getShareUrl());
		window.open(`fb-messenger://share/?link=${url}`, '_blank');
		close();
	}

	function shareWhatsApp() {
		const text = encodeURIComponent(buildRichText());
		window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
		close();
	}

	function shareEmail() {
		const url = getShareUrl();
		const subject = encodeURIComponent(`Confira: ${post?.title}`);
		const body = encodeURIComponent(`Leia este post interessante:\n\n${post?.title}\n\n${url}`);
		window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
		close();
	}

	function shareThreads() {
		const url = encodeURIComponent(getShareUrl());
		const text = encodeURIComponent(`${post?.title} `);
		window.open(
			`https://threads.net/intent/post?text=${text}&url=${url}`,
			'_blank',
			'width=600,height=400'
		);
		close();
	}

	function shareX() {
		const url = encodeURIComponent(getShareUrl());
		const text = encodeURIComponent(post?.title || '');
		window.open(
			`https://twitter.com/intent/tweet?text=${text}&url=${url}`,
			'_blank',
			'width=600,height=400'
		);
		close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div
		class="backdrop"
		transition:fade={{ duration: 200 }}
		on:click|self={close}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Enter' && close()}
	>
		<div
			class="modal-wrapper"
			transition:scale={{ start: 0.95, duration: 200 }}
			role="dialog"
			aria-modal="true"
		>
			<div class="modal-content">
				<div class="share-options">
					<button class="share-btn" on:click={copyLink}>
						<div class="icon-circle bg-gray">
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
									d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
								/>
							</svg>
						</div>
						<span>Copiar link</span>
					</button>

					<button class="share-btn" on:click={shareFacebook}>
						<div class="icon-circle bg-fb">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"
								/>
							</svg>
						</div>
						<span>Facebook</span>
					</button>

					<button class="share-btn" on:click={shareMessenger}>
						<div class="icon-circle bg-messenger">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 2C6.477 2 2 6.145 2 11.258c0 2.898 1.488 5.615 4.09 7.39v3.352l3.702-2.043c1.32.368 2.73.568 4.208.568 5.523 0 10-4.145 10-9.267C24 6.145 19.523 2 12 2zm1.096 12.593l-2.825-3.033-5.513 3.033 6.096-6.494 2.896 3.033 5.378-3.033-6.032 6.494z"
								/>
							</svg>
						</div>
						<span>Messenger</span>
					</button>

					<button class="share-btn" on:click={shareWhatsApp}>
						<div class="icon-circle bg-wa">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
								/>
							</svg>
						</div>
						<span>WhatsApp</span>
					</button>

					<button class="share-btn" on:click={shareEmail}>
						<div class="icon-circle bg-gray">
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
									d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.909A2.25 2.25 0 012.25 6.993V6.75"
								/>
							</svg>
						</div>
						<span>Email</span>
					</button>

					<button class="share-btn" on:click={shareThreads}>
						<div class="icon-circle bg-threads">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<!-- Basic threads-like spiral placeholder for threads -->
								<path
									d="M14.4 11.96c0-1.28-.96-2.28-2.28-2.28-1.32 0-2.28 1-2.28 2.28s.96 2.28 2.28 2.28c1.32 0 2.28-1 2.28-2.28zm-3.8 2.28c0 1.2.6 1.84 1.52 1.84s1.52-.64 1.52-1.84c0-1.2-.6-1.84-1.52-1.84s-1.52.64-1.52 1.84z"
								/>
								<path
									fill-rule="evenodd"
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.4 0 4.64-.84 6.4-2.28l-1.32-1.52C15.68 19.32 13.92 20.04 12 20.04c-4.44 0-8.04-3.6-8.04-8.04 0-4.44 3.6-8.04 8.04-8.04 4.44 0 8.04 3.6 8.04 8.04v1.52c0 .84-.68 1.52-1.52 1.52s-1.52-.68-1.52-1.52V12c0-2.08-1.44-3.68-3.48-3.8-2.12-.12-3.88 1.4-4 3.52-.12 2.12 1.4 3.88 3.52 4 1.32.08 2.48-.52 3.08-1.4.36.96 1.28 1.64 2.36 1.64 1.64 0 2.96-1.32 2.96-2.96V12c0-5.48-4.48-9.96-9.96-9.96L12 2z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<span>Threads</span>
					</button>

					<button class="share-btn" on:click={shareX}>
						<div class="icon-circle bg-gray">
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
								/>
							</svg>
						</div>
						<span>X</span>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		z-index: 9998;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(2px);
	}

	.modal-wrapper {
		background: #1a1a1a;
		border-radius: 20px;
		padding: 1.5rem;
		width: 90%;
		max-width: 600px; /* Big enough to fit horizontally on desktop */
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		z-index: 9999;
	}

	.modal-content {
		width: 100%;
		overflow-x: auto;
		/* Hide scrollbar for a cleaner look */
		scrollbar-width: none;
	}
	.modal-content::-webkit-scrollbar {
		display: none;
	}

	.share-options {
		display: flex;
		gap: 1.2rem;
		padding: 0.5rem 0;
	}

	.share-btn {
		background: none;
		border: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #e0e0e0;
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		cursor: pointer;
		min-width: 70px;
		transition: transform 0.2s;
	}

	.share-btn:hover {
		transform: scale(1.05);
	}

	.icon-circle {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 0.6rem;
		color: white;
	}

	.icon-circle svg {
		width: 28px;
		height: 28px;
	}

	/* Colors matching the reference image approx */
	.bg-gray {
		background-color: #333333;
	}
	.bg-fb {
		background-color: #1877f2;
	}
	.bg-messenger {
		background: linear-gradient(45deg, #00b2ff, #006aff);
	}
	.bg-wa {
		background-color: #25d366;
	}
	.bg-threads {
		background-color: #000000;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}
</style>
