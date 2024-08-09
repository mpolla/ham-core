<script lang="ts">
	import Error from '$lib/components/error.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Success from '$lib/components/success.svelte';
	import { logbookStore } from '$lib/stores/logbook-store';
	import { getQsos, supabase, type IQso } from '$lib/supabase';
	import { dxccEntities, findDxcc } from 'fast-dxcc';

	$: logbookId = $logbookStore.params.logId;

	let missingDxcc: Map<number, IQso[]> | undefined = undefined;

	let dxccReq = getQsos().is('dxcc', null);
	if (logbookId) dxccReq = dxccReq.eq('log_id', logbookId);
	dxccReq.then(({ data }) => {
		missingDxcc = new Map();
		for (const qso of data ?? []) {
			const other = qso.other as { DXCC?: number } | undefined;
			if (other?.DXCC) {
				const dxcc = [...dxccEntities.values()].filter((d) => d.dxcc === other.DXCC);
				if (dxcc.length === 1) {
					if (!missingDxcc.has(other.DXCC)) missingDxcc.set(other.DXCC, []);
					missingDxcc.get(other.DXCC)!.push(qso);
					continue;
				}
			}

			const dxcc = findDxcc(qso.call)?.entity.id;
			if (!dxcc) continue;
			if (!missingDxcc.has(dxcc)) missingDxcc.set(dxcc, []);
			missingDxcc.get(dxcc)!.push(qso);
		}
	});

	let dxccFix: 'ready' | 'inProgress' | 'done' | 'error' = 'ready';
	function fixDxcc() {
		if (!missingDxcc) return;
		dxccFix = 'inProgress';
		Promise.all(
			[...missingDxcc].map(([id, qsos]) => {
				const dxcc = dxccEntities.get(id)!;
				const qsoIds = qsos.map((q) => q.id);
				return supabase
					.from('qso')
					.update({ dxcc: dxcc.dxcc, country: dxcc.name })
					.in('id', qsoIds)
					.is('dxcc', null);
			})
		).then((r) => {
			for (const q of r.filter((q) => q.error)) console.error(q.error);

			if (r.some((r) => r.error)) {
				dxccFix = 'error';
			} else {
				dxccFix = 'done';
			}
		});
	}
</script>

{#if missingDxcc === undefined}
	<Loading />
{:else if missingDxcc.size === 0}
	<Success text="No missing DXCC entities" />
{:else}
	<div class="max-h-96 overflow-y-auto rounded bg-base-300">
		<table class="table">
			<thead>
				<tr>
					<th>DXCC</th>
					<th>Calls ({[...missingDxcc.values()].reduce((v, c) => v + c.length, 0)})</th>
				</tr>
			</thead>
			<tbody>
				{#each missingDxcc as [dxcc, qsos]}
					<tr>
						<td>{dxccEntities.get(dxcc)?.name}</td>
						<td>{[...new Set(qsos.map((q) => q.call))].join(', ')}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if dxccFix === 'inProgress'}
		<Loading />
	{:else if dxccFix === 'done'}
		<Success text="DXCC entities fixed" />
	{:else if dxccFix === 'error'}
		<Error text="Error fixing DXCC entities" />
	{:else if dxccFix === 'ready'}
		<button class="btn btn-primary" on:click={fixDxcc}>Fix now</button>
	{/if}
{/if}
