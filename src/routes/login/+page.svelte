<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn, userStore } from '$lib/stores/user-store';

	userStore.subscribe((value) => {
		if (value) {
			const redirect = $page.url.searchParams.get('redirect');
			if (redirect) {
				goto(redirect);
			} else {
				goto('/');
			}
		}
	});

	let email = '';
	let password = '';

	function onSubmit() {
		signIn(email, password);
	}
</script>

<div class="mx-auto w-full max-w-md rounded-xl bg-base-200 p-6">
	<h1 class="mb-6 text-center text-4xl">Login</h1>

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
