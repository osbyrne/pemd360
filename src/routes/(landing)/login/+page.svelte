<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { AlertError } from '$lib/components';
	import { AtSign, Lock, Eye, EyeOff, Loader2 } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	async function handleLogin() {
		error = '';

		if (!email || !password) {
			error = 'Tous les champs sont requis';
			return;
		}

		loading = true;

		try {
			const response = await authClient.signIn.email({
				email,
				password
			});

			if (response.error) {
				error = response.error.message || 'Email ou mot de passe incorrect';
			} else {
				// Connexion réussie, rediriger vers le tableau de bord
				goto('/app/projets');
			}
		} catch (e) {
			error = 'Une erreur est survenue. Veuillez réessayer.';
			console.error(e);
		} finally {
			loading = false;
		}
	}
</script>

<div
	class="flex items-start justify-center bg-linear-to-br from-emerald-50 via-white to-emerald-50 px-4 pt-12 pb-4"
>
	<div class="w-full max-w-md mb-4">
		<!-- Card -->
		<div class="rounded-2xl bg-white p-8 shadow-xl">
			<div class="mb-6">
				<h1 class="text-3xl font-bold text-gray-900">Bienvenue</h1>
				<p class="mt-2 text-gray-600">Connectez-vous à votre compte</p>
			</div>

			{#if error}
				<AlertError message={error} />
			{/if}

			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleLogin();
				}}
				class="space-y-6"
			>
				<div>
					<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
						Adresse email
					</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<AtSign class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="email"
							type="email"
							placeholder="vous@exemple.com"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={email}
							required
						/>
					</div>
				</div>

				<div>
					<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
						Mot de passe
					</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<Lock class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							placeholder="••••••••"
							class="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
							bind:value={password}
							required
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
							onclick={() => (showPassword = !showPassword)}
						>
							{#if showPassword}
								<EyeOff class="h-5 w-5" />
							{:else}
								<Eye class="h-5 w-5" />
							{/if}
						</button>
					</div>
				</div>

				<button type="submit" class="btn" disabled={loading}>
					{#if loading}
						<Loader2 class="h-5 w-5 animate-spin" />
						<span>Connexion en cours...</span>
					{:else}
						<span>Se connecter</span>
					{/if}
				</button>
			</form>
		</div>

		<!-- Footer -->
		<div class="mt-2 text-center">
			<a href="/" class="text-sm text-gray-600 hover:text-emerald-600"> ← Retour à l'accueil </a>
		</div>
	</div>
</div>
