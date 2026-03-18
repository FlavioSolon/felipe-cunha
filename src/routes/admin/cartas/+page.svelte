<script lang="ts">
	import { supabase, s3 } from '$lib/supabaseClient';
	import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
	import { fade, fly, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { resizeAndCropImage } from '$lib/imageResize';
	import type { ContentBlock } from '$lib/data/cartasCampo';
	import BlockEditor from '$lib/components/BlockEditor.svelte';
	import AdminNav from '$lib/components/AdminNav.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { toasts } from '$lib/stores/toastStore';

	// --- Auth ---
	let password = '';
	let authenticated = false;
	let loading = true;

	// --- View ---
	type View = 'list' | 'compose';
	let view: View = 'list';

	// --- Form state ---
	let editingId: string | null = null;
	let cartaTitle = '';
	let cartaLocation = '';
	let cartaDateSent = new Date().toISOString().split('T')[0];
	let cartaExcerpt = '';
	// Block-based content editor
	let blocks: ContentBlock[] = [{ type: 'text', value: '' }];
	// Available images from uploads (pass to BlockEditor for image library)
	let availableImages: string[] = [];

	let imageFiles: File[] = [];
	let imagePreviews: Array<{ id: number; url: string; file: File }> = [];
	let existingImages: string[] = [];
	let uploading = false;
	let uploadMessage = '';

	// --- list state ---
	let allCartas: any[] = [];
	let postToDelete: any = null;
	let showDeleteModal = false;
	let deleting = false;

	onMount(() => {
		const sessionAuth = sessionStorage.getItem('admin_auth');
		if (sessionAuth === 'true') {
			authenticated = true;
			fetchCartas();
		}
		loading = false;
	});

	async function login() {
		if (password === 'amadoJesus') {
			authenticated = true;
			sessionStorage.setItem('admin_auth', 'true');
			fetchCartas();
		} else {
			toasts.error('Senha incorreta!');
		}
	}

	function logout() {
		authenticated = false;
		sessionStorage.removeItem('admin_auth');
		password = '';
		allCartas = [];
	}

	async function fetchCartas() {
		const { data } = await supabase
			.from('carta_campo')
			.select('*')
			.order('date_sent', { ascending: false });
		if (data) allCartas = data;
	}

	function startCompose() {
		editingId = null;
		cartaTitle = '';
		cartaLocation = '';
		cartaDateSent = new Date().toISOString().split('T')[0];
		cartaExcerpt = '';
		blocks = [{ type: 'text', value: '' }];
		availableImages = [];
		imagePreviews = [];
		existingImages = [];
		view = 'compose';
	}

	function startEdit(carta: any) {
		editingId = carta.id;
		cartaTitle = carta.title || '';
		cartaLocation = carta.location || '';
		cartaDateSent = carta.date_sent || new Date().toISOString().split('T')[0];
		cartaExcerpt = carta.excerpt || '';
		// Load existing content_blocks directly into the editor
		blocks = (carta.content_blocks ?? []).length
			? carta.content_blocks
			: [{ type: 'text', value: '' }];
		existingImages = carta.images ?? [];
		availableImages = carta.images ?? [];
		imagePreviews = [];
		view = 'compose';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function convertToAvif(file: File): Promise<Blob> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				canvas.width = img.width;
				canvas.height = img.height;
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Canvas context not available'));
					return;
				}
				ctx.drawImage(img, 0, 0);
				canvas.toBlob(
					(blob) => {
						if (blob) resolve(blob);
						else reject(new Error('Conversion failed'));
					},
					'image/avif',
					0.88
				);
			};
			img.onerror = (e) => reject(e);
			img.src = URL.createObjectURL(file);
		});
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
			f.type.startsWith('image/')
		);
		addFiles(files);
	}

	function handleFileInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		addFiles(Array.from(target.files ?? []));
	}

	function addFiles(files: File[]) {
		const newPreviews = files.map((file, i) => ({
			id: Date.now() + i,
			url: URL.createObjectURL(file),
			file
		}));
		imagePreviews = [...imagePreviews, ...newPreviews];
		imageFiles = [...imageFiles, ...files];
	}

	function removeNewImage(id: number) {
		imagePreviews = imagePreviews.filter((p) => p.id !== id);
		imageFiles = imagePreviews.map((p) => p.file);
	}

	function removeExistingImage(url: string) {
		existingImages = existingImages.filter((u) => u !== url);
	}

	async function publishCarta() {
		if (!cartaTitle.trim()) {
			toasts.error('Adicione um título para a carta');
			return;
		}
		uploading = true;
		uploadMessage = '';

		try {
			// 1. Upload any new image files from imagePreviews that have blob: URLs
			const blobUrlToRemote: Record<string, string> = {};
			let uploadIdx = 0;
			const blobBlocks = blocks.filter((b) => b.type === 'image' && b.value.startsWith('blob:'));
			for (const blk of blobBlocks) {
				const preview = imagePreviews.find((p) => p.url === blk.value);
				if (!preview) continue;
				uploadMessage = `Enviando imagem ${++uploadIdx}/${blobBlocks.length}...`;
				let blob: Blob;
				try {
					const resized = await resizeAndCropImage(preview.file, 1200, 900);
					blob = await convertToAvif(
						new File([resized], preview.file.name, { type: 'image/jpeg' })
					);
				} catch {
					blob = await convertToAvif(preview.file);
				}
				const buf = await blob.arrayBuffer();
				const fileName = `carta_${Date.now()}_${uploadIdx}.avif`;
				await s3.send(
					new PutObjectCommand({
						Bucket: 'images',
						Key: fileName,
						Body: new Uint8Array(buf),
						ContentType: 'image/avif',
						ACL: 'public-read'
					})
				);
				const remoteUrl = `https://kyzotobotxygdpshpwpw.supabase.co/storage/v1/object/public/images/${fileName}`;
				blobUrlToRemote[blk.value] = remoteUrl;
			}

			// 2. Replace blob: URLs in blocks with remote URLs
			const finalBlocks: ContentBlock[] = blocks.map((b) => {
				if (b.type === 'image' && b.value.startsWith('blob:') && blobUrlToRemote[b.value]) {
					return { ...b, value: blobUrlToRemote[b.value] };
				}
				return b;
			});

			// 3. Collect all image URLs
			const allImages = finalBlocks.filter((b) => b.type === 'image').map((b) => b.value);

			uploadMessage = 'Salvando...';

			const payload = {
				title: cartaTitle.trim(),
				location: cartaLocation.trim() || null,
				date_sent: cartaDateSent,
				excerpt: cartaExcerpt.trim() || null,
				content_blocks: finalBlocks,
				images: allImages
			};

			if (editingId) {
				const { error } = await supabase.from('carta_campo').update(payload).eq('id', editingId);
				if (error) throw error;
				toasts.success('Carta atualizada!');
			} else {
				const { error } = await supabase.from('carta_campo').insert(payload);
				if (error) throw error;
				toasts.success('Carta publicada!');
			}

			fetchCartas();
			view = 'list';
		} catch (err: any) {
			toasts.error('Erro: ' + (err.message || 'Falha ao publicar'));
		} finally {
			uploading = false;
			uploadMessage = '';
		}
	}

	function confirmDelete(carta: any) {
		postToDelete = carta;
		showDeleteModal = true;
	}

	async function deleteCarta() {
		if (!postToDelete) return;
		deleting = true;
		for (const url of postToDelete.images ?? []) {
			try {
				const key = url.split('/').pop();
				if (key) await s3.send(new DeleteObjectCommand({ Bucket: 'images', Key: key }));
			} catch {
				/* silent */
			}
		}
		const { error } = await supabase.from('carta_campo').delete().eq('id', postToDelete.id);
		if (!error) {
			toasts.success('Carta excluída!');
			fetchCartas();
		} else {
			toasts.error('Erro ao excluir');
		}
		deleting = false;
		showDeleteModal = false;
		postToDelete = null;
	}

	function formatDate(d: string) {
		return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<div class="admin-cartas">
	{#if loading}
		<div class="loading-screen">
			<div class="spinner"></div>
		</div>
	{:else if !authenticated}
		<div class="login-wrap" in:fade>
			<div class="login-card">
				<div class="login-icon">✉️</div>
				<h1>Cartas do Campo</h1>
				<p>Admin</p>
				<input
					type="password"
					bind:value={password}
					placeholder="Senha de acesso"
					on:keydown={(e) => e.key === 'Enter' && login()}
				/>
				<button class="btn-primary-action" on:click={login}>Entrar</button>
			</div>
		</div>
	{:else}
		<AdminNav />
		<!-- Action bar -->
		<header class="top-bar">
			<div class="top-bar-inner">
				<div class="top-bar-left">
					<span class="top-bar-title">Cartas do Campo</span>
				</div>
				<div class="top-bar-right">
					{#if view === 'list'}
						<button class="btn-compose" on:click={startCompose}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2.5"
								stroke="currentColor"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							Nova Carta
						</button>
					{:else}
						<button class="btn-ghost" on:click={() => (view = 'list')}> ← Voltar à lista </button>
					{/if}
					<button class="btn-ghost" on:click={logout}>Sair</button>
				</div>
			</div>
		</header>

		<!-- COMPOSE VIEW -->
		{#if view === 'compose'}
			<main class="compose-view" in:fade={{ duration: 200 }}>
				<div class="compose-grid">
					<!-- Left: Form -->
					<section class="compose-form">
						<div class="form-card">
							<h2 class="form-heading">{editingId ? 'Editar Carta' : 'Nova Carta do Campo'}</h2>

							<!-- Meta fields -->
							<div class="field-group">
								<label for="carta-title" class="field-label"
									>Título da Carta <span class="req">*</span></label
								>
								<input
									id="carta-title"
									type="text"
									class="field-input big-input"
									bind:value={cartaTitle}
									placeholder="Ex: Primavera no Sertão"
								/>
							</div>

							<div class="field-row">
								<div class="field-group">
									<label for="carta-location" class="field-label">Local de Envio</label>
									<input
										id="carta-location"
										type="text"
										class="field-input"
										bind:value={cartaLocation}
										placeholder="Ex: Saída de Canindé"
									/>
								</div>
								<div class="field-group">
									<label for="carta-date" class="field-label">Data</label>
									<input
										id="carta-date"
										type="date"
										class="field-input"
										bind:value={cartaDateSent}
									/>
								</div>
							</div>

							<div class="field-group">
								<label for="carta-excerpt" class="field-label"
									>Resumo <span class="hint-label">(aparece no card da lista)</span></label
								>
								<textarea
									id="carta-excerpt"
									class="field-textarea small-ta"
									bind:value={cartaExcerpt}
									rows="2"
									placeholder="Um breve resumo que aparece no feed das cartas..."
								></textarea>
							</div>

							<!-- Block Editor (replaces textarea + drop-zone) -->
							<div class="field-group">
								<label class="field-label">
									Conteúdo da Carta
									<span class="hint-label"
										>— use "+ Foto" para inserir imagens entre parágrafos</span
									>
								</label>
								<BlockEditor
									bind:blocks
									{availableImages}
									on:change={(e) => {
										blocks = e.detail;
										// Sync new blob: URLs into imagePreviews for upload
										const existingBlobUrls = new Set(imagePreviews.map((p) => p.url));
										blocks.forEach((b) => {
											if (
												b.type === 'image' &&
												b.value.startsWith('blob:') &&
												!existingBlobUrls.has(b.value)
											) {
												// We need the File object — fetch it from the blob URL
												fetch(b.value)
													.then((r) => r.blob())
													.then((blob) => {
														const file = new File([blob], `photo_${Date.now()}.jpg`, {
															type: blob.type
														});
														imagePreviews = [
															...imagePreviews,
															{ id: Date.now(), url: b.value, file }
														];
													});
											}
										});
									}}
								/>
							</div>

							<!-- Submit -->
							<div class="form-actions">
								<button class="btn-ghost" on:click={() => (view = 'list')} disabled={uploading}>
									Cancelar
								</button>
								<button class="btn-primary-action" on:click={publishCarta} disabled={uploading}>
									{#if uploading}
										<span class="spinner-sm"></span>
										{uploadMessage || 'Publicando...'}
									{:else}
										{editingId ? '💾 Salvar Alterações' : '✉️ Publicar Carta'}
									{/if}
								</button>
							</div>
						</div>
					</section>

					<!-- Right: Live preview -->
					<aside class="compose-preview">
						<div class="preview-sticky">
							<div class="preview-label">Pré-visualização do Card</div>
							<div class="preview-card">
								<div class="preview-postmark">
									<span class="preview-date"
										>{cartaDateSent ? formatDate(cartaDateSent) : 'Data não definida'}</span
									>
									{#if cartaLocation}<span class="preview-loc">{cartaLocation}</span>{/if}
								</div>
								<div class="preview-stamp-box"></div>
								<h3 class="preview-title">{cartaTitle || 'Título da carta...'}</h3>
								<p class="preview-excerpt">
									{cartaExcerpt || 'Resumo aparece aqui...'}
								</p>
								{#if blocks.find((b) => b.type === 'image')}
									<div class="preview-thumb-wrap">
										<img
											src={blocks.find((b) => b.type === 'image')?.value ?? ''}
											alt="Preview"
											class="preview-thumb"
										/>
										<div class="preview-clip"></div>
									</div>
								{/if}
								<span class="preview-unfold">Ler relato →</span>
							</div>
							<p class="preview-photos-count">
								{blocks.filter((b) => b.type === 'image').length} foto(s) •
								{blocks.filter((b) => b.type === 'text').length} bloco(s) de texto
							</p>
						</div>
					</aside>
				</div>
			</main>

			<!-- LIST VIEW -->
		{:else}
			<main class="list-view" in:fade={{ duration: 200 }}>
				{#if allCartas.length === 0}
					<div class="empty-state">
						<div class="empty-icon">📬</div>
						<h3>Nenhuma carta publicada</h3>
						<p>Crie sua primeira carta do campo!</p>
						<button class="btn-primary-action" on:click={startCompose}>Nova Carta</button>
					</div>
				{:else}
					<div class="cartas-grid">
						{#each allCartas as carta (carta.id)}
							<article class="carta-row" transition:fly={{ y: 20 }}>
								<div class="carta-row-info-wrap">
									<div class="carta-row-thumb">
										{#if carta.images?.[0]}
											<img src={carta.images[0]} alt={carta.title} loading="lazy" />
										{:else}
											<div class="thumb-placeholder">✉</div>
										{/if}
									</div>
									<div class="carta-row-info">
										<div class="carta-row-meta">
											<span class="meta-date">{formatDate(carta.date_sent)}</span>
											{#if carta.location}
												<span class="meta-loc">📍 {carta.location}</span>
											{/if}
										</div>
										<h3 class="carta-row-title">{carta.title}</h3>
										{#if carta.excerpt}
											<p class="carta-row-excerpt">{carta.excerpt.substring(0, 100)}...</p>
										{/if}
										<div class="carta-row-stats">
											<span>❤️ {carta.likes ?? 0}</span>
											<span>🖼 {(carta.images ?? []).length} foto(s)</span>
										</div>
									</div>
								</div>
								<div class="carta-row-actions">
									<a
										href="/cartas/{carta.id}"
										target="_blank"
										class="action-icon-btn"
										title="Ver publicada"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
											/></svg
										>
									</a>
									<button
										class="action-icon-btn edit"
										on:click={() => startEdit(carta)}
										title="Editar"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
											/></svg
										>
									</button>
									<button
										class="action-icon-btn del"
										on:click={() => confirmDelete(carta)}
										title="Excluir"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="2"
											stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
											/></svg
										>
									</button>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</main>
		{/if}
	{/if}
</div>

<!-- Delete Modal -->
{#if showDeleteModal}
	<div
		class="modal-overlay"
		on:click={() => (showDeleteModal = false)}
		on:keydown={(e) => e.key === 'Escape' && (showDeleteModal = false)}
		role="button"
		tabindex="0"
		transition:fade
	>
		<div
			class="modal-box"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			transition:fly={{ y: 20 }}
		>
			<h3>Excluir carta?</h3>
			<p>Esta ação não pode ser desfeita.</p>
			<div class="modal-btns">
				<button class="btn-ghost" on:click={() => (showDeleteModal = false)} disabled={deleting}
					>Cancelar</button
				>
				<button class="btn-danger" on:click={deleteCarta} disabled={deleting}>
					{#if deleting}<span class="spinner-sm"></span>{:else}Excluir{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<ToastContainer />

<style>
	/* ---------- Layout ---------- */
	.admin-cartas {
		min-height: 100vh;
		background: #f0f2f5;
		font-family: 'Inter', system-ui, sans-serif;
		color: #1a1a2e;
	}

	.loading-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	/* ---------- Login ---------- */
	.login-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
		background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%);
	}

	.login-card {
		background: rgba(255, 255, 255, 0.08);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 24px;
		padding: 3rem 2.5rem;
		max-width: 380px;
		width: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.login-icon {
		font-size: 3rem;
	}
	.login-card h1 {
		font-size: 1.6rem;
		font-weight: 700;
		color: #fff;
		margin: 0;
	}
	.login-card p {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.85rem;
		margin: 0;
	}

	.login-card input {
		width: 100%;
		padding: 0.9rem 1.1rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		font-size: 1rem;
		outline: none;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}
	.login-card input:focus {
		border-color: rgba(255, 255, 255, 0.4);
	}
	.login-card input::placeholder {
		color: rgba(255, 255, 255, 0.3);
	}

	/* ---------- Top Bar ---------- */
	.top-bar {
		background: #fff;
		border-bottom: 1px solid #e8eaed;
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}

	.top-bar-inner {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0.75rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.top-bar-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-link {
		color: #666;
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 500;
		padding: 0.3rem 0.7rem;
		border-radius: 8px;
		transition: background 0.2s;
	}
	.back-link:hover {
		background: #f0f2f5;
	}

	.top-bar-title {
		font-size: 1.05rem;
		font-weight: 700;
		color: #1a1a2e;
	}

	.top-bar-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	/* ---------- Action buttons ---------- */
	.btn-primary-action {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: linear-gradient(135deg, #8b5a2b, #6b3d18);
		color: white;
		font-weight: 700;
		font-size: 0.9rem;
		padding: 0.65rem 1.3rem;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 4px 12px rgba(139, 90, 43, 0.3);
	}
	.btn-primary-action:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 6px 18px rgba(139, 90, 43, 0.4);
	}
	.btn-primary-action:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.btn-primary-action svg {
		width: 16px;
		height: 16px;
	}

	.btn-ghost {
		background: none;
		border: 1px solid #ddd;
		color: #555;
		font-size: 0.85rem;
		font-weight: 500;
		padding: 0.55rem 1rem;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-ghost:hover:not(:disabled) {
		background: #f0f2f5;
		border-color: #bbb;
	}

	.btn-compose {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: #8b5a2b;
		color: #fff;
		font-weight: 600;
		font-size: 0.9rem;
		padding: 0.6rem 1.1rem;
		border-radius: 10px;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}
	.btn-compose svg {
		width: 16px;
		height: 16px;
	}
	.btn-compose:hover {
		background: #6b3d18;
	}

	/* ---------- COMPOSE VIEW ---------- */
	.compose-view {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.compose-grid {
		display: grid;
		grid-template-columns: 1fr 340px;
		gap: 2rem;
		align-items: flex-start;
	}

	.form-card {
		background: #fff;
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-heading {
		font-size: 1.3rem;
		font-weight: 700;
		color: #1a1a2e;
		margin: 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid #f0f2f5;
	}

	/* Fields */
	.field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.field-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.field-label {
		font-size: 0.82rem;
		font-weight: 600;
		color: #555;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}

	.hint-label {
		font-size: 0.75rem;
		text-transform: none;
		letter-spacing: 0;
		color: #999;
		font-weight: 400;
	}

	.req {
		color: #e53e3e;
	}

	.field-input {
		padding: 0.8rem 1rem;
		border: 1.5px solid #e8eaed;
		border-radius: 10px;
		font-size: 0.95rem;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		background: #fafafa;
		color: #1a1a2e;
		width: 100%;
		box-sizing: border-box;
	}
	.field-input:focus {
		border-color: #8b5a2b;
		box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
		background: #fff;
	}
	.big-input {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.field-textarea {
		padding: 0.8rem 1rem;
		border: 1.5px solid #e8eaed;
		border-radius: 10px;
		font-size: 0.95rem;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		background: #fafafa;
		color: #1a1a2e;
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		font-family: inherit;
		line-height: 1.7;
	}
	.field-textarea:focus {
		border-color: #8b5a2b;
		box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.1);
		background: #fff;
	}
	.small-ta {
		min-height: 80px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid #f0f2f5;
	}

	/* ---------- PREVIEW PANEL ---------- */
	.compose-preview {
		position: sticky;
		top: 90px;
	}
	.preview-sticky {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.preview-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #888;
		text-transform: uppercase;
		letter-spacing: 1.2px;
	}

	.preview-card {
		background: #fdf8f0;
		border: 1px solid rgba(139, 90, 43, 0.2);
		border-radius: 12px;
		padding: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.preview-postmark {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.6rem;
	}
	.preview-date {
		font-size: 0.7rem;
		font-weight: 700;
		color: #5d3c1e;
		letter-spacing: 0.5px;
	}
	.preview-loc {
		font-size: 0.65rem;
		color: #8b6d4d;
		text-transform: uppercase;
	}
	.preview-stamp-box {
		width: 32px;
		height: 32px;
		border: 1.5px dashed rgba(139, 90, 43, 0.4);
		border-radius: 2px;
		margin-left: auto;
		flex-shrink: 0;
	}
	.preview-title {
		font-family: 'Merriweather', serif;
		font-size: 0.95rem;
		font-weight: 700;
		color: #3b2c1e;
		margin: 0 0 0.4rem;
		line-height: 1.3;
	}
	.preview-excerpt {
		font-size: 0.75rem;
		color: #6b5040;
		line-height: 1.5;
		margin: 0 0 0.5rem;
	}

	.preview-thumb-wrap {
		position: relative;
		display: inline-block;
		margin-top: 0.5rem;
	}
	.preview-thumb {
		width: 80px;
		height: 60px;
		object-fit: cover;
		border: 2px solid #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		display: block;
	}
	.preview-clip {
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
	.preview-unfold {
		display: block;
		margin-top: 0.6rem;
		font-size: 0.72rem;
		color: #8b5a2b;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.8px;
	}
	.preview-photos-count {
		font-size: 0.75rem;
		color: #888;
	}

	/* ---------- LIST VIEW ---------- */
	.list-view {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	.cartas-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.carta-row {
		background: #fff;
		border-radius: 16px;
		padding: 1.25rem;
		display: flex;
		align-items: center;
		gap: 1.25rem;
		box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
		transition: box-shadow 0.2s;
	}
	.carta-row:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.carta-row-thumb {
		width: 80px;
		height: 80px;
		border-radius: 10px;
		overflow: hidden;
		flex-shrink: 0;
		background: #f0f2f5;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.carta-row-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumb-placeholder {
		font-size: 2rem;
	}

	.carta-row-info {
		flex: 1;
		min-width: 0;
	}
	.carta-row-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.3rem;
	}
	.meta-date {
		font-size: 0.72rem;
		font-weight: 700;
		color: #5d3c1e;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	.meta-loc {
		font-size: 0.72rem;
		color: #999;
	}
	.carta-row-title {
		font-weight: 700;
		font-size: 1rem;
		color: #1a1a2e;
		margin: 0 0 0.25rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.carta-row-excerpt {
		font-size: 0.8rem;
		color: #777;
		margin: 0 0 0.5rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.carta-row-stats {
		display: flex;
		gap: 0.75rem;
		font-size: 0.75rem;
		color: #999;
	}

	.carta-row-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}
	.action-icon-btn {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: #f0f2f5;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		color: #555;
		text-decoration: none;
	}
	.action-icon-btn svg {
		width: 16px;
		height: 16px;
	}
	.action-icon-btn:hover {
		background: #e8eaed;
	}
	.action-icon-btn.edit:hover {
		background: #fdf6e3;
		color: #8b5a2b;
	}
	.action-icon-btn.del:hover {
		background: #fee;
		color: #e53e3e;
	}

	/* On desktop, info-wrap just passes through — mobile overrides below */
	.carta-row-info-wrap {
		display: contents;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 5rem 2rem;
		color: #888;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}
	.empty-icon {
		font-size: 4rem;
	}
	.empty-state h3 {
		font-size: 1.2rem;
		color: #555;
		margin: 0;
	}
	.empty-state p {
		margin: 0;
	}

	/* Spinners */
	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid #e8eaed;
		border-top-color: #8b5a2b;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	.spinner-sm {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 200;
		padding: 1rem;
	}

	.modal-box {
		background: #fff;
		border-radius: 20px;
		padding: 2rem;
		max-width: 380px;
		width: 100%;
		text-align: center;
	}
	.modal-box h3 {
		margin: 0 0 0.5rem;
		font-size: 1.2rem;
	}
	.modal-box p {
		color: #777;
		margin: 0 0 1.5rem;
		font-size: 0.9rem;
	}
	.modal-btns {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	.btn-danger {
		background: #e53e3e;
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.6rem 1.4rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}
	.btn-danger:hover:not(:disabled) {
		background: #c53030;
	}
	.btn-danger:disabled {
		opacity: 0.6;
	}

	/* ===== MOBILE ===== */
	@media (max-width: 860px) {
		/* Compose: single column, hide preview, sticky submit */
		.compose-grid {
			grid-template-columns: 1fr;
		}
		.compose-preview {
			display: none; /* preview only useful on desktop */
		}
		.compose-view {
			padding: 1rem;
		}
		.form-card {
			padding: 1rem;
			border-radius: 14px;
		}
		.field-row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
		.form-actions {
			position: sticky;
			bottom: 0;
			background: #fff;
			margin: 0 -1rem -1rem;
			padding: 0.75rem 1rem;
			border-top: 1px solid #e8eaed;
			border-radius: 0 0 14px 14px;
			display: flex;
			gap: 0.75rem;
		}
		.form-actions .btn-primary-action {
			flex: 1;
			justify-content: center;
			font-size: 1rem;
			padding: 0.85rem;
		}

		/* Top bar: tighter on mobile */
		.top-bar-inner {
			padding: 0.6rem 1rem;
		}
		.top-bar-title {
			font-size: 0.95rem;
		}
		.btn-ghost {
			padding: 0.45rem 0.75rem;
			font-size: 0.8rem;
		}
		.btn-compose {
			font-size: 0.85rem;
			padding: 0.5rem 0.9rem;
		}

		/* List view: proper card layout */
		.list-view {
			padding: 0.75rem;
		}
		.cartas-grid {
			gap: 0.75rem;
		}
		.carta-row {
			flex-direction: column;
			padding: 0.85rem;
			gap: 0.75rem;
		}
		/* Horizontal header row: thumb + meta/title */
		.carta-row-thumb {
			width: 64px;
			height: 64px;
			border-radius: 8px;
		}
		/* Put thumb + text side by side */
		.carta-row-info-wrap {
			display: flex;
			align-items: flex-start;
			gap: 0.75rem;
			width: 100%;
		}
		.carta-row-info {
			flex: 1;
			min-width: 0;
		}
		.carta-row-title {
			font-size: 0.95rem;
			white-space: normal;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
		.carta-row-excerpt {
			display: none;
		}
		/* Actions full-width bottom row */
		.carta-row-actions {
			width: 100%;
			display: flex;
			justify-content: flex-end;
			gap: 0.5rem;
			padding-top: 0.5rem;
			border-top: 1px solid #f0f2f5;
		}
		.action-icon-btn {
			width: 42px;
			height: 42px;
			border-radius: 10px;
		}
		.action-icon-btn svg {
			width: 18px;
			height: 18px;
		}
	}
</style>
