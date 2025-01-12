<script lang="ts">
	import QsoTable from '$lib/components/qso-table.svelte';
	import { parseAdifFile } from '@ham-core/adif';

	let file = $state<FileList | null>();
</script>

<input type="file" class="file-input file-input-bordered mb-4" bind:files={file} multiple={false} />

{#if file}
	{#await file[0].text()}
		<p>Loading...</p>
	{:then file}
		{@const adif = parseAdifFile(file)}
		<QsoTable qsos={adif.result.records} />
	{/await}
{/if}
