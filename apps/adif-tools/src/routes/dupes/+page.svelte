<script lang="ts">
	import { isDupe, onlyDupes } from '$lib';
	import QsoTable from '$lib/components/qso-table.svelte';
	import { parseAdifFile } from '@ham-core/adif';

	let file = $state<FileList | null>();
</script>

<input type="file" class="file-input file-input-bordered mb-4" bind:files={file} multiple={false} />

{#if file}
	{#await file[0].text()}
		<p>Loading...</p>
	{:then file}
		{@const adif = parseAdifFile(file).result.records}
		{@const dupes = onlyDupes(adif)}
		{#if dupes.length}
			<div class="alert alert-warning mb-4">{dupes.length} duplicate QSOs found</div>
			<QsoTable qsos={dupes} />
		{:else}
			<div class="alert alert-success">No duplicate QSOs found</div>
		{/if}
	{/await}
{/if}
