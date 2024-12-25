<script lang="ts">
	import { getWsjtContext } from '$lib/states/wsjt-state.svelte';
	import { faCircle } from '@fortawesome/free-solid-svg-icons';
	import { isTauri } from '@tauri-apps/api/core';
	import Fa from 'svelte-fa';

	const wsjt = getWsjtContext();

	function toggleWsjt() {
		if (wsjt.connected) {
			wsjt.disconnect();
		} else {
			wsjt.connect();
		}
	}
</script>

{#if isTauri()}
	<button class="btn btn-xs mt-2" onclick={toggleWsjt}>
		<Fa icon={faCircle} class={wsjt.connected ? 'text-primary' : ''} />
		<span>WSJT-X</span>
	</button>
{/if}
