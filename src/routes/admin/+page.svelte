<script lang="ts">
	import { supabase, s3 } from '$lib/supabaseClient';
	import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
	import { fade, slide, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { dndzone } from 'svelte-dnd-action';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { toasts } from '$lib/stores/toastStore';
	import { resizeAndCropImage } from '$lib/imageResize';
	const flipDurationMs = 200;

	let password = '';
	let authenticated = false;
	let loading = true;

	// Form State
	let type = 'reflexao';
	let title = '';
	let description = '';
	let imageFiles: FileList | null = null;
	let uploading = false;
	let message = '';

	// Data & Filtering
	let allPosts: any[] = [];
	let posts: any[] = [];
	let editingId: string | null = null;
	let currentImages: Array<{ id: string; url: string }> = [];
	let newImagePreviews: Array<{ id: number; url: string; file: File }> = [];

	// Filters & Pagination
	let filterType: 'all' | 'reflexao' | 'conselho' = 'all';
	let sortOrder: 'newest' | 'oldest' = 'newest';
	let currentPage = 1;
	let postsPerPage = 12;

	$: totalPages = Math.ceil(posts.length / postsPerPage);
	$: paginatedPosts = posts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

	// Apply filters whenever they change
	$: {
		let filtered = [...allPosts];

		// Filter by type
		if (filterType !== 'all') {
			filtered = filtered.filter((p) => p.type === filterType);
		}

		// Sort
		filtered.sort((a, b) => {
			const dateA = new Date(a.created_at).getTime();
			const dateB = new Date(b.created_at).getTime();
			return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
		});

		posts = filtered;
		currentPage = 1; // Reset to first page when filters change
	}

	onMount(() => {
		const sessionAuth = sessionStorage.getItem('admin_auth');
		if (sessionAuth === 'true') {
			authenticated = true;
			fetchPosts();
		}
		loading = false;
	});

	async function login() {
		if (password === 'amadoJesus') {
			authenticated = true;
			sessionStorage.setItem('admin_auth', 'true');
			fetchPosts();
		} else {
			toasts.error('Senha incorreta!');
		}
	}

	function logout() {
		authenticated = false;
		sessionStorage.removeItem('admin_auth');
		password = '';
		allPosts = [];
		posts = [];
	}

	// AVIF Conversion
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

				// Attempt AVIF conversion, fallback to WebP if browser doesn't support it in toBlob
				// Most modern browsers support toBlob('image/avif')
				canvas.toBlob(
					(blob) => {
						if (blob) resolve(blob);
						else reject(new Error('Conversion failed'));
					},
					'image/avif',
					0.9
				);
			};
			img.onerror = (e) => reject(e);
			img.src = URL.createObjectURL(file);
		});
	}

	async function uploadPost() {
		if ((!imageFiles || imageFiles.length === 0) && !editingId) return;

		uploading = true;
		message = '';

		try {
			// 1. Upload new images if any
			const uploadedUrls: string[] = [];
			if (newImagePreviews.length > 0) {
				// Only process if there are new images to upload
				// Use the reordered files from newImagePreviews
				const filesToUpload = newImagePreviews.map((p) => p.file);

				for (let i = 0; i < filesToUpload.length; i++) {
					const file = filesToUpload[i];
					message = `Convertendo imagem ${i + 1}/${filesToUpload.length} para AVIF...`;

					let blob: Blob;
					try {
						// 1. Resize and crop first (414x517.5px - 4:5 aspect ratio)
						message = `Redimensionando imagem ${i + 1}/${filesToUpload.length}...`;
						const resizedBlob = await resizeAndCropImage(file, 414, 517.5);

						// 2. Convert to AVIF
						message = `Convertendo imagem ${i + 1}/${filesToUpload.length} para AVIF...`;
						const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
						blob = await convertToAvif(resizedFile);
					} catch (e) {
						console.warn('Image processing failed:', e);
						// Fallback to original file processing if resize fails
						try {
							console.log('Tentando conversão direta sem resize...');
							blob = await convertToAvif(file);
						} catch (fallbackError) {
							console.error('Falha crítica na conversão de imagem', fallbackError);
							throw e;
						}
					}

					const networkBlob = await blob.arrayBuffer();
					const fileName = `${Date.now()}_${i}.avif`;

					message = `Enviando imagem ${i + 1}/${filesToUpload.length}...`;

					await s3.send(
						new PutObjectCommand({
							Bucket: 'images',
							Key: fileName,
							Body: new Uint8Array(networkBlob),
							ContentType: 'image/avif',
							ACL: 'public-read'
						})
					);

					const imageUrl = `https://kyzotobotxygdpshpwpw.supabase.co/storage/v1/object/public/images/${fileName}`;
					uploadedUrls.push(imageUrl);
				}
			}

			// 2. Combine: existing (currentImages) + newly uploaded
			const finalImages: string[] = [...currentImages.map((img) => img.url), ...uploadedUrls];

			if (finalImages.length === 0) throw new Error('Nenhuma imagem definida');

			message = 'Salvando no banco de dados...';

			// 2. Insert or Update DB
			let postTitle = title || 'Nova Publicação';
			const isUpdate = !!editingId;

			if (editingId) {
				const { error: dbError } = await supabase
					.from('posts')
					.update({
						type,
						title: title || null,
						description: description || null,
						images: finalImages
					})
					.eq('id', editingId);
				if (dbError) throw dbError;
			} else {
				const { error: dbError } = await supabase.from('posts').insert({
					type,
					title: title || null,
					description: description || null,
					images: finalImages
				});
				if (dbError) throw dbError;
			}

			// Trigger Push Notification for both CREATE and UPDATE
			try {
				const notificationBody = isUpdate
					? `Atualizado: ${description ? description.substring(0, 80) : 'Confira as mudanças!'}`
					: description
						? description.substring(0, 100)
						: 'Confira o novo conteúdo!';

				await fetch('/api/notify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: isUpdate ? `📝 ${postTitle}` : `✨ ${postTitle}`,
						body: notificationBody,
						url: `/${type === 'conselho' ? 'conselhos' : 'reflexoes'}`
					})
				});
				console.log('Notification sent successfully');
			} catch (notifyErr) {
				console.error('Notification trigger failed', notifyErr);
			}

			toasts.success(editingId ? 'Post atualizado com sucesso!' : 'Post publicado com sucesso!');
			cancelEdit();
			fetchPosts();
		} catch (err: any) {
			console.error(err);
			toasts.error('Erro: ' + (err.message || 'Falha ao processar'));
		} finally {
			uploading = false;
		}
	}

	async function fetchPosts() {
		const { data } = await supabase
			.from('posts')
			.select('*')
			.order('created_at', { ascending: false });
		if (data) {
			allPosts = data;
		}
	}

	let postToDelete: any = null;
	let showDeleteModal = false;
	let deleting = false;

	function confirmDelete(post: any) {
		postToDelete = post;
		showDeleteModal = true;
	}

	async function deletePost() {
		if (!postToDelete) return;

		deleting = true;

		// 1. Delete images from Storage
		const imagesToDelete =
			postToDelete.images || (postToDelete.image_url ? [postToDelete.image_url] : []);

		for (const url of imagesToDelete) {
			try {
				const key = url.split('/').pop();
				if (key) {
					console.log('Deleting from S3:', key);
					await s3.send(new DeleteObjectCommand({ Bucket: 'images', Key: key }));
				}
			} catch (err) {
				console.error('Error deleting image from S3:', err);
			}
		}

		// 2. Delete from DB
		const { error } = await supabase.from('posts').delete().eq('id', postToDelete.id);
		if (!error) {
			toasts.success('Post excluído com sucesso!');
			fetchPosts();
		} else {
			toasts.error('Erro ao excluir post');
		}

		deleting = false;
		showDeleteModal = false;
		postToDelete = null;
	}

	function startEdit(post: any) {
		editingId = post.id;
		type = post.type;
		title = post.title || '';
		description = post.description || '';

		if (post.images && Array.isArray(post.images)) {
			currentImages = post.images.map((url: string, index: number) => ({
				id: `existing-${index}-${url.split('/').pop()}`,
				url
			}));
		} else if (post.image_url) {
			currentImages = [
				{
					id: `existing-0-${post.image_url.split('/').pop()}`,
					url: post.image_url
				}
			];
		} else {
			currentImages = [];
		}

		imageFiles = null;
		newImagePreviews = [];
		message = '';
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function cancelEdit() {
		editingId = null;
		type = 'reflexao';
		title = '';
		description = '';
		currentImages = [];
		imageFiles = null;
		newImagePreviews = [];
		message = '';

		// Reset file input
		const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
	}

	function removeImage(index: number) {
		currentImages = currentImages.filter((_, i) => i !== index);
	}

	function handleImageSort(e: CustomEvent) {
		currentImages = e.detail.items;
	}

	function handleNewImageSort(e: CustomEvent) {
		newImagePreviews = e.detail.items;
	}

	function handleFileChange(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		imageFiles = target.files;

		// Create previews for new images
		if (imageFiles && imageFiles.length > 0) {
			newImagePreviews = Array.from(imageFiles).map((file, index) => ({
				id: Date.now() + index,
				url: URL.createObjectURL(file),
				file
			}));
		}
	}

	function removeNewImage(index: number) {
		newImagePreviews = newImagePreviews.filter((_, i) => i !== index);

		// Update imageFiles to match
		if (imageFiles) {
			const dt = new DataTransfer();
			Array.from(imageFiles).forEach((file, i) => {
				if (i !== index) dt.items.add(file);
			});
			imageFiles = dt.files;
		}
	}
</script>

<div class="admin-page">
	{#if loading}
		<div class="loading">Carregando...</div>
	{:else if !authenticated}
		<section class="login-section" in:fade>
			<div class="login-card glass">
				<h1>Admin</h1>
				<p class="subtitle">Faça login para gerenciar o conteúdo.</p>
				<div class="input-group">
					<input
						type="password"
						bind:value={password}
						placeholder="Senha de acesso"
						on:keydown={(e) => e.key === 'Enter' && login()}
					/>
					<button class="btn btn-primary" on:click={login}>Entrar</button>
				</div>
			</div>
		</section>
	{:else}
		<header class="admin-header glass">
			<div class="header-content">
				<h2>Dashboard</h2>
				<button class="btn btn-secondary btn-sm" on:click={logout}>Sair</button>
			</div>
		</header>

		<main class="dashboard-content" in:fade>
			<!-- Upload/Edit Section -->
			<section class="editor-section">
				<div class="card glass">
					<h3>{editingId ? '✏️ Editar Post' : '✨ Novo Post'}</h3>

					<div class="form-grid">
						<div class="form-group">
							<label>Tipo de Postagem</label>
							<select bind:value={type}>
								<option value="reflexao">Reflexão</option>
								<option value="conselho">Conselho</option>
							</select>
						</div>

						<div class="form-group full-width">
							<label>Imagens {editingId ? '(Adicionar/Manter)' : '(Selecionar)'}</label>
							<input
								type="file"
								accept="image/*"
								multiple
								on:change={handleFileChange}
								class="file-input"
							/>
							<small class="hint"
								>Suporta seleção múltipla. Convertido automaticamente para AVIF.</small
							>
						</div>

						{#if newImagePreviews.length > 0}
							<div class="current-images full-width">
								<label>Novas Imagens: <small class="hint">(Arraste para reordenar)</small></label>
								<div
									class="image-grid"
									use:dndzone={{ items: newImagePreviews, flipDurationMs }}
									on:consider={handleNewImageSort}
									on:finalize={handleNewImageSort}
								>
									{#each newImagePreviews as item, i (item.id)}
										<div class="image-thumb" transition:fade>
											<div class="drag-handle">⋮⋮</div>
											<img src={item.url} alt="Preview" />
											<button
												class="remove-icon-btn"
												on:click={() => removeNewImage(i)}
												title="Remover imagem"
											>
												✕
											</button>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						{#if currentImages.length > 0}
							<div class="current-images full-width">
								<label>Imagens Atuais: <small class="hint">(Arraste para reordenar)</small></label>
								<div
									class="image-grid"
									use:dndzone={{
										items: currentImages,
										flipDurationMs
									}}
									on:consider={handleImageSort}
									on:finalize={handleImageSort}
								>
									{#each currentImages as item, i (item.id)}
										<div class="image-thumb" transition:fade>
											<div class="drag-handle">⋮⋮</div>
											<img src={item.url} alt="Thumb" />
											<button
												class="remove-icon-btn"
												on:click={() => {
													currentImages = currentImages.filter((img) => img.id !== item.id);
												}}
												title="Remover imagem"
											>
												✕
											</button>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<div class="form-group">
							<label>Título <span class="opt">(Opcional)</span></label>
							<input type="text" bind:value={title} placeholder="Ex: Oração da Manhã" />
						</div>

						<div class="form-group full-width">
							<label>Descrição <span class="opt">(Opcional)</span></label>
							<textarea bind:value={description} rows="4" placeholder="Digite o conteúdo do post..."
							></textarea>
						</div>
					</div>

					<div class="form-actions">
						{#if editingId}
							<button class="btn btn-secondary" on:click={cancelEdit}>Cancelar</button>
						{/if}
						<button
							class="btn btn-primary"
							on:click={uploadPost}
							disabled={((!imageFiles || imageFiles.length === 0) && currentImages.length === 0) ||
								uploading}
						>
							{#if uploading}
								<span class="spinner"></span> Processando...
							{:else}
								{editingId ? 'Salvar Alterações' : 'Publicar'}
							{/if}
						</button>
					</div>

					{#if message}
						<div class="message-box" class:error={message.startsWith('Erro')} transition:slide>
							{message}
						</div>
					{/if}
				</div>
			</section>

			<!-- List Section -->
			<section class="list-section">
				<div class="list-header">
					<h3>Conteúdo Recente</h3>

					<div class="filters">
						<div class="filter-group">
							<label class="filter-label">Tipo:</label>
							<div class="pill-buttons">
								<button
									class="pill-btn"
									class:active={filterType === 'all'}
									on:click={() => (filterType = 'all')}
								>
									Todos
								</button>
								<button
									class="pill-btn"
									class:active={filterType === 'reflexao'}
									on:click={() => (filterType = 'reflexao')}
								>
									Reflexões
								</button>
								<button
									class="pill-btn"
									class:active={filterType === 'conselho'}
									on:click={() => (filterType = 'conselho')}
								>
									Conselhos
								</button>
							</div>
						</div>

						<div class="filter-group">
							<label class="filter-label">Ordenar:</label>
							<div class="pill-buttons">
								<button
									class="pill-btn"
									class:active={sortOrder === 'newest'}
									on:click={() => (sortOrder = 'newest')}
								>
									Mais Recentes
								</button>
								<button
									class="pill-btn"
									class:active={sortOrder === 'oldest'}
									on:click={() => (sortOrder = 'oldest')}
								>
									Mais Antigos
								</button>
							</div>
						</div>
					</div>
				</div>

				{#if posts.length === 0}
					<div class="empty-state">
						<p>📭</p>
						<p>Nenhum post encontrado</p>
					</div>
				{:else}
					<div class="posts-grid">
						{#each paginatedPosts as post (post.id)}
							<article class="post-card glass" transition:fade>
								<div class="post-image">
									<img src={post.images?.[0] || post.image_url} alt={post.title} loading="lazy" />
									<div class="post-type-badge {post.type}">{post.type}</div>
								</div>
								<div class="post-content">
									<h4>{post.title || 'Sem título'}</h4>
									<p class="post-date">
										{new Date(post.created_at).toLocaleDateString('pt-BR', {
											day: '2-digit',
											month: 'long',
											year: 'numeric'
										})}
									</p>

									<div class="post-actions">
										<button class="action-btn edit" on:click={() => startEdit(post)} title="Editar">
											✏️
										</button>
										<button
											class="action-btn delete"
											on:click={() => confirmDelete(post)}
											title="Excluir"
										>
											🗑️
										</button>
									</div>
								</div>
							</article>
						{/each}
					</div>

					<!-- Pagination -->
					{#if totalPages > 1}
						<div class="pagination">
							<button class="page-btn" disabled={currentPage === 1} on:click={() => currentPage--}>
								← Anterior
							</button>
							<span class="page-info">Página {currentPage} de {totalPages}</span>
							<button
								class="page-btn"
								disabled={currentPage === totalPages}
								on:click={() => currentPage++}
							>
								Próxima →
							</button>
						</div>
					{/if}
				{/if}
			</section>
		</main>
	{/if}
</div>

<!-- Delete Confirmation Modal -->
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
			class="modal-content"
			on:click|stopPropagation
			on:keydown|stopPropagation
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			transition:fly={{ y: 20 }}
		>
			<h3>Confirmar Exclusão</h3>
			<p>Tem certeza que deseja excluir este post permanentemente?</p>
			<p class="modal-warning">Esta ação não pode ser desfeita.</p>
			<div class="modal-actions">
				<button
					class="btn btn-secondary"
					on:click={() => (showDeleteModal = false)}
					disabled={deleting}
				>
					Cancelar
				</button>
				<button class="btn btn-danger" on:click={deletePost} disabled={deleting}>
					{#if deleting}
						<span class="spinner"></span> Excluindo...
					{:else}
						Excluir
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

<ToastContainer />

<style>
	.admin-page {
		min-height: 100vh;
		background-color: #e5e5e5; /* Neutral background specific for admin */
		color: var(--color-text-main);
		font-family: var(--font-secondary);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		font-size: 1.5rem;
		color: var(--color-primary);
	}

	/* Login Styles */
	.login-section {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		padding: 1rem;
	}

	.login-card {
		padding: 3rem;
		border-radius: 20px;
		width: 100%;
		max-width: 400px;
		text-align: center;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.login-card h1 {
		font-family: var(--font-primary);
		color: var(--color-primary);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--color-text-light);
		margin-bottom: 2rem;
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	input[type='password'] {
		padding: 1rem;
		border-radius: 12px;
		border: 2px solid transparent;
		background: rgba(0, 0, 0, 0.05);
		font-size: 1rem;
		transition: all 0.3s;
		outline: none;
	}

	input[type='password']:focus {
		border-color: var(--color-primary);
		background: white;
	}

	/* Dashboard Styles */
	.admin-header {
		position: sticky;
		top: 0;
		z-index: 100;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-content h2 {
		font-size: 1.5rem;
		color: var(--color-primary);
	}

	.dashboard-content {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
		display: grid;
		gap: 3rem;
	}

	/* Editor Section */
	.card {
		padding: 2rem;
		border-radius: 20px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.card h3 {
		margin-bottom: 1.5rem;
		color: var(--color-primary);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding-bottom: 1rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	@media (min-width: 768px) {
		.form-grid {
			grid-template-columns: 1fr 2fr;
		}
		.full-width {
			grid-column: span 2;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-main);
	}

	.opt {
		font-weight: 400;
		color: var(--color-text-light);
		font-size: 0.8rem;
	}

	input[type='text'],
	select,
	textarea {
		padding: 0.8rem;
		border-radius: 10px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background: rgba(255, 255, 255, 0.8);
		font-family: inherit;
		transition: border-color 0.3s;
	}

	input:focus,
	select:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.file-input {
		padding: 0.5rem;
		border: 1px dashed var(--color-primary);
		background: rgba(160, 82, 45, 0.05);
		cursor: pointer;
	}

	.hint {
		font-size: 0.8rem;
		color: var(--color-text-light);
		margin-top: 0.25rem;
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.image-thumb {
		position: relative;
		width: 80px;
		height: 80px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		cursor: grab;
		transition: transform 0.2s;
	}

	.image-thumb:active {
		cursor: grabbing;
		transform: scale(1.05);
	}

	.drag-handle {
		position: absolute;
		top: 2px;
		left: 2px;
		background: rgba(0, 0, 0, 0.6);
		color: white;
		padding: 2px 4px;
		border-radius: 4px;
		font-size: 0.7rem;
		z-index: 10;
		pointer-events: none;
	}

	.image-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-icon-btn {
		position: absolute;
		top: 2px;
		right: 2px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: rgba(255, 0, 0, 0.8);
		color: white;
		font-size: 0.7rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s;
	}

	.remove-icon-btn:hover {
		transform: scale(1.1);
		background: red;
	}

	.form-actions {
		margin-top: 2rem;
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.message-box {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 10px;
		background: #e8f5e9;
		color: #2e7d32;
		text-align: center;
		font-weight: 500;
	}

	.message-box.error {
		background: #ffebee;
		color: #c62828;
	}

	.spinner {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-right: 0.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* List Section */
	.list-section h3 {
		margin-bottom: 2rem;
		color: var(--color-text-main);
	}

	.posts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 2rem;
	}

	.post-card {
		border-radius: 15px;
		overflow: hidden;
		transition: transform 0.3s;
		background: white;
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
		display: flex;
		flex-direction: column;
	}

	.post-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	.post-image {
		position: relative;
		height: 200px;
		background: #eee;
	}

	.post-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.post-type-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		color: white;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}

	.post-type-badge.reflexao {
		background: var(--color-primary);
	}

	.post-type-badge.conselho {
		background: var(--color-secondary);
	}

	.post-content {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		flex-grow: 1;
	}

	.post-content h4 {
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
		color: var(--color-text-main);
	}

	.post-date {
		font-size: 0.85rem;
		color: var(--color-text-light);
		margin-bottom: 1.5rem;
	}

	.post-actions {
		margin-top: auto;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.action-btn {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
		background: rgba(0, 0, 0, 0.03);
	}

	.action-btn:hover {
		background: rgba(0, 0, 0, 0.1);
		transform: scale(1.1);
	}

	.action-btn.edit {
		color: var(--color-primary);
	}

	.action-btn.delete {
		color: #e53935;
	}

	.btn-sm {
		padding: 0.5rem 1.5rem;
		font-size: 0.85rem;
	}

	/* Filters & Pagination */
	.list-header {
		margin-bottom: 2rem;
	}

	.list-header h3 {
		margin-bottom: 1.5rem;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.filter-label {
		font-weight: 600;
		color: var(--color-text-main);
		font-size: 0.9rem;
	}

	.pill-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.pill-btn {
		padding: 0.5rem 1rem;
		border-radius: 20px;
		border: 2px solid rgba(0, 0, 0, 0.1);
		background: white;
		color: var(--color-text-main);
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.pill-btn:hover {
		border-color: var(--color-primary);
		background: rgba(160, 82, 45, 0.05);
	}

	.pill-btn.active {
		border-color: var(--color-primary);
		background: var(--color-primary);
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--color-text-light);
	}

	.empty-state p:first-child {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem;
		margin-top: 3rem;
		padding: 2rem 0;
	}

	.page-btn {
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.1);
		color: var(--color-primary);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: var(--color-primary);
		color: white;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.page-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.page-info {
		font-weight: 600;
		color: var(--color-text-main);
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		max-width: 400px;
		width: 100%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-content h3 {
		margin-bottom: 1rem;
		color: var(--color-text-main);
	}

	.modal-content p {
		color: var(--color-text-light);
		margin-bottom: 0.5rem;
	}

	.modal-warning {
		color: #ef4444;
		font-weight: 600;
		margin-bottom: 1.5rem;
	}

	.modal-actions {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.btn-danger {
		background: #ef4444;
		color: white;
	}

	.btn-danger:hover {
		background: #dc2626;
	}

	@media (max-width: 768px) {
		.filters {
			flex-direction: column;
			gap: 1rem;
		}

		.filter-group {
			flex-direction: column;
			align-items: flex-start;
		}

		.pill-buttons {
			flex-wrap: wrap;
		}

		.pagination {
			gap: 1rem;
		}

		.page-btn {
			padding: 0.5rem 1rem;
			font-size: 0.85rem;
		}
	}
</style>
