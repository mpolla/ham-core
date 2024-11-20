<script lang="ts">
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';

	let logbook = getLogbookContext();
	const offset = $derived(logbook.offset);
	const limit = $derived(logbook.limit);
	const qsos = $derived(logbook.qsos);
	const total_qsos = $derived(logbook.total_qsos);
</script>

<div class="sticky top-4 z-10 flex items-center gap-2 rounded-lg bg-base-300 px-2 py-2">
	<button class="btn btn-sm" disabled={offset === 0} onclick={() => (logbook.offset = 0)}>
		First
	</button>
	<button class="btn btn-sm" disabled={offset === 0} onclick={() => (logbook.offset -= limit)}>
		Prev
	</button>
	{#if total_qsos > 0}
		<div class="flex-1 text-center">
			{offset + 1} - {Math.min(offset + limit, total_qsos)}
			<span class="text-sm opacity-80">of</span>
			{total_qsos}&nbsp;<span class="text-sm opacity-80">total</span>
		</div>
	{:else}
		<div class="flex-1 text-center text-sm opacity-80">No QSOs</div>
	{/if}
	<button
		class="btn btn-sm"
		disabled={qsos.length < limit}
		onclick={() => (logbook.offset += limit)}
	>
		Next
	</button>
	<button class="btn btn-sm" disabled={qsos.length < limit} onclick={() => logbook.lastPage()}>
		Last
	</button>
</div>
