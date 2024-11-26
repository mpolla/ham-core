<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { setUserContext } from '$lib/states/user-state.svelte';

	setUserContext();

	let { children }: { children?: Snippet } = $props();
</script>

<svelte:head>
	<title>Ham Log</title>
</svelte:head>

{@render children?.()}
