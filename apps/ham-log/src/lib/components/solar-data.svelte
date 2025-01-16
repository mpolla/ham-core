<script lang="ts">
	import { SolarClient, type CombinedSolarData } from '$lib/repositories/solar-client';
	import { createTimeState } from '$lib/states/time-state.svelte';

	let solarState = $state<CombinedSolarData>();
	createTimeState(60 * 60 * 1000, true, (d) => {
		SolarClient.create()
			.getAll(d)
			.then((res) => (solarState = res));
	});
</script>

<div class="grid grid-cols-2 gap-x-2 text-right">
	<div>
		<span class="lbl">SFI</span>
		{solarState?.flux.toFixed(0)}
	</div>
	<div>
		<span class="lbl">SN</span>
		{solarState?.SN.toFixed(0)}
	</div>
	<div>
		<span class="lbl">K</span>
		{solarState?.Kp.toFixed(0)}
	</div>
	<div>
		<span class="lbl">A</span>
		{solarState?.Ap.toFixed(0)}
	</div>
</div>

<style lang="postcss">
	.lbl {
		@apply text-xs font-light opacity-80;
	}
</style>
