<script lang="ts">
	import { logsStore } from '$lib/stores/logs-store';
	import { supabase, type IQso } from '$lib/supabase';
	import { writable } from 'svelte/store';
	import { selectedStore } from '../selected-store';
	import { generateText, generateUrl } from '.';
	import { faDownload } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	type QsoStore = IQso[] | null | undefined;

	const qsosStore = writable<QsoStore>(undefined);

	$: supabase
		.from('qso')
		.select('*')
		.in('id', [...$selectedStore])
		.then(({ data, error }) => {
			if (error) {
				console.error('Error loading QSOs', error);
				qsosStore.set(null);
			} else {
				qsosStore.set(data);
			}
		});

	$: downloadUrl =
		$qsosStore && $logsStore && $selectedStore.size > 0
			? generateUrl(generateText($qsosStore, $logsStore))
			: undefined;
</script>

<h1 class="mb-8 text-3xl font-light">QSL CSV</h1>

<div class="max-h-80 overflow-auto rounded-lg bg-base-300">
	<table class="table">
		<thead class="sticky top-0 bg-base-300">
			<tr>
				<th>Station</th>
				<th>Call</th>
				<th>Date</th>
				<th>Time</th>
				<th>Frequency</th>
				<th>Mode</th>
				<th>RST</th>
				<th>Power</th>
			</tr>
		</thead>
		<tbody>
			{#if $qsosStore === undefined}
				<tr><td colspan="8" class="text-center">Loading...</td></tr>
			{:else if $qsosStore === null}
				<tr><td colspan="8" class="text-center">Error loading QSOs</td></tr>
			{:else if $qsosStore.length === 0}
				<tr><td colspan="8" class="text-center">No QSOs found</td></tr>
			{:else}
				{#each $qsosStore as qso}
					{@const dt = new Date(qso.datetime)}
					<tr>
						<td>{$logsStore?.find((l) => l.id === qso.log_id)?.call}</td>
						<td>{qso.call}</td>
						<td>{dt.toISOString().slice(0, 10)}</td>
						<td>{dt.toISOString().slice(11, 16)}</td>
						<td>{(qso.frequency / 1000000).toFixed(3)}</td>
						<td>{qso.mode}</td>
						<td>{qso.rst_sent}</td>
						<td>{qso.power ?? '?'} W</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

{#if downloadUrl}
	<a href={downloadUrl} download="qsl.csv" class="btn btn-primary mt-4">
		<Fa icon={faDownload} />
		<span>Download QSL CSV</span>
	</a>
{:else}
	<button class="btn btn-primary mt-4" disabled>
		<Fa icon={faDownload} />
		<span>Download QSL CSV</span>
	</button>
{/if}
