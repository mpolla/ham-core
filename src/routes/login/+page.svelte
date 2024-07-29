<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn, userStore } from '$lib/stores/user-store';

	$: if ($userStore) {
		const redirect = $page.url.searchParams.get('redirect');
		if (redirect) {
			goto(redirect);
		} else {
			goto('/');
		}
	}

	let email = '';
	let password = '';

	function onSubmit() {
		signIn(email, password);
	}
</script>

<div class="py-16">
	<div class="mb-10">
		<h1 class="text-center text-5xl font-light">Ham Log</h1>
		<h3 class="text-center text-lg font-light">by S52KJ</h3>
	</div>

	<div class="mx-auto w-full max-w-md rounded-xl bg-base-200 p-6">
		<h2 class="mb-6 text-center text-3xl font-light">Login</h2>

		<form on:submit|preventDefault={onSubmit} class="flex flex-col gap-4">
			<input
				type="email"
				class="input input-bordered w-full"
				placeholder="Email"
				bind:value={email}
			/>
			<input
				type="password"
				class="input input-bordered w-full"
				placeholder="Password"
				bind:value={password}
			/>
			<button on:click|preventDefault={onSubmit} class="btn btn-primary">Login</button>
		</form>
	</div>
</div>
