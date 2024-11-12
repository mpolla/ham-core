<script lang="ts">
	import { connectWsjt, disconnectWsjt, wsjtStore } from '$lib/stores/wsjt-store';
	import { faCircle } from '@fortawesome/free-solid-svg-icons';
	import { isTauri } from '@tauri-apps/api/core';
	import Fa from 'svelte-fa';

	function toggleWsjt() {
		if ($wsjtStore.connected) {
			disconnectWsjt();
		} else {
			connectWsjt();
		}
	}
</script>

{#if isTauri()}
	<button class="btn btn-xs mt-2" on:click={toggleWsjt}>
		<Fa icon={faCircle} class={$wsjtStore.connected ? 'text-primary' : ''} />
		<span>WSJT-X</span>
	</button>
{/if}
