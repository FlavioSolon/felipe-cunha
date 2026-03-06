import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		output: {
			preloadStrategy: 'empty' // Disable unused preload warnings in Chrome
		},
		version: {
			pollInterval: 5 * 60 * 1000 // Poll for new deploys every 5 minutes
		}
	}
};

export default config;
