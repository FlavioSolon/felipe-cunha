<script lang="ts">
	import icon from '$lib/assets/burning_bush.png';
	import { reveal } from '$lib/actions/reveal';
</script>

<div class="divider-container" use:reveal>
	<div class="line"></div>
	<div class="icon-circle">
		<img src={icon} alt="Cacto em Chamas" />
	</div>
	<div class="line"></div>
</div>

<style>
	.divider-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		padding: 2rem 0; /* Reduced padding to center better in the gap */
		opacity: 0; /* controlled by reveal action */
		gap: 0; /* Lines touch the circle */
	}

	.line {
		flex: 1;
		height: 1px;
		background-color: var(--color-primary-light);
		opacity: 0.3;
		max-width: 30%; /* Don't stretch too far on wide screens */
	}

	.icon-circle {
		border: 1px solid rgba(210, 180, 140, 0.5); /* Match subtle separator color/opacity */
		border-radius: 50%;
		padding: 1rem; /* Reduced padding so icon fills more space */
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		/* Ensure border matches the line color more precisely if needed */
		border-color: var(--color-primary-light);
		opacity: 0.8; /* Slight opacity for the container */
	}

	.divider-container img {
		width: 140px; /* Increased size relative to container */
		height: auto;
		display: block;
		mix-blend-mode: multiply;
	}

	/* Responsive adjustment */
	@media (max-width: 600px) {
		.line {
			max-width: 20%;
		}
		.divider-container img {
			width: 100px;
		}
		.icon-circle {
			padding: 0.8rem;
		}
	}
</style>
