<script lang="ts">
	import { removeDupes } from '$lib';
	import DownloadButton from '$lib/components/download-button.svelte';
	import { parseAdifFile, writeAdifFile, type AdifRecord } from '@ham-core/adif';

	let files = $state<FileList | null>();
	const parsed = $derived.by(() => {
		if (!files) return;

		return Promise.all([...files].map((f) => f.text().then((t) => parseAdifFile(t))));
	});

	function toAdifString(qsos: AdifRecord[]): string {
		return writeAdifFile(
			{
				header: {
					ADIF_VER: '3.1.5',
					CREATED_TIMESTAMP: new Date()
						.toISOString()
						.slice(0, 19)
						.replace('T', ' ')
						.replaceAll(/-|:/g, ''),
					PROGRAMID: 'ADIF Tools'
				},
				records: qsos
			},
			{
				fieldSep: ' ',
				rowSep: '\n'
			}
		);
	}
</script>

<input type="file" class="file-input file-input-bordered mb-4" bind:files multiple={true} />

{#if parsed && files}
	{#await parsed}
		<p>Loading...</p>
	{:then parsed}
		{@const combined = parsed.map((p) => p.result.records).flat()}
		{@const withoutDupes = removeDupes(combined)}
		{@const dupeCount = combined.length - withoutDupes.length}
		<div class="overflow-x-auto">
			<table class="table w-full">
				<thead>
					<tr>
						<th></th>
						<th>File</th>
						<th>Records</th>
					</tr>
				</thead>
				<tbody>
					{#each parsed as qso, i}
						<tr>
							<td>{i + 1}</td>
							<td>{files[i].name}</td>
							<td>{qso.result.records.length}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="my-10">
			<div>Total: {combined.length}</div>
			{#if dupeCount}
				<div class="text-warning">Duplicate QSOs: {combined.length - withoutDupes.length}</div>
			{/if}
		</div>

		{#if !dupeCount}
			<DownloadButton
				class="btn btn-primary"
				content={toAdifString(combined)}
				filename="merged.adi"
			>
				Download merged ADIF
			</DownloadButton>
		{:else}
			<div class="flex items-center gap-3">
				<div>Download merged ADIF:</div>
				<DownloadButton class="btn" content={toAdifString(combined)} filename="merged.adi">
					with duplicates
				</DownloadButton>
				<DownloadButton
					class="btn btn-primary"
					content={toAdifString(withoutDupes)}
					filename="merged.adi"
				>
					without duplicates
				</DownloadButton>
			</div>
		{/if}
	{/await}
{/if}
