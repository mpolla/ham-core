<script lang="ts">
	import { page } from '$app/stores';
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import type { IQso } from '$lib/supabase';
	import { dxccEntities, findDxcc } from '@ham-core/fast-dxcc';
	import { getSelectedQsosContext } from '$lib/states/selected-state.svelte';
	import Loading from '$lib/components/loading.svelte';
	import Error from '$lib/components/error.svelte';
	import Fa from 'svelte-fa';
	import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
	import QsoModal from './qso-modal.svelte';
	import { pushState } from '$app/navigation';
	import BandBadge from '$lib/components/band-badge.svelte';

	const logbook = getLogbookContext();
	const selected = getSelectedQsosContext();

	function formatDT(dt: string): string {
		const dtp = new Date(dt).toISOString();
		const date = dtp.slice(0, 10);
		const time = dtp.slice(11, 16);
		return `${date} ${time}`;
	}

	const someSelected = $derived(logbook.qsos.some((q) => selected.state.has(q.id)));
	const allSelected = $derived(someSelected && logbook.qsos.every((q) => selected.state.has(q.id)));

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

<div class="relative">
	{#if logbook.isLoading}
		<div
			class="absolute inset-0 z-10 flex items-start justify-center rounded-lg bg-black/60 px-10 py-14"
		>
			<div class="sticky top-32 font-semibold">
				<Loading />
			</div>
		</div>
	{/if}
	{#if logbook.hasError}
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
						{#if logbook.qsos.length}
							<input
								type="checkbox"
								class="checkbox"
								indeterminate={someSelected && !allSelected}
								checked={allSelected}
								onchange={(v) =>
									selected.setMany(
										logbook.qsos.map((q) => q.id),
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
				{#each logbook.qsos as qso, i}
					<tr>
						<th class="relative text-center">
							<span>{i + 1}</span>
							<div
								class="absolute inset-0 transition-opacity hover:opacity-100 {selected.state.size
									? 'opacity-100'
									: 'opacity-0'}"
							>
								<input
									type="checkbox"
									class="checkbox absolute inset-0 m-auto bg-base-100"
									checked={selected.state.has(qso.id)}
									onchange={(v) => selected.setOne(qso.id, v.currentTarget.checked)}
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
							<BandBadge {qso} />
						</td>
						<td class="w-1/5 min-w-32 max-w-0 overflow-hidden overflow-ellipsis whitespace-nowrap">
							{getCountry(qso)}
						</td>
						<td>
							<button
								class="btn btn-circle btn-ghost btn-sm"
								onclick={() => pushState('', { showQsoModal: qso.id })}
							>
								<Fa icon={faInfoCircle} />
							</button>
						</td>
					</tr>
				{/each}
				{#each { length: Math.max(logbook.limit - logbook.qsos.length, 0) }}
					<tr><td colspan="7">&ZeroWidthSpace;</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if $page.state.showQsoModal}
	<QsoModal />
{/if}
