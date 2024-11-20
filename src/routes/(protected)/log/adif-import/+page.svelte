<script lang="ts">
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import Fa from 'svelte-fa';
	import { createAdifUploadState, ImportStatus } from './adif-files-state.svelte';
	import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
	import LogbookSelect from '$lib/components/logbook-select.svelte';
	import Loading from '$lib/components/loading.svelte';

	const logbook = getLogbookContext();
	const state = createAdifUploadState(logbook);

	function upload() {
		if (!logbook.selectedLog) return;
		state.upload().then(() => logbook.refresh());
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-3xl">Import ADI files</h1>

	<div class="flex flex-col gap-4 md:flex-row md:items-end">
		<LogbookSelect class="w-full max-w-xs" canBeEmpty={false} />

		<div class="flex gap-2">
			<label class="form-control w-full sm:max-w-xs">
				<input
					class="file-input file-input-bordered w-full"
					multiple
					type="file"
					accept=".adi"
					bind:files={state.files}
				/>
			</label>
		</div>
	</div>

	{#if state.results}
		<div>
			<h2 class="mb-2">Selected files:</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
				{#each state.results as file}
					<div class="rounded-lg bg-base-200 px-4 py-3">
						<div class="text-lg font-bold">
							{file.fileName}
						</div>
						{#await file.result}
							<span class="loading loading-spinner loading-sm"></span>
						{:then value}
							<div>
								<div>
									{value.qsos.length} QSOs
								</div>
								<div>
									Callsign{value.stationCallsigns.length > 1 ? 's' : ''} used:
									{#each value.stationCallsigns as c}
										<span class={logbook.selectedLog?.call !== c ? 'text-warning' : ''}>{c}</span>
									{/each}
								</div>
								<table>
									<tbody>
										<tr><td class="pr-2">From</td><td>{value.minDate?.toLocaleString()}</td></tr>
										<tr><td class="pr-2">To</td><td>{value.maxDate?.toLocaleString()}</td></tr>
									</tbody>
								</table>
								{#each value.warnings as w}
									<div class="text-warning">{w}</div>
								{/each}
							</div>
						{/await}
						{#if file.importStatus === ImportStatus.InProgress}
							<div class="flex items-center gap-2 text-accent">
								<span class="loading loading-spinner loading-sm"></span>
								<span>Importing</span>
							</div>
						{:else if file.importStatus === ImportStatus.Success}
							<div class="flex items-center gap-2 text-success">
								<Fa icon={faCheckCircle} />
								<span>Successfully imported</span>
							</div>
						{:else if file.importStatus === ImportStatus.Error}
							<div class="flex items-center gap-2 text-error">
								<Fa icon={faXmarkCircle} />
								<span>Failed to import</span>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		{#await state.uploadReady}
			<Loading />
		{:then value}
			<button class="btn btn-primary" onclick={upload} disabled={!value}>Import</button>
		{/await}
	{/if}
</div>
