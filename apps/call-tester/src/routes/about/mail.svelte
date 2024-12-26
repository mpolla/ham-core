<script lang="ts">
	import { onMount } from 'svelte';

	export const ssr = false;
	export const prerender = false;
	export const csr = true;

	let mail = $state('');

	onMount(() => {
		mail = ['si', '.', 'hamradio', '@', 's52kj'].reverse().join('');
	});
</script>

<a href={`mailto:${mail}`}>{mail}</a>
