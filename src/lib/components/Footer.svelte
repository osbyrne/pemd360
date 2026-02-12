<script lang="ts">
	import logoPEMD from '$lib/assets/pemd360.png';
	import { Mail, Phone, MapPin, Linkedin } from 'lucide-svelte';
</script>

<footer class="bg-gray-900 text-white">
	<div class="container mx-auto px-4 py-12">
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			<!-- Contact -->
			<div>
				<h5 class="mb-4 text-lg font-semibold">Contact</h5>
				<ul class="space-y-3 text-sm text-gray-400">
					<li>
						<a
							href="mailto:florent.mouriot@depollution-conseil.fr"
							class="flex items-center gap-3 transition-colors hover:text-emerald-500"
						>
							<Mail class="h-4 w-4 text-emerald-500" />
							<span>florent.mouriot@depollution-conseil.fr</span>
						</a>
					</li>
					<li>
						<a
							href="tel:+33631326715"
							class="flex items-center gap-3 transition-colors hover:text-emerald-500"
						>
							<Phone class="h-4 w-4 text-emerald-500" />
							<span>06 31 32 67 15</span>
						</a>
					</li>
					<li>
						<a
							href="https://maps.google.com/?q=7+rue+Montespan+91000+Évry-Courcouronnes"
							target="_blank"
							rel="noopener noreferrer"
							class="flex items-start gap-3 transition-colors hover:text-emerald-500"
						>
							<MapPin class="mt-0.5 h-4 w-4 text-emerald-500" />
							<span>7 rue Montespan 91000, Évry-Courcouronnes</span>
						</a>
					</li>
				</ul>
			</div>

			<!-- Liens utiles -->
			<div>
				<h5 class="mb-4 text-lg font-semibold">Liens utiles</h5>
				<ul class="space-y-2 text-sm">
					<li>
						<a href="/" class="text-gray-400 transition-colors hover:text-emerald-500">Accueil</a>
					</li>
					<li>
						<a href="/about" class="text-gray-400 transition-colors hover:text-emerald-500"
							>À propos</a
						>
					</li>
					<li>
						<a href="/contact" class="text-gray-400 transition-colors hover:text-emerald-500"
							>Contact</a
						>
					</li>
					<li>
						<a href="/mentions" class="text-gray-400 transition-colors hover:text-emerald-500"
							>Mentions légales</a
						>
					</li>
				</ul>
			</div>

			<!-- Réseaux sociaux -->
			<div>
				<h5 class="mb-4 text-lg font-semibold">Réseaux sociaux</h5>
				<div class="flex items-center gap-4">
					<img src={logoPEMD} alt="PEMD 360" class="h-16 w-auto rounded bg-white object-contain" />
					<a
						href="https://fr.linkedin.com/company/depollution-conseil"
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-2 text-gray-400 transition-colors hover:text-emerald-500"
					>
						<Linkedin class="h-6 w-6" />
						<span class="text-sm">LinkedIn</span>
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Copyright -->
	<div class="border-t border-gray-800 py-4">
		<div class="container mx-auto px-4 text-center text-sm text-gray-500">
			© {new Date().getFullYear()} PEMD 360 - Dépollution Conseil. Tous droits réservés.
		</div>
	</div>
</footer>
