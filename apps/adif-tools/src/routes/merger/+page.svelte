<script lang="ts">
	import DownloadButton from '$lib/components/download-button.svelte';
	import { parseAdifFile, writeAdifFile } from '@ham-core/adif';

	let files = $state<FileList | null>();
	const parsed = $derived.by(() => {
		if (!files) return;

		return Promise.all([...files].map((f) => f.text().then((t) => parseAdifFile(t))));
	});
</script>

<input type="file" class="file-input file-input-bordered mb-4" bind:files multiple={true} />

{#if parsed && files}
	{#await parsed}
		<p>Loading...</p>
	{:then parsed}
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

		<DownloadButton
			class="btn btn-primary mt-10"
			content={writeAdifFile(
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
					records: parsed.map((p) => p.result.records).flat()
				},
				{
					fieldSep: ' ',
					rowSep: '\n'
				}
			)}
			filename="merged.adi"
		>
			Download merged ADIF
		</DownloadButton>
	{/await}
{/if}
