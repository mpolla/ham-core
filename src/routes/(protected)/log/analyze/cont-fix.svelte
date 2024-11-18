<script lang="ts">
	import { logbookStore } from '$lib/stores/logbook-store';
	import { getQsos, supabase, type IQso } from '$lib/supabase';
	import { dxccEntities, findDxcc } from 'fast-dxcc';
	import Error from '$lib/components/error.svelte';
	import Success from '$lib/components/success.svelte';
	import Loading from '$lib/components/loading.svelte';

	let logbookId = $derived($logbookStore.params.logId);

	let missingCont: Map<string, IQso[]> | undefined = $state(undefined);
	let conflictCont: { qso: IQso; conts: string[] }[] | undefined = $state(undefined);
	let selectedCont: { [id: string]: string } = $state({});

	$effect(() => {
		let contReq = getQsos().is('cont', null);
		if (logbookId) contReq = contReq.eq('log_id', logbookId);
		contReq.then(({ data }) => {
			missingCont = new Map();
			conflictCont = [];
			for (const qso of data ?? []) {
				const other = qso.other as { CONT?: string } | undefined;
				if (other?.CONT) {
					if (!missingCont.has(other.CONT)) missingCont.set(other.CONT, []);
					missingCont.get(other.CONT)!.push(qso);
					continue;
				}

				const conts = new Set<string>();

				const fromCall = findDxcc(qso.call)?.entity.cont;
				if (fromCall) conts.add(fromCall);
				[...dxccEntities.values()]
					.filter((d) => d.dxcc === qso.dxcc && qso.cont)
					.forEach((d) => conts.add(d.cont!));

				if (conts.size === 1) {
					const cont = conts.values().next().value!;
					if (!missingCont.has(cont)) missingCont.set(cont, []);
					missingCont.get(cont)!.push(qso);
				} else {
					conflictCont.push({ qso, conts: [...conts] });
				}
			}
		});
	});

	let contFix: 'ready' | 'inProgress' | 'done' | 'error' = $state('ready');
	function fixCont() {
		if (!missingCont || !conflictCont) return;
		contFix = 'inProgress';
		for (const { qso } of conflictCont) {
			const cont = selectedCont[qso.id];
			if (!cont) continue;
			if (!missingCont.has(cont)) missingCont.set(cont, []);
			missingCont.get(selectedCont[qso.id])?.push(qso);
		}
		Promise.all(
			[...missingCont].map(([cont, qsos]) => {
				const qsoIds = qsos.map((q) => q.id);
				return supabase.from('qso').update({ cont: cont }).in('id', qsoIds).is('cont', null);
			})
		).then((r) => {
			for (const q of r.filter((q) => q.error)) console.error(q.error);

			if (r.some((r) => r.error)) {
				contFix = 'error';
			} else {
				contFix = 'done';
			}
		});
	}
</script>

{#if missingCont === undefined || conflictCont === undefined}
	<Loading />
{:else if missingCont.size === 0 && conflictCont.length === 0}
	<Success text="No missing continents" />
{:else}
	{#if missingCont.size}
		<div class="max-h-96 overflow-y-auto rounded bg-base-300">
			<table class="table">
				<thead>
					<tr>
						<th>Continent</th>
						<th>Calls ({[...missingCont.values()].reduce((v, c) => v + c.length, 0)})</th>
					</tr>
				</thead>
				<tbody>
					{#each missingCont as [cont, qsos]}
						<tr>
							<td>{cont}</td>
							<td>{[...new Set(qsos.map((q) => q.call))].join(', ')}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if conflictCont.length}
		<div class="max-h-96 overflow-y-auto rounded bg-base-300">
			<table class="table">
				<thead>
					<tr>
						<th>Call</th>
						<th>Continents</th>
					</tr>
				</thead>
				<tbody>
					{#each conflictCont ?? [] as { qso, conts }}
						<tr>
							<td>{qso.call}</td>
							<td>
								<div class="flex gap-2">
									{#each conts.length ? conts : ['EU', 'AS', 'NA', 'SA', 'OC'] as cont}
										<button
											class={`btn btn-sm ${selectedCont[qso.id] === cont ? 'btn-primary' : ''} ${contFix !== 'ready' ? 'btn-disabled' : ''}`}
											onclick={() => (selectedCont[qso.id] = cont)}
										>
											{cont}
										</button>
									{/each}
								</div>
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
		<Success text="Continents fixed" />
	{:else if contFix === 'error'}
		<Error text="Error fixing continents" />
	{:else if contFix === 'ready'}
		<button class="btn btn-primary" onclick={fixCont}>Fix now</button>
	{/if}
{/if}
