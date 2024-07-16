<script lang="ts">
	import { logbookStore, prevPage, nextPage, firstPage, lastPage } from '$lib/stores/logbook-store';

	function formatDT(dt: string): string {
		const dtp = new Date(dt).toISOString();
		const date = dtp.slice(0, 10);
		const time = dtp.slice(11, 16);
		return `${date} ${time}`;
	}

	$: offset = $logbookStore.params.offset;
	$: limit = $logbookStore.params.limit;
</script>

{#if $logbookStore.result === undefined}
	<div>Loading...</div>
{:else if $logbookStore.result.hasError}
	<div>Error loading QSOs</div>
{:else if $logbookStore.result.qsos.length === 0}
	<div>No QSOs found</div>
{:else}
	{@const { qsos, total_qsos } = $logbookStore.result}
	<div class="mx-auto flex w-full max-w-3xl items-center gap-2 rounded bg-base-300 px-2 py-1">
		<button class="btn btn-sm" disabled={offset === 0} on:click={() => firstPage()}>First</button>
		<button class="btn btn-sm" disabled={offset === 0} on:click={() => prevPage()}>Prev</button>
		<div class="flex-1 text-center">
			{offset + 1} - {Math.min(offset + limit, total_qsos)}
			<span class="text-sm opacity-80">of</span>
			{total_qsos}
			<span class="text-sm opacity-80">total</span>
		</div>
		<button class="btn btn-sm" disabled={qsos.length < limit} on:click={() => nextPage()}>
			Next
		</button>
		<button class="btn btn-sm" disabled={qsos.length < limit} on:click={() => lastPage()}>
			Last
		</button>
	</div>

	<div class="overflow-x-auto">
		<table class="table mx-auto w-full max-w-3xl">
			<thead>
				<tr>
					<th></th>
					<th>Date & Time</th>
					<th>Call</th>
					<th class="text-center">Mode</th>
					<th class="text-right">Frequency</th>
					<th>Band</th>
					<th>Country</th>
				</tr>
			</thead>
			<tbody>
				{#each qsos as qso, i}
					<tr>
						<td>{i + 1}</td>
						<td>{formatDT(qso.datetime)}</td>
						<td class="font-mono">{qso.call}</td>
						<td class="text-center">{qso.mode}</td>
						<td class="text-right font-mono">
							{(qso.frequency / 1e6).toFixed(3)}
						</td>
						<td>
							<span class={`band band${qso.band}`}>{qso.band}</span>
						</td>
						<td class="w-1/5 max-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
							{qso.country}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

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
	span.band11m {
		background-color: rgba(0, 255, 0, 0.9);
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
	span.band1_25m {
		background-color: rgba(204, 255, 0, 0.9);
	}
	span.band70cm {
		background-color: rgba(153, 153, 0, 0.9);
	}
	span.band23cm {
		background-color: rgba(90, 184, 199, 0.9);
	}
</style>
