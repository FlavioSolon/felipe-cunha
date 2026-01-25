<footer class="footer">
	<div class="container placeholder-footer">
		<p>&copy; {new Date().getFullYear()} Felipe Cunha. Todos os direitos reservados.</p>

		<div class="developer-credit">
			<p>
				Feito com amor <span style="color: #2ecc71;">💚</span> por Flávio Sólon
				<span style="font-size: 1.2em;">🌵</span>
			</p>
		</div>

		<div class="socials">
			<a href="https://www.instagram.com/solonflavi/" target="_blank" rel="noopener noreferrer"
				>Instagram</a
			>
			<a
				href="https://www.linkedin.com/in/fl%C3%A1vio-s-8941b9212/"
				target="_blank"
				rel="noopener noreferrer">LinkedIn</a
			>
			<a href="https://github.com/FlavioSolon" target="_blank" rel="noopener noreferrer">GitHub</a>
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: #222;
		color: #888;
		padding: 4rem 0;
		text-align: center;
		font-size: 0.9rem;
	}

	.placeholder-footer {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}

	.developer-credit {
		margin: 1rem 0;
		font-weight: 500;
		color: #aaa;
	}

	.socials {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		gap: 1.5rem;
	}

	.socials a {
		color: #fff;
		text-decoration: none;
	}

	.socials a:hover {
		color: var(--color-primary-light);
	}
</style>
