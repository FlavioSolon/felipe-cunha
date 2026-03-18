<script lang="ts">
	import { page } from '$app/stores';

	$: currentPath = $page.url.pathname;
	let drawerOpen = false;

	const adminItems = [
		{
			href: '/admin',
			label: 'Posts',
			exact: true,
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />`
		},
		{
			href: '/admin/cartas',
			label: 'Cartas do Campo',
			exact: false,
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />`
		}
	];

	function isActive(item: { href: string; exact: boolean }) {
		return item.exact ? currentPath === item.href : currentPath.startsWith(item.href);
	}
</script>

<!-- ===== MOBILE: Hamburger top bar ===== -->
<div class="admin-mobile-bar">
	<button class="hamburger-btn" on:click={() => (drawerOpen = !drawerOpen)} aria-label="Menu">
		{#if drawerOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
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
					d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
				/>
			</svg>
		{/if}
	</button>
	<span class="mobile-admin-title">Admin</span>
	<a href="/" class="mobile-home-link" aria-label="Ir para site">↗ Site</a>
</div>

<!-- Drawer -->
{#if drawerOpen}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="drawer-overlay" on:click={() => (drawerOpen = false)}></div>
	<nav class="drawer" aria-label="Navegação admin">
		<div class="drawer-header">
			<span class="drawer-title">Admin Panel</span>
		</div>
		{#each adminItems as item}
			<a
				href={item.href}
				class="drawer-item"
				class:active={isActive(item)}
				on:click={() => (drawerOpen = false)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.8"
					stroke="currentColor"
				>
					{@html item.icon}
				</svg>
				{item.label}
			</a>
		{/each}
	</nav>
{/if}

<!-- ===== DESKTOP: Left sidebar ===== -->
<nav class="admin-sidebar" aria-label="Navegação admin">
	{#each adminItems as item}
		<a href={item.href} class="sidebar-item" class:active={isActive(item)} aria-label={item.label}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.8"
				stroke="currentColor"
			>
				{@html item.icon}
			</svg>
			<span class="sidebar-tooltip">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* ===== MOBILE: top bar ===== */
	.admin-mobile-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: #fff;
		border-bottom: 1px solid #e8eaed;
		position: sticky;
		top: 0;
		z-index: 200;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}

	.admin-sidebar {
		display: none;
	}

	.hamburger-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		cursor: pointer;
		border-radius: 8px;
		transition: background 0.15s;
	}
	.hamburger-btn:hover {
		background: #f0f2f5;
	}
	.hamburger-btn svg {
		width: 22px;
		height: 22px;
		color: #333;
	}

	.mobile-admin-title {
		font-weight: 700;
		font-size: 1rem;
		color: #1a1a2e;
	}

	.mobile-home-link {
		font-size: 0.8rem;
		font-weight: 600;
		color: #8b5a2b;
		text-decoration: none;
		padding: 0.3rem 0.7rem;
		border: 1px solid rgba(139, 90, 43, 0.3);
		border-radius: 8px;
		transition: all 0.2s;
	}
	.mobile-home-link:hover {
		background: rgba(139, 90, 43, 0.08);
	}

	/* Drawer */
	.drawer-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		z-index: 299;
		backdrop-filter: blur(2px);
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		width: 260px;
		height: 100%;
		background: #fff;
		z-index: 300;
		box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		padding: 0;
	}

	.drawer-header {
		padding: 1.25rem 1.25rem 0.75rem;
		border-bottom: 1px solid #f0f2f5;
	}

	.drawer-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: #1a1a2e;
	}

	.drawer-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.9rem 1.25rem;
		text-decoration: none;
		color: #555;
		font-size: 0.9rem;
		font-weight: 500;
		transition: all 0.2s;
		border-left: 3px solid transparent;
	}

	.drawer-item svg {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.drawer-item:hover {
		background: #f8f9fa;
		color: #1a1a2e;
	}

	.drawer-item.active {
		background: rgba(139, 90, 43, 0.07);
		color: #8b5a2b;
		border-left-color: #8b5a2b;
		font-weight: 600;
	}

	/* ===== DESKTOP: left sidebar ===== */
	@media (min-width: 850px) {
		.admin-mobile-bar {
			display: none;
		}

		.admin-sidebar {
			display: flex;
			flex-direction: column;
			gap: 0.6rem;
			position: fixed;
			left: 1rem;
			top: 50%;
			transform: translateY(-50%);
			z-index: 200;
		}

		.sidebar-item {
			position: relative;
			width: 46px;
			height: 46px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.9);
			border: 1px solid #e8eaed;
			color: #666;
			text-decoration: none;
			transition: all 0.2s ease;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
		}

		.sidebar-item svg {
			width: 20px;
			height: 20px;
			flex-shrink: 0;
		}

		.sidebar-item:hover {
			background: #fff;
			color: #1a1a2e;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
			transform: translateX(2px);
		}

		.sidebar-item.active {
			background: rgba(139, 90, 43, 0.1);
			color: #8b5a2b;
			border-color: rgba(139, 90, 43, 0.3);
		}

		.sidebar-tooltip {
			position: absolute;
			left: calc(100% + 10px);
			top: 50%;
			transform: translateY(-50%);
			background: rgba(26, 26, 46, 0.92);
			color: #fff;
			font-size: 0.75rem;
			font-weight: 600;
			padding: 0.3rem 0.65rem;
			border-radius: 8px;
			white-space: nowrap;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.15s ease;
		}

		.sidebar-tooltip::before {
			content: '';
			position: absolute;
			right: 100%;
			top: 50%;
			transform: translateY(-50%);
			border: 5px solid transparent;
			border-right-color: rgba(26, 26, 46, 0.92);
		}

		.sidebar-item:hover .sidebar-tooltip {
			opacity: 1;
		}
	}
</style>
