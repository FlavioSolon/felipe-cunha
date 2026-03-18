<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { ContentBlock } from '$lib/data/cartasCampo';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ change: ContentBlock[] }>();

	export let blocks: ContentBlock[] = [{ type: 'text', value: '' }];
	// Images already uploaded (available to pick from)
	export let availableImages: string[] = [];

	// Track formatting state
	let activeFormats: Set<string> = new Set();

	function updateBlocks() {
		dispatch('change', blocks);
	}

	function addTextBlock(afterIndex: number) {
		blocks = [
			...blocks.slice(0, afterIndex + 1),
			{ type: 'text', value: '' },
			...blocks.slice(afterIndex + 1)
		];
		updateBlocks();
	}

	function addImageBlock(afterIndex: number, imageUrl: string) {
		blocks = [
			...blocks.slice(0, afterIndex + 1),
			{ type: 'image', value: imageUrl, layout: 'full', caption: '' },
			...blocks.slice(afterIndex + 1)
		];
		updateBlocks();
	}

	function removeBlock(index: number) {
		if (blocks.length <= 1) {
			blocks = [{ type: 'text', value: '' }];
		} else {
			blocks = blocks.filter((_, i) => i !== index);
		}
		updateBlocks();
	}

	function updateText(index: number, value: string) {
		blocks[index] = { ...blocks[index], value };
		updateBlocks();
	}

	function updateCaption(index: number, caption: string) {
		blocks[index] = { ...blocks[index], caption };
		updateBlocks();
	}

	function updateLayout(index: number, layout: 'full' | 'left' | 'right') {
		blocks[index] = { ...blocks[index], layout };
		updateBlocks();
	}

	function moveBlock(from: number, to: number) {
		const newBlocks = [...blocks];
		const [item] = newBlocks.splice(from, 1);
		newBlocks.splice(to, 0, item);
		blocks = newBlocks;
		updateBlocks();
	}

	// Contenteditable formatting
	function execFormat(command: string, value?: string) {
		document.execCommand(command, false, value);
	}

	function handleKeydown(e: KeyboardEvent, index: number) {
		// Enter creates a new text block below
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addTextBlock(index);
			// Move focus to the new block after DOM update
			setTimeout(() => {
				const contentEditors = document.querySelectorAll<HTMLElement>('.text-block-editable');
				if (contentEditors[index + 1]) {
					contentEditors[index + 1].focus();
				}
			}, 0);
		}
		// Backspace on empty block removes it
		if (e.key === 'Backspace') {
			const el = e.currentTarget as HTMLElement;
			if (!el.textContent && blocks.length > 1) {
				e.preventDefault();
				removeBlock(index);
				setTimeout(() => {
					const contentEditors = document.querySelectorAll<HTMLElement>('.text-block-editable');
					const targetIdx = Math.max(0, index - 1);
					if (contentEditors[targetIdx]) {
						contentEditors[targetIdx].focus();
					}
				}, 0);
			}
		}
	}

	function handleInput(e: Event, index: number) {
		const el = e.currentTarget as HTMLElement;
		updateText(index, el.innerHTML);
	}

	// Simple emoji picker state
	let showEmojiAt = -1;
	const emojiList = [
		'😊',
		'🙏',
		'❤️',
		'✨',
		'🌟',
		'📖',
		'🌿',
		'⛺',
		'🌄',
		'🔥',
		'🌾',
		'🏔️',
		'🤝',
		'💪',
		'🕊️',
		'🌻',
		'🌈',
		'⭐',
		'🎯',
		'🌊'
	];

	function insertEmoji(emoji: string, index: number) {
		const contentEditors = document.querySelectorAll<HTMLElement>('.text-block-editable');
		if (contentEditors[index]) {
			contentEditors[index].focus();
			document.execCommand('insertText', false, emoji);
			updateText(index, contentEditors[index].innerHTML);
		}
		showEmojiAt = -1;
	}

	// Image picker
	let showImagePickerAt = -1;

	let photoLibFile: File | null = null;
	let photoLibPreview = '';

	function handleLocalPhoto(e: Event, afterIndex: number) {
		const target = e.currentTarget as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			// Create a local preview URL — the actual upload happens in parent
			const url = URL.createObjectURL(file);
			dispatch('change', blocks); // signal parent
			addImageBlock(afterIndex, url);
		}
	}
</script>

<div class="block-editor">
	<!-- Formatting toolbar (global) -->
	<div class="format-toolbar">
		<button
			class="fmt-btn"
			on:mousedown|preventDefault={() => execFormat('bold')}
			title="Negrito (Ctrl+B)"
		>
			<strong>B</strong>
		</button>
		<button
			class="fmt-btn"
			on:mousedown|preventDefault={() => execFormat('italic')}
			title="Itálico (Ctrl+I)"
		>
			<em>I</em>
		</button>
		<button
			class="fmt-btn"
			on:mousedown|preventDefault={() => execFormat('underline')}
			title="Sublinhado"
		>
			<u>U</u>
		</button>
		<div class="fmt-separator"></div>
		<span class="fmt-hint"
			>Selecione texto para formatar • Enter = novo bloco • Backspace em branco = remover</span
		>
	</div>

	<!-- Blocks -->
	<div class="blocks-list">
		{#each blocks as block, i (i)}
			<div class="block-row" transition:fade={{ duration: 150 }}>
				<!-- Handle -->
				<div class="block-handle" title="Mover bloco">
					⠿
					<div class="handle-actions">
						{#if i > 0}
							<button
								on:click={() => moveBlock(i, i - 1)}
								class="handle-btn"
								title="Mover para cima">↑</button
							>
						{/if}
						{#if i < blocks.length - 1}
							<button
								on:click={() => moveBlock(i, i + 1)}
								class="handle-btn"
								title="Mover para baixo">↓</button
							>
						{/if}
					</div>
				</div>

				<!-- Block content -->
				<div class="block-content">
					{#if block.type === 'text'}
						<div
							class="text-block-editable"
							contenteditable="true"
							bind:innerHTML={block.value}
							on:input={(e) => handleInput(e, i)}
							on:keydown={(e) => handleKeydown(e, i)}
							data-placeholder="Escreva um parágrafo..."
							role="textbox"
							aria-multiline="true"
							aria-label="Bloco de texto {i + 1}"
						></div>

						<!-- Emoji quick access -->
						<div class="text-tools">
							<button
								class="tool-btn emoji-btn desktop-only"
								on:mousedown|preventDefault
								on:click={() => (showEmojiAt = showEmojiAt === i ? -1 : i)}
								title="Inserir emoji"
							>
								😊
							</button>
							{#if showEmojiAt === i}
								<div class="emoji-picker" transition:fade={{ duration: 100 }}>
									{#each emojiList as emoji}
										<button
											class="emoji-option"
											on:mousedown|preventDefault
											on:click={() => insertEmoji(emoji, i)}>{emoji}</button
										>
									{/each}
								</div>
							{/if}
						</div>
					{:else if block.type === 'image'}
						<div class="image-block-preview">
							<img src={block.value} alt="Foto {i + 1}" loading="lazy" />
							<div class="image-block-controls">
								<label class="image-layout-label">Posição:</label>
								<div class="layout-btns">
									<button
										class="layout-btn"
										class:active={block.layout === 'full'}
										on:click={() => updateLayout(i, 'full')}
										title="Largura total">⬛</button
									>
									<button
										class="layout-btn"
										class:active={block.layout === 'left'}
										on:click={() => updateLayout(i, 'left')}
										title="Flutua à esquerda">⬅</button
									>
									<button
										class="layout-btn"
										class:active={block.layout === 'right'}
										on:click={() => updateLayout(i, 'right')}
										title="Flutua à direita">➡</button
									>
								</div>
								<input
									type="text"
									class="caption-input"
									placeholder="Legenda (opcional)..."
									value={block.caption ?? ''}
									on:input={(e) => updateCaption(i, (e.currentTarget as HTMLInputElement).value)}
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Remove block -->
				<button
					class="remove-block-btn"
					on:click={() => removeBlock(i)}
					title="Remover bloco"
					aria-label="Remover bloco"
				>
					✕
				</button>
			</div>

			<!-- Add block divider -->
			<div class="add-block-row">
				<div class="add-block-line"></div>
				<div class="add-block-btns">
					<button class="add-btn" on:click={() => addTextBlock(i)} title="Adicionar texto">
						+ Texto
					</button>
					<label class="add-btn photo-add-btn" title="Adicionar foto do dispositivo">
						+ Foto
						<input
							type="file"
							accept="image/*"
							style="display:none"
							on:change={(e) => handleLocalPhoto(e, i)}
						/>
					</label>
					{#if availableImages.length > 0}
						<button
							class="add-btn"
							on:click={() => (showImagePickerAt = showImagePickerAt === i ? -1 : i)}
						>
							+ Biblioteca
						</button>
					{/if}
				</div>
				{#if showImagePickerAt === i}
					<div class="image-library" transition:fade={{ duration: 100 }}>
						{#each availableImages as imgUrl, ii}
							<button
								class="lib-img-btn"
								on:click={() => {
									addImageBlock(i, imgUrl);
									showImagePickerAt = -1;
								}}
							>
								<img src={imgUrl} alt="Imagem {ii + 1}" loading="lazy" />
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.block-editor {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* ===== Toolbar ===== */
	.format-toolbar {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		background: #f7f7f7;
		border: 1.5px solid #e8eaed;
		border-bottom: none;
		border-radius: 10px 10px 0 0;
		flex-wrap: wrap;
	}

	.fmt-btn {
		width: 30px;
		height: 30px;
		border: 1px solid #ddd;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s;
	}
	.fmt-btn:hover {
		background: #e8eaed;
	}
	.fmt-separator {
		width: 1px;
		height: 20px;
		background: #ddd;
		margin: 0 0.25rem;
	}
	.fmt-hint {
		font-size: 0.7rem;
		color: #aaa;
		margin-left: 0.25rem;
	}

	/* ===== Blocks List ===== */
	.blocks-list {
		border: 1.5px solid #e8eaed;
		border-radius: 0 0 10px 10px;
		overflow: hidden;
	}

	.block-row {
		display: flex;
		align-items: flex-start;
		gap: 0;
		background: #fff;
		border-bottom: 1px solid #f0f2f5;
		position: relative;
	}

	.block-row:last-child {
		border-bottom: none;
	}

	/* Handle */
	.block-handle {
		width: 32px;
		min-height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ccc;
		font-size: 1.1rem;
		cursor: grab;
		flex-shrink: 0;
		position: relative;
		transition: color 0.15s;
	}
	.block-handle:hover {
		color: #888;
	}

	.handle-actions {
		position: absolute;
		left: 100%;
		top: 50%;
		transform: translateY(-50%);
		display: none;
		flex-direction: column;
		gap: 2px;
		z-index: 10;
		background: #fff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		border-radius: 6px;
		padding: 3px;
	}
	.block-handle:hover .handle-actions {
		display: flex;
	}

	.handle-btn {
		width: 22px;
		height: 22px;
		border: none;
		background: #f0f2f5;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.7rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.handle-btn:hover {
		background: #e8eaed;
	}

	/* Block content */
	.block-content {
		flex: 1;
		min-width: 0;
		padding: 0.75rem 0.5rem 0.75rem 0;
		position: relative;
	}

	/* Text editable */
	.text-block-editable {
		width: 100%;
		min-height: 48px;
		outline: none;
		font-size: 0.95rem;
		line-height: 1.8;
		color: #1a1a2e;
		font-family: 'Inter', system-ui, sans-serif;
	}

	.text-block-editable:empty::before {
		content: attr(data-placeholder);
		color: #bbb;
		pointer-events: none;
	}

	/* Text tools */
	.text-tools {
		position: absolute;
		bottom: 6px;
		right: 6px;
		display: flex;
		gap: 4px;
	}

	.tool-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		opacity: 0.6;
		transition: opacity 0.15s;
	}
	.tool-btn:hover {
		opacity: 1;
		background: #f0f2f5;
	}

	.emoji-picker {
		position: absolute;
		bottom: calc(100% + 4px);
		right: 0;
		background: #fff;
		border: 1px solid #e8eaed;
		border-radius: 10px;
		padding: 0.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		width: 220px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		z-index: 50;
	}

	/* On mobile: full-width fixed bottom sheet */
	@media (max-width: 860px) {
		.emoji-picker {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			width: 100%;
			border-radius: 16px 16px 0 0;
			padding: 1rem;
			gap: 6px;
			box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
			z-index: 200;
			justify-content: center;
		}
		.emoji-option {
			width: 44px !important;
			height: 44px !important;
			font-size: 1.5rem !important;
		}
	}

	.emoji-option {
		width: 30px;
		height: 30px;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1.1rem;
		border-radius: 6px;
		transition: background 0.15s;
	}
	.emoji-option:hover {
		background: #f0f2f5;
	}

	/* Image block */
	.image-block-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.image-block-preview img {
		max-height: 220px;
		max-width: 100%;
		object-fit: contain;
		border-radius: 8px;
		border: 1px solid #e8eaed;
	}

	.image-block-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.image-layout-label {
		font-size: 0.75rem;
		color: #888;
	}
	.layout-btns {
		display: flex;
		gap: 4px;
	}
	.layout-btn {
		width: 28px;
		height: 28px;
		border: 1.5px solid #e8eaed;
		border-radius: 6px;
		background: #fff;
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.15s;
	}
	.layout-btn.active {
		background: #8b5a2b;
		color: #fff;
		border-color: #8b5a2b;
	}
	.layout-btn:hover:not(.active) {
		background: #f0f2f5;
	}

	.caption-input {
		flex: 1;
		padding: 0.3rem 0.6rem;
		border: 1px solid #e8eaed;
		border-radius: 6px;
		font-size: 0.8rem;
		outline: none;
		min-width: 120px;
	}
	.caption-input:focus {
		border-color: #8b5a2b;
	}

	/* Remove button */
	.remove-block-btn {
		width: 28px;
		height: 28px;
		background: none;
		border: none;
		color: #ccc;
		cursor: pointer;
		font-size: 0.85rem;
		border-radius: 6px;
		margin: 0.75rem 0.5rem 0;
		transition: all 0.15s;
		flex-shrink: 0;
	}
	.remove-block-btn:hover {
		color: #e53e3e;
		background: #fee;
	}

	/* Add block row */
	.add-block-row {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		background: #fafafa;
		border-bottom: 1px solid #f0f2f5;
	}

	.add-block-line {
		width: 100%;
		height: 1px;
		background: #e8eaed;
	}

	.add-block-btns {
		display: flex;
		gap: 0.4rem;
	}

	.add-btn {
		font-size: 0.72rem;
		font-weight: 600;
		color: #8b5a2b;
		background: rgba(139, 90, 43, 0.08);
		border: 1px dashed rgba(139, 90, 43, 0.3);
		border-radius: 8px;
		padding: 0.25rem 0.7rem;
		cursor: pointer;
		transition: all 0.15s;
	}
	.add-btn:hover {
		background: rgba(139, 90, 43, 0.15);
		border-style: solid;
	}

	.photo-add-btn {
		cursor: pointer;
	}

	/* Image library */
	.image-library {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 0.5rem 0;
		max-height: 150px;
		overflow-y: auto;
	}
	.lib-img-btn {
		width: 60px;
		height: 60px;
		border: 2px solid #e8eaed;
		border-radius: 8px;
		overflow: hidden;
		cursor: pointer;
		padding: 0;
		background: none;
		transition: border-color 0.15s;
	}
	.lib-img-btn:hover {
		border-color: #8b5a2b;
	}
	.lib-img-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (max-width: 860px) {
		.desktop-only {
			display: none !important;
		}
	}
</style>
