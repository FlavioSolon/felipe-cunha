<script lang="ts">
	import { supabase, s3 } from '$lib/supabaseClient';
	import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
	import { fade, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let password = '';
	let authenticated = false;
	let loading = true; // For checking session on mount

	// Form State
	let type = 'reflexao';
	let title = '';
	let description = '';
	let imageFiles: FileList | null = null;
	let uploading = false;
	let message = '';

	// Data
	let posts: any[] = [];
	let editingId: string | null = null;
	let currentImages: string[] = [];

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
			alert('Senha incorreta!');
		}
	}

	function logout() {
		authenticated = false;
		sessionStorage.removeItem('admin_auth');
		password = '';
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
			let finalImages: string[] = [...currentImages];

			// 1. Upload new videos/images
			if (imageFiles && imageFiles.length > 0) {
				for (let i = 0; i < imageFiles.length; i++) {
					const file = imageFiles[i];
					message = `Convertendo imagem ${i + 1}/${imageFiles.length} para AVIF...`;

					let blob: Blob;
					try {
						blob = await convertToAvif(file);
					} catch (e) {
						console.warn('AVIF conversion failed, falling back to original or WebP');
						// Simple fallback logic could go here, for now throwing error to be safe
						throw e;
					}

					const networkBlob = await blob.arrayBuffer();
					const fileName = `${Date.now()}_${i}.avif`;

					message = `Enviando imagem ${i + 1}/${imageFiles.length}...`;

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
					finalImages.push(imageUrl);
				}
			}

			if (finalImages.length === 0) throw new Error('Nenhuma imagem definida');

			message = 'Salvando no banco de dados...';

			// 2. Insert or Update DB
			let postTitle = title || 'Nova Publicação';

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

				// Trigger Push Notification for NEW posts only
				try {
					fetch('/api/notify', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							title: postTitle,
							body: description ? description.substring(0, 100) : 'Confira o novo conteúdo!',
							url: `/${type === 'conselho' ? 'conselhos' : 'reflexoes'}` // Deep link logic could be improved
							// Ideally finding the specific post ID, but for now linking to feed is okay
						})
					});
				} catch (notifyErr) {
					console.error('Notification trigger failed', notifyErr);
				}
			}

			message = 'Sucesso!';
			cancelEdit();
			fetchPosts();
		} catch (err: any) {
			console.error(err);
			message = 'Erro: ' + (err.message || JSON.stringify(err));
		} finally {
			uploading = false;
		}
	}

	async function fetchPosts() {
		const { data } = await supabase
			.from('posts')
			.select('*')
			.order('created_at', { ascending: false });
		if (data) posts = data;
	}

	async function deletePost(post: any) {
		if (!confirm('Tem certeza que deseja excluir este post permanentemente?')) return;

		// 1. Delete images from Storage
		const imagesToDelete = post.images || (post.image_url ? [post.image_url] : []);

		for (const url of imagesToDelete) {
			try {
				// Assumes standard Supabase URL structure, key is the last part
				const key = url.split('/').pop();
				if (key) {
					console.log('Deleting from S3:', key);
					await s3.send(new DeleteObjectCommand({ Bucket: 'images', Key: key }));
				}
			} catch (err) {
				console.error('Error deleting image from S3:', err);
				// Continue to delete DB record even if image delete fails?
				// Usually yes, to avoid phantom records.
			}
		}

		// 2. Delete from DB
		const { error } = await supabase.from('posts').delete().eq('id', post.id);
		if (!error) fetchPosts();
		else alert('Erro ao excluir do banco de dados');
	}

	function startEdit(post: any) {
		editingId = post.id;
		type = post.type;
		title = post.title || '';
		description = post.description || '';

		if (post.images && Array.isArray(post.images)) {
			currentImages = post.images;
		} else if (post.image_url) {
			currentImages = [post.image_url];
		} else {
			currentImages = [];
		}

		imageFiles = null;
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
		message = '';
	}

	function removeImage(index: number) {
		currentImages = currentImages.filter((_, i) => i !== index);
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
								on:change={(e) => (imageFiles = e.currentTarget.files)}
								class="file-input"
							/>
							<small class="hint"
								>Suporta seleção múltipla. Convertido automaticamente para AVIF.</small
							>
						</div>

						{#if currentImages.length > 0}
							<div class="current-images full-width">
								<label>Imagens Atuais:</label>
								<div class="image-grid">
									{#each currentImages as img, i}
										<div class="image-thumb" transition:fade>
											<img src={img} alt="Thumb" />
											<button
												class="remove-icon-btn"
												on:click={() => removeImage(i)}
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
				<h3>Conteúdo Recente</h3>
				<div class="posts-grid">
					{#each posts as post (post.id)}
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
										on:click={() => deletePost(post)}
										title="Excluir"
									>
										🗑️
									</button>
								</div>
							</div>
						</article>
					{/each}
				</div>
			</section>
		</main>
	{/if}
</div>

<style>
	.admin-page {
		min-height: 100vh;
		background-color: #e5e5e5; /* Neutral background specific for admin */
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)),
			url('/background-pattern.png'); /* If exists, otherwise plain color */
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
</style>
