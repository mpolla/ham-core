<script lang="ts">
	import { getLogsContext } from '$lib/states/logs-state.svelte';
	import { getQsos, type IQso } from '$lib/supabase';
	import { getSelectedQsosContext } from '$lib/states/selected-state.svelte';
	import { generateText } from '.';
	import { faDownload } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import Loading from '$lib/components/loading.svelte';
	import Error from '$lib/components/error.svelte';
	import DownloadButton from '$lib/components/download-button.svelte';

	const logs = getLogsContext();
	const selected = getSelectedQsosContext();

	let qsos = $state<IQso[] | null | undefined>(undefined);

	$effect(() => {
		getQsos()
			.in('id', [...selected.state])
			.then(({ data, error }) => {
				if (error) {
					console.error('Error loading QSOs', error);
					qsos = null;
				} else {
					qsos = data;
				}
			});
	});

	const downloadContent = $derived(
		qsos && logs.logs && selected.state.size > 0 ? generateText(qsos, logs.logs) : undefined
	);
</script>

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
				<th>RST Sent</th>
				<th>RST Rcvd</th>
			</tr>
		</thead>
		<tbody>
			{#if qsos === undefined}
				<tr><td colspan="8" class="text-center"><Loading /></td></tr>
			{:else if qsos === null}
				<tr><td colspan="8" class="text-center"><Error text="Error loading QSOs" /></td></tr>
			{:else}
				{#each qsos as qso}
					{@const dt = new Date(qso.datetime)}
					<tr>
						<td>{logs.logs?.find((l) => l.id === qso.log_id)?.call}</td>
						<td>{qso.call}</td>
						<td>{dt.toISOString().slice(0, 10)}</td>
						<td>{dt.toISOString().slice(11, 16)}</td>
						<td>{(qso.frequency / 1000000).toFixed(3)}</td>
						<td>{qso.mode}</td>
						<td>{qso.rst_sent}</td>
						<td>{qso.rst_rcvd}</td>
					</tr>
				{:else}
					<tr><td colspan="8" class="text-center">No QSOs found</td></tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<DownloadButton content={downloadContent} filename="export.adi" class="btn btn-primary mt-4">
	<Fa icon={faDownload} />
	<span>Download ADI file</span>
</DownloadButton>
