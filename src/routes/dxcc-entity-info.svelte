<script lang="ts">
	import type { DxccEntity } from '$lib/models/dxcc-entity';

	export let prefix: string;
	export let dxccEntity: DxccEntity;

	$: tz = dxccEntity.timez;
	$: lat = dxccEntity.lat;
	$: long = dxccEntity.long;
</script>

<div>
	<div class="font-mono text-2xl font-medium">{prefix}</div>
	<div>{dxccEntity.name}</div>
</div>
<table class="mx-auto w-auto">
	<tr><td>CQ Zone</td><td>{dxccEntity.cqz ?? '?'}</td></tr>
	<tr><td>ITU Zone</td><td>{dxccEntity.ituz ?? '?'}</td></tr>
	<tr><td>Continent</td><td>{dxccEntity.cont ?? '?'}</td></tr>
</table>
<table class="mx-auto w-auto">
	<tr>
		<td>Latitude</td>
		<td>
			{#if lat !== undefined}
				{Math.abs(lat)}°{lat >= 0 ? 'N' : 'S'}
			{:else}
				?
			{/if}
		</td>
	</tr>
	<tr>
		<td>Longitude</td>
		<td>
			{#if long !== undefined}
				{Math.abs(long)}°{long >= 0 ? 'W' : 'E'}
			{:else}
				?
			{/if}
		</td>
	</tr>
	<tr>
		<td>TZ Offset</td>
		<td>
			{#if tz !== undefined}
				{tz >= 0 ? '+' : '-'}{Math.abs(tz).toFixed(2).padStart(5, '0').replace('.', ':')}
			{:else}
				?
			{/if}
		</td>
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
