<script lang="ts">
	import { Home, Mail, Phone, MapPin } from 'lucide-svelte';

	let formData = $state({
		name: '',
		email: '',
		phone: '',
		subject: '',
		message: ''
	});

	let isSubmitting = $state(false);
	let submitStatus = $state<'idle' | 'success' | 'error'>('idle');

	const contactInfo = [
		{
			icon: 'envelope',
			label: 'Email',
			value: 'florent.mouriot@depollution-conseil.fr',
			href: 'mailto:florent.mouriot@depollution-conseil.fr'
		},
		{
			icon: 'phone',
			label: 'Téléphone',
			value: '06 31 32 67 15',
			href: 'tel:+33631326715'
		},
		{
			icon: 'location',
			label: 'Adresse',
			value: '7 rue Montespan 91000, Évry-Courcouronnes',
			href: 'https://maps.google.com/?q=7+rue+Montespan+91000+Évry-Courcouronnes'
		}
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitStatus = 'idle';

		try {
			// Simuler l'envoi du formulaire
			await new Promise((resolve) => setTimeout(resolve, 1000));
			submitStatus = 'success';
			formData = { name: '', email: '', phone: '', subject: '', message: '' };
		} catch {
			submitStatus = 'error';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contact - PEMD 360</title>
	<meta
		name="description"
		content="Contactez Dépollution Conseil pour vos projets de diagnostic PEMD. Nous sommes à votre écoute."
	/>
</svelte:head>

<!-- Hero Banner -->
<section
	class="relative bg-cover bg-center py-16"
	style="background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80&auto=format&fit=crop')"
>
	<div class="absolute inset-0 bg-black/60"></div>
	<div class="container relative z-10 mx-auto px-4 text-white">
		<h1 class="mb-4 text-4xl font-bold md:text-5xl">Contact</h1>
		<nav aria-label="Fil d'Ariane">
			<ol class="flex items-center gap-2 text-sm">
				<li>
					<a href="/" class="flex items-center gap-2 transition-colors hover:text-emerald-400">
						<Home class="h-4 w-4" />
						Accueil
					</a>
				</li>
				<li class="text-gray-400">/</li>
				<li class="text-emerald-400">Contact</li>
			</ol>
		</nav>
	</div>
</section>

<!-- Contact Section -->
<section class="py-16 lg:py-24">
	<div class="container mx-auto px-4">
		<div class="grid gap-12 lg:grid-cols-1">
			<!-- Contact Info -->
			<div>
				<span
					class="mb-2 inline-block text-sm font-semibold uppercase tracking-wider text-emerald-600"
				>
					Contactez-nous
				</span>
				<h2 class="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
					Nous sommes à votre écoute
				</h2>
				<p class="mb-8 text-gray-600">
					Vous avez un projet de démolition ou de rénovation significative ? N'hésitez pas à nous
					contacter pour obtenir un devis ou des informations sur nos services de diagnostic PEMD.
				</p>

				<!-- Contact Details -->
				<div class="space-y-6">
					{#each contactInfo as info}
						<a
							href={info.href}
							target={info.icon === 'location' ? '_blank' : undefined}
							rel={info.icon === 'location' ? 'noopener noreferrer' : undefined}
							class="flex items-start gap-4 rounded-lg p-4 transition-colors hover:bg-gray-50"
						>
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
							>
								{#if info.icon === 'envelope'}
									<Mail class="h-5 w-5" />
								{:else if info.icon === 'phone'}
									<Phone class="h-5 w-5" />
								{:else}
									<MapPin class="h-5 w-5" />
								{/if}
							</div>
							<div>
								<h5 class="font-semibold text-gray-900">{info.label}</h5>
								<p class="text-gray-600">{info.value}</p>
							</div>
						</a>
					{/each}
				</div>

				<!-- Map -->
				<div class="mt-8 overflow-hidden rounded-lg shadow-lg">
					<iframe
						title="Localisation Dépollution Conseil"
						src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2638.5!2d2.4297!3d48.6247!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDM3JzI5LjAiTiAywrAyNSc0Ni45IkU!5e0!3m2!1sfr!2sfr!4v1234567890"
						width="100%"
						height="250"
						style="border:0;"
						allowfullscreen
						loading="lazy"
						referrerpolicy="no-referrer-when-downgrade"
					></iframe>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="bg-emerald-600 py-12">
	<div class="container mx-auto px-4">
		<div
			class="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left"
		>
			<div class="text-white">
				<h2 class="mb-2 text-2xl font-bold md:text-3xl">Besoin d'un diagnostic PEMD ?</h2>
				<p class="text-emerald-100">
					Notre équipe est disponible pour répondre à toutes vos questions.
				</p>
			</div>
			<a
				href="tel:+33631326715"
				class="shrink-0 rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-emerald-700"
			>
				Appelez-nous : 06 31 32 67 15
			</a>
		</div>
	</div>
</section>
