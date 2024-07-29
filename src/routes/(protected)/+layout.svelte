<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signOut, userStore } from '$lib/stores/user-store';
	import Fa from 'svelte-fa';
	import { faUser } from '@fortawesome/free-solid-svg-icons';
	import Clock from '$lib/components/clock.svelte';

	$: if ($userStore === null) {
		const p = $page.url.pathname;
		const r = p.match(/^\/(?:log)?$/) ? '' : `?redirect=${p}`;
		goto(`/login${r}`);
	}
</script>

<div class="navbar justify-between bg-base-100 shadow-xl">
	<a href="/" class="btn btn-ghost text-xl">HAM Log</a>

	<Clock />

	<div class="flex-none">
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost">
				<Fa icon={faUser} />
				<div>{$userStore?.info?.call}</div>
			</div>
			<ul class="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow">
				<li><button on:click={signOut} class="text-red-300">Logout</button></li>
			</ul>
		</div>
	</div>
</div>

<div class="container py-10">
	<slot />
</div>
