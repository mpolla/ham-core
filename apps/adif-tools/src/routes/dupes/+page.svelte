<script lang="ts">
	import QsoTable from '$lib/components/qso-table.svelte';
	import { parseAdifFile } from '@ham-core/adif';

	let file = $state<FileList | null>();

	type Qso = { [key: string]: string | undefined };

	function isDupe(a: Qso, b: Qso): boolean {
		return (
			a.CALL === b.CALL &&
			a.QSO_DATE == b.QSO_DATE &&
			a.TIME_ON?.substring(0, 4) == b.TIME_ON?.substring(0, 4) &&
			a.MODE === b.MODE &&
			(a.BAND === b.BAND || a.FREQ === b.FREQ)
		);
	}
</script>

<input type="file" class="file-input file-input-bordered mb-4" bind:files={file} multiple={false} />

{#if file}
	{#await file[0].text()}
		<p>Loading...</p>
	{:then file}
		{@const adif = parseAdifFile(file).result.records}
		{@const dupes = adif.filter((qso, i) => adif.slice(0, i).find((q) => isDupe(q, qso)))}
		{#if dupes.length}
			<QsoTable qsos={dupes} />
		{:else}
			<div class="alert alert-success">No duplicate QSOs found</div>
		{/if}
	{/await}
{/if}
