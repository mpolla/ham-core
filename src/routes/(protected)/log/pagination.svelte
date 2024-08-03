<script lang="ts">
	import { logbookStore, prevPage, nextPage, firstPage, lastPage } from '$lib/stores/logbook-store';

	$: offset = $logbookStore.params.offset;
	$: limit = $logbookStore.params.limit;
	$: qsos = $logbookStore.result?.qsos;
</script>

<div class="sticky top-4 z-10 flex items-center gap-2 rounded-lg bg-base-300 px-2 py-2">
	<button class="btn btn-sm" disabled={offset === 0} on:click={() => firstPage()}>First</button>
	<button class="btn btn-sm" disabled={offset === 0} on:click={() => prevPage()}>Prev</button>
	{#if $logbookStore.result}
		{@const total_qsos = $logbookStore.result.total_qsos}
		{#if total_qsos > 0}
			<div class="flex-1 text-center">
				{offset + 1} - {Math.min(offset + limit, total_qsos)}
				<span class="text-sm opacity-80">of</span>
				{total_qsos}&nbsp;<span class="text-sm opacity-80">total</span>
			</div>
		{:else}
			<div class="flex-1 text-center text-sm opacity-80">No QSOs</div>
		{/if}
	{/if}
	<button class="btn btn-sm" disabled={!qsos || qsos.length < limit} on:click={() => nextPage()}>
		Next
	</button>
	<button class="btn btn-sm" disabled={!qsos || qsos.length < limit} on:click={() => lastPage()}>
		Last
	</button>
</div>
