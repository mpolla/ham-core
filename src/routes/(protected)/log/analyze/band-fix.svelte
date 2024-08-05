<script lang="ts">
	import { logbookStore } from '$lib/stores/logbook-store';
	import { supabase, type IQso } from '$lib/supabase';
	import Error from '$lib/components/error.svelte';
	import Success from '$lib/components/success.svelte';
	import Loading from '$lib/components/loading.svelte';
	import { Band } from '$lib/models/band';

	$: logbookId = $logbookStore.params.logId;

	let missingBand: Map<Band | null, IQso[]> | undefined = undefined;

	let contReq = supabase.from('qso').select('*').is('band', null);
	if (logbookId) contReq = contReq.eq('log_id', logbookId);
	contReq.then(({ data }) => {
		missingBand = new Map();
		for (const qso of data ?? []) {
			const band = Band.getBand(qso.frequency);
			if (!missingBand.has(band)) missingBand.set(band, []);
			missingBand.get(band)!.push(qso);
		}
	});

	let contFix: 'ready' | 'inProgress' | 'done' | 'error' = 'ready';
	function fixCont() {
		if (!missingBand) return;
		contFix = 'inProgress';
		Promise.all(
			[...missingBand].map(([band, qsos]) => {
				if (!band) return Promise.resolve();
				const qsoIds = qsos.map((q) => q.id);
				return supabase.from('qso').update({ band: band.name }).in('id', qsoIds).is('band', null);
			})
		).then((r) => {
			for (const q of r.filter((q) => q?.error)) console.error(q!.error);

			if (r.some((r) => r?.error)) {
				contFix = 'error';
			} else {
				contFix = 'done';
			}
		});
	}
</script>

{#if missingBand === undefined}
	<Loading />
{:else if missingBand.size === 0}
	<Success text="No missing bands" />
{:else}
	{#if missingBand.size}
		<div class="max-h-96 overflow-y-auto rounded bg-base-300">
			<table class="table">
				<thead>
					<tr>
						<th>Band</th>
						<th>Frequency</th>
					</tr>
				</thead>
				<tbody>
					{#each missingBand as [band, qsos]}
						<tr>
							<td>{band}</td>
							<td>
								{Math.min(...qsos.map((q) => q.frequency))}
								<span class="opacity-80">-</span>
								{Math.max(...qsos.map((q) => q.frequency))}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if contFix === 'inProgress'}
		<Loading />
	{:else if contFix === 'done'}
		<Success text="Bands fixed" />
	{:else if contFix === 'error'}
		<Error text="Error fixing bands" />
	{:else if contFix === 'ready'}
		<button class="btn btn-primary" on:click={fixCont}>Fix now</button>
	{/if}
{/if}
