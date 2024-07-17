<script lang="ts">
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import { type ILog } from '$lib/supabase';
	import Fa from 'svelte-fa';
	import { adifFilesStore, ImportStatus, setFiles, uploadFiles } from './adif-files-store';
	import { faCheckCircle, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';

	$: selectedCall = $logsStore.find((l) => l.id === $logbookStore.params.logId)?.call;

	function upload() {
		if (!$logbookStore.params.logId) return;
		uploadFiles($logbookStore.params.logId);
	}

	function buildLogTitle(log: ILog) {
		if (!log.title) return log.call;
		if (log.title.includes(log.call)) return log.title;
		return `${log.title} - ${log.call}`;
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-3xl">Import ADIF files</h1>

	<div class="flex flex-col gap-4 md:flex-row md:items-end">
		<label class="form-control w-full sm:max-w-xs">
			<div class="label">
				<span class="label-text">Logbook</span>
			</div>
			<select
				class="select select-bordered w-full"
				on:change={(v) => selectLog(+v.currentTarget.value)}
				value={$logbookStore.params.logId ?? 0}
			>
				<option value={0} disabled>Select Log</option>
				{#each $logsStore as log}
					<option value={log.id}>
						{buildLogTitle(log)}
					</option>
				{/each}
			</select>
		</label>

		<div class="flex gap-2">
			<label class="form-control w-full sm:max-w-xs">
				<input
					class="file-input file-input-bordered w-full"
					multiple
					type="file"
					accept=".adi"
					on:change={(e) => setFiles(e.currentTarget.files)}
				/>
			</label>
		</div>
	</div>

	{#if $adifFilesStore}
		<div>
			<h2 class="mb-2">Selected files:</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
				{#each $adifFilesStore as file}
					<div class="rounded-lg bg-base-200 px-4 py-3">
						<div class="text-lg font-bold">
							{file.fileName}
						</div>
						{#await file.result}
							<span class="loading loading-spinner loading-sm" />
						{:then value}
							<div>
								<div>
									{value.qsos.length} QSOs
								</div>
								<div>
									Callsign{value.stationCallsigns.length > 1 ? 's' : ''} used:
									{#each value.stationCallsigns as c}
										<span class={selectedCall !== c ? 'text-warning' : ''}>{c}</span>
									{/each}
								</div>
								<table>
									<tr><td class="pr-2">From</td><td>{value.minDate?.toLocaleString()}</td></tr>
									<tr><td class="pr-2">To</td><td>{value.maxDate?.toLocaleString()}</td></tr>
								</table>
								{#each value.warnings as w}
									<div class="text-warning">{w}</div>
								{/each}
							</div>
						{/await}
						{#if file.importStatus === ImportStatus.InProgress}
							<div class="flex items-center gap-2 text-accent">
								<span class="loading loading-spinner loading-sm" />
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

		{#await Promise.all($adifFilesStore.map((file) => file.result))}
			<span class="loading loading-spinner" />
		{:then value}
			{#if value.every((v) => v)}
				<button class="btn btn-primary" on:click={upload}>Import</button>
			{/if}
		{/await}
	{/if}
</div>
