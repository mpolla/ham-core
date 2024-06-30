<script lang="ts">
	import type { DxccEntity } from '$lib/models/dxcc-entity';

	export let prefix: string;
	export let dxccEntity: DxccEntity;

	$: tz = dxccEntity.timez;
	$: lat = dxccEntity.lat;
	$: long = dxccEntity.long;

	function formatTz(offset: number): string {
		const sign = offset >= 0 ? '+' : '-';
		const hours = Math.floor(Math.abs(offset));
		const minutes = Math.floor((Math.abs(offset) % 1) * 60);
		return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}
</script>

<div>
	<div class="font-mono text-2xl font-medium">{prefix}</div>
	<div>{dxccEntity.name}</div>
</div>
<div>
	<table class="mx-auto w-auto">
		<tr><td>CQ Zone</td><td>{dxccEntity.cqz ?? '?'}</td></tr>
		<tr><td>ITU Zone</td><td>{dxccEntity.ituz ?? '?'}</td></tr>
		<tr><td>Continent</td><td>{dxccEntity.cont ?? '?'}</td></tr>
	</table>
</div>
<div>
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
					{formatTz(tz)}
				{:else}
					?
				{/if}
			</td>
		</tr>
	</table>
</div>

<style lang="postcss">
	td {
		@apply text-left align-baseline;
	}
	td:first-of-type {
		@apply pr-2 text-xs;
	}
	td:last-of-type {
		@apply font-medium;
	}
</style>
