<script lang="ts">
	import { logbookStore } from '$lib/stores/logbook-store';
	import type { IQso } from '$lib/supabase';
	import { dxccEntities, findDxcc } from 'fast-dxcc';
	import { selectedStore, setSelected, setSelectedAll } from './selected-store';

	function formatDT(dt: string): string {
		const dtp = new Date(dt).toISOString();
		const date = dtp.slice(0, 10);
		const time = dtp.slice(11, 16);
		return `${date} ${time}`;
	}

	$: someSelected = $logbookStore.result?.qsos.some((q) => $selectedStore.has(q.id));
	$: allSelected =
		someSelected && $logbookStore.result?.qsos.every((q) => $selectedStore.has(q.id));

	function getCountry(qso: IQso): string {
		if (qso.country) {
			return qso.country;
		}
		if (qso.dxcc) {
			const dxccs = [...dxccEntities.values()].filter((d) => d.dxcc === qso.dxcc);
			if (dxccs.length === 1) return dxccs[0].name;
		}
		return findDxcc(qso.call)?.entity.name ?? '';
	}
</script>

<div class="overflow-x-auto">
	<table class="table mx-auto w-full">
		<thead>
			<tr>
				<th>
					{#if $logbookStore.result}
						<input
							type="checkbox"
							class="checkbox"
							indeterminate={someSelected && !allSelected}
							checked={allSelected}
							on:change={(v) =>
								setSelectedAll(
									$logbookStore.result?.qsos.map((q) => q.id),
									v.currentTarget.checked
								)}
						/>
					{/if}
				</th>
				<th>Date & Time</th>
				<th>Call</th>
				<th class="text-center">Mode</th>
				<th class="text-right">Frequency</th>
				<th class="text-center">Band</th>
				<th>Country</th>
			</tr>
		</thead>
		<tbody>
			{#if $logbookStore.result === undefined}
				<tr><td colspan="7" class="text-center">Loading...</td></tr>
			{:else if $logbookStore.result.hasError}
				<tr><td colspan="7" class="text-center">Error loading QSOs</td></tr>
			{:else if $logbookStore.result.qsos.length === 0}
				<tr><td colspan="7" class="text-center">No QSOs found</td></tr>
			{:else}
				{#each $logbookStore.result.qsos as qso, i}
					<tr>
						<th class="relative text-center">
							<span>{i + 1}</span>
							<div
								class={`absolute inset-0 transition-opacity hover:opacity-100 ${$selectedStore.size ? 'opacity-100' : 'opacity-0'}`}
							>
								<input
									type="checkbox"
									class="checkbox absolute inset-0 m-auto bg-base-100"
									checked={$selectedStore.has(qso.id)}
									on:change={(v) => setSelected(qso.id, v.currentTarget.checked)}
								/>
							</div>
						</th>
						<td class="min-w-32">{formatDT(qso.datetime)}</td>
						<td class="font-mono">{qso.call}</td>
						<td class="text-center">{qso.mode}</td>
						<td class="text-right font-mono">
							{(qso.frequency / 1e6).toFixed(3)}
						</td>
						<td class="text-center">
							<span class={`band band${qso.band}`}>{qso.band}</span>
						</td>
						<td class="w-1/5 min-w-32 max-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
							{getCountry(qso)}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style lang="postcss">
	span.band {
		@apply badge font-medium text-black;
	}
	span.band160m {
		background-color: rgba(120, 221, 20, 0.9);
	}
	span.band80m {
		background-color: rgba(241, 117, 241, 0.9);
	}
	span.band60m {
		background-color: rgb(184, 112, 247);
	}
	span.band40m {
		background-color: rgb(111, 149, 253);
	}
	span.band30m {
		background-color: rgba(98, 217, 98, 0.9);
	}
	span.band20m {
		background-color: rgba(242, 196, 12, 0.9);
	}
	span.band17m {
		background-color: rgba(242, 242, 97, 0.9);
	}
	span.band15m {
		background-color: rgba(204, 161, 102, 0.9);
	}
	span.band12m {
		background-color: rgb(194, 66, 66);
	}
	span.band10m {
		background-color: rgba(255, 105, 180, 0.9);
	}
	span.band6m {
		background-color: rgba(255, 63, 63, 0.9);
	}
	span.band4m {
		background-color: rgba(204, 0, 68, 0.9);
	}
	span.band2m {
		background-color: rgba(255, 20, 147, 0.9);
	}
	span.band70cm {
		background-color: rgba(153, 153, 0, 0.9);
	}
</style>
