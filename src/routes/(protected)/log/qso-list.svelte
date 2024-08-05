<script lang="ts">
	import { logbookStore } from '$lib/stores/logbook-store';
	import type { IQso } from '$lib/supabase';
	import { dxccEntities, findDxcc } from 'fast-dxcc';
	import { selectedStore, setSelected, setSelectedAll } from './selected-store';
	import Loading from '$lib/components/loading.svelte';
	import Error from '$lib/components/error.svelte';

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

	$: qsoLimit = $logbookStore.params.limit;
</script>

<div class="relative">
	{#if $logbookStore.result?.isLoading}
		<div
			class="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-black/60 px-10 py-14"
		>
			<div class="sticky top-32 font-semibold">
				<Loading />
			</div>
		</div>
	{/if}
	{#if $logbookStore.result?.hasError}
		<div
			class="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-black/60 px-10 py-14"
		>
			<div class="sticky top-32 font-semibold">
				<Error text="Error loading QSOs" />
			</div>
		</div>
	{/if}
	<div class="overflow-x-auto">
		<table class="table mx-auto w-full">
			<thead>
				<tr>
					<th>
						{#if $logbookStore.result?.qsos.length}
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
				{#each $logbookStore.result?.qsos ?? [] as qso, i}
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
				{#each Array(Math.max(qsoLimit - ($logbookStore.result?.qsos.length ?? 0), 0)) as _}
					<tr><td colspan="7">&ZeroWidthSpace;</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
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
