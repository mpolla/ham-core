<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signOut, userStore } from '$lib/stores/user-store';

	userStore.subscribe((value) => {
		if (value === null) {
			goto(`/login?redirect=${$page.url}`);
		}
	});
</script>

<div class="navbar justify-between bg-base-100 shadow-xl">
	<a href="/" class="btn btn-ghost text-xl">HAM Log</a>
	<div>{$userStore?.info?.call}</div>
	<div class="flex-none">
		<ul class="menu menu-horizontal px-1">
			<li><button on:click={signOut} class="btn btn-outline btn-error btn-sm">Logout</button></li>
		</ul>
	</div>
</div>

<div class="container py-10">
	<slot />
</div>
