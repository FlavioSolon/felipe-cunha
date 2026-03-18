<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';

	// Which page is currently active
	$: currentPath = $page.url.pathname;

	function isActive(path: string) {
		if (path === '/') return currentPath === '/';
		return currentPath.startsWith(path);
	}

	const navItems = [
		{
			href: '/',
			label: 'Home',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.592 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />`
		},
		{
			href: '/cartas',
			label: 'Cartas',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.039a2.25 2.25 0 012.134 0l7.5 4.039a2.25 2.25 0 011.183 1.98V19.5z" />`
		},
		{
			href: '/reflexoes',
			label: 'Reflexões',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />`
		},
		{
			href: '/conselhos',
			label: 'Conselhos',
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />`
		}
	];
</script>

<!-- Mobile: bottom bar -->
<nav class="app-nav-mobile" aria-label="Navegação principal">
	{#each navItems as item}
		<a href={item.href} class="nav-item" class:active={isActive(item.href)} aria-label={item.label}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
			>
				{@html item.icon}
			</svg>
			<span class="nav-label">{item.label}</span>
		</a>
	{/each}
</nav>

<!-- Desktop: left sidebar -->
<nav class="app-nav-desktop" aria-label="Navegação principal">
	{#each navItems as item}
		<a
			href={item.href}
			class="nav-item-desk"
			class:active={isActive(item.href)}
			aria-label={item.label}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
			>
				{@html item.icon}
			</svg>
			<span class="tooltip">{item.label}</span>
		</a>
	{/each}
</nav>

<style>
	/* ===== MOBILE: Bottom Bar ===== */
	.app-nav-mobile {
		display: flex;
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 62px;
		background: rgba(10, 10, 10, 0.92);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		justify-content: space-around;
		align-items: center;
		z-index: 1000;
		padding-bottom: env(safe-area-inset-bottom);
	}

	.app-nav-desktop {
		display: none;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		text-decoration: none;
		color: rgba(255, 255, 255, 0.45);
		padding: 0.4rem 0.75rem;
		border-radius: 12px;
		transition:
			color 0.2s,
			background 0.2s;
	}

	.nav-item.active {
		color: #c4894e;
	}

	.nav-item svg {
		width: 24px;
		height: 24px;
	}

	.nav-label {
		font-size: 0.6rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* ===== DESKTOP: Left Sidebar ===== */
	@media (min-width: 850px) {
		.app-nav-mobile {
			display: none;
		}

		.app-nav-desktop {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
			position: fixed;
			left: 1.25rem;
			top: 50%;
			transform: translateY(-50%);
			z-index: 1000;
		}

		.nav-item-desk {
			position: relative;
			width: 48px;
			height: 48px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 14px;
			background: rgba(255, 255, 255, 0.95);
			backdrop-filter: blur(8px);
			border: 1px solid rgba(0, 0, 0, 0.1);
			color: rgba(0, 0, 0, 0.55);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
			text-decoration: none;
			transition: all 0.2s ease;
		}

		.nav-item-desk:hover {
			background: #ffffff;
			border-color: rgba(0, 0, 0, 0.15);
			color: #1a1a1a;
			transform: translateX(2px);
		}

		.nav-item-desk.active {
			background: #fdfaf5;
			color: #8b5a2b;
			border-color: #8b5a2b;
			box-shadow: 0 4px 12px rgba(139, 90, 43, 0.1);
		}

		.nav-item-desk svg {
			width: 22px;
			height: 22px;
			flex-shrink: 0;
		}

		/* Tooltip on hover */
		.tooltip {
			position: absolute;
			left: calc(100% + 12px);
			top: 50%;
			transform: translateY(-50%);
			background: rgba(0, 0, 0, 0.85);
			color: #fff;
			font-size: 0.75rem;
			font-weight: 600;
			padding: 0.35rem 0.7rem;
			border-radius: 8px;
			white-space: nowrap;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.18s ease;
		}

		.tooltip::before {
			content: '';
			position: absolute;
			right: 100%;
			top: 50%;
			transform: translateY(-50%);
			border: 5px solid transparent;
			border-right-color: rgba(0, 0, 0, 0.85);
		}

		.nav-item-desk:hover .tooltip {
			opacity: 1;
		}
	}
</style>
