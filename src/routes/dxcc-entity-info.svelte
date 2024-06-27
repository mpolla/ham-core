<script lang="ts">
	import type { DxccEntity } from '$lib/models/dxcc-entity';

	export let prefix: string;
	export let dxccEntity: DxccEntity;

	$: tz = dxccEntity.timez;
</script>

<div>
	<div class="font-mono text-2xl font-medium">{prefix}</div>
	<div>{dxccEntity.name}</div>
</div>
<table class="mx-auto w-auto">
	<tr><td>CQ Zone:</td><td>{dxccEntity.cqz ?? '?'}</td></tr>
	<tr><td>ITU Zone:</td><td>{dxccEntity.ituz ?? '?'}</td></tr>
	<tr><td>Continent:</td><td>{dxccEntity.cont ?? '?'}</td></tr>
</table>
<table class="mx-auto w-auto">
	<tr><td>Latitude:</td><td>{dxccEntity.lat ?? '?'}</td></tr>
	<tr><td>Longitude:</td><td>{dxccEntity.long ?? '?'}</td></tr>
	<tr>
		<td>TZ Offset:</td>
		{#if tz !== undefined}
			<td>{tz >= 0 ? '+' : ''}{tz}h</td>
		{:else}
			<td>?</td>
		{/if}
	</tr>
</table>

<style lang="postcss">
	td:first-of-type {
		@apply pr-2 text-right text-xs;
	}
	td:last-of-type {
		@apply text-left font-medium;
	}
</style>
