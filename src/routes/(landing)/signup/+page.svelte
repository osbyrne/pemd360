<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import logoPEMD from '$lib/assets/pemd360.png';
	import { AlertError } from '$lib/components';
	import { User, AtSign, Lock, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-svelte';

	let { form }: { form?: { error?: string; success?: boolean } } = $props();

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	// Password strength indicator
	const passwordStrength = $derived.by(() => {
		if (!password) return { level: 0, text: '', color: '' };
		let strength = 0;
		if (password.length >= 8) strength++;
		if (password.length >= 12) strength++;
		if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^a-zA-Z0-9]/.test(password)) strength++;

		if (strength <= 2) return { level: 1, text: 'Faible', color: 'bg-red-500' };
		if (strength <= 3) return { level: 2, text: 'Moyen', color: 'bg-yellow-500' };
		return { level: 3, text: 'Fort', color: 'bg-emerald-500' };
	});

	// Afficher les erreurs du serveur
	$effect(() => {
		if (form?.error) {
			error = form.error;
		} else if (form?.success) {
			goto('/login');
		}
	});

	function validateForm() {
		error = '';

		if (!name || !email || !password) {
			error = 'Tous les champs sont requis';
			return false;
		}

		if (password !== confirmPassword) {
			error = 'Les mots de passe ne correspondent pas';
			return false;
		}

		if (password.length < 8) {
			error = 'Le mot de passe doit contenir au moins 8 caractères';
			return false;
		}

		return true;
	}
</script>

<div
	class="min-h-screen flex items-center justify-center bg-linear-to-br from-emerald-50 via-white to-emerald-50 px-4 py-12"
>
	<div class="w-full max-w-md">
		<!-- Logo -->
		<div class="mb-8 text-center">
			<a href="/" class="inline-block">
				<img src={logoPEMD} alt="PEMD 360" class="mx-auto h-20 w-auto" />
			</a>
		</div>

		<!-- Card -->
		<div class="rounded-2xl p-8 shadow-xl">
			<div class="mb-8">
				<h1 class="text-3xl font-bold">Créer un compte</h1>
				<p class="mt-2">Rejoignez PEMD 360 dès aujourd'hui</p>
			</div>

			{#if error}
				<AlertError message={error} />
			{/if}

			<form
				method="POST"
				use:enhance={() => {
					if (!validateForm()) {
						return async ({ update }) => {
							await update({ reset: false });
						};
					}
					loading = true;
					return async ({ result, update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-5"
			>
				<div>
					<label for="name" class="mb-2 block text-sm font-medium"> Nom complet </label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<User class="h-5 w-5" />
						</div>
						<input
							id="name"
							name="name"
							type="text"
							placeholder="Jean Dupont"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={name}
							required
						/>
					</div>
				</div>

				<div>
					<label for="email" class="mb-2 block text-sm font-medium"> Adresse email </label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<AtSign class="h-5 w-5" />
						</div>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="vous@exemple.com"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={email}
							required
						/>
					</div>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium"> Mot de passe </label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Lock class="h-5 w-5" />
						</div>
						<input
							id="password"
							name="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="Minimum 8 caractères"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={password}
							required
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 hover:"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
					{#if password}
						<div class="mt-2">
							<div class="flex items-center justify-between text-xs mb-1">
								<span>Force du mot de passe</span>
								<span class="font-medium">{passwordStrength.text}</span>
							</div>
							<div class="flex gap-1">
								{#each Array(3) as _, i}
									<div class="h-1 flex-1 rounded-full">
										<div
											class="h-full rounded-full transition-all {i < passwordStrength.level
												? passwordStrength.color
												: ''}"
											style="width: 100%"
										></div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div>
					<label for="confirmPassword" class="mb-2 block text-sm font-medium">
						Confirmer le mot de passe
					</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<CheckCircle class="h-5 w-5" />
						</div>
						<input
							id="confirmPassword"
							type={showConfirmPassword ? 'text' : 'password'}
							placeholder="Confirmer votre mot de passe"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={confirmPassword}
							required
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 hover:"
							onclick={() => (showConfirmPassword = !showConfirmPassword)}
						>
							{#if showConfirmPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
				</div>

				<button
					type="submit"
					class="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
					disabled={loading}
				>
					{#if loading}
						<Loader2 class="h-5 w-5 animate-spin" />
						<span>Inscription en cours...</span>
					{:else}
						<span>Créer mon compte</span>
					{/if}
				</button>
			</form>

			<div class="mt-8 text-center">
				<p class="text-sm">
					Vous avez déjà un compte ?
					<a href="/login" class="font-semibold text-emerald-600 hover:text-emerald-700">
						Se connecter
					</a>
				</p>
			</div>
		</div>

		<!-- Footer -->
		<div class="mt-8 text-center">
			<a href="/" class="text-sm hover:text-emerald-600"> ← Retour à l'accueil </a>
		</div>
	</div>
</div>
