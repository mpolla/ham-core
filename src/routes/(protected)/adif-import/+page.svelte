<script lang="ts">
	import { parseAdifFile } from '$lib/adif-parser';
	import { Qso } from '$lib/models/qso';
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import { supabase, type ILog } from '$lib/supabase';

	let files: FileList;

	$: fileInfo = files?.length
		? Array.from(files).map((file) => {
				const qsosPromise = file.text().then((text) => {
					try {
						const res = parseAdifFile(text);
						console.log(res.warnings);
						return res.result.records.map((r) => {
							try {
								return Qso.fromAdif(r);
							} catch (e) {
								console.log(r);
								console.log(e);
								throw new Error('Invalid QSO');
							}
						});
					} catch {
						return undefined;
					}
				});
				return {
					name: file.name,
					size: file.size,
					qsosPromise
				};
			})
		: undefined;

	function submit() {
		for (const { qsosPromise } of fileInfo!) {
			qsosPromise.then(async (qsos) => {
				if (!qsos) return;
				await supabase.from('qso').insert(
					qsos.map((qso) => ({
						...qso,
						created_at: undefined,
						updated_at: undefined,
						id: undefined,
						user_id: undefined,
						profile_id: undefined
					})),
					{
						defaultToNull: false
					}
				);
			});
		}
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
					bind:files
				/>
			</label>
		</div>
	</div>

	{#if fileInfo}
		<div>
			<h2>Selected files:</h2>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
				{#each fileInfo as file}
					<div class="rounded-lg bg-base-200 px-4 py-3">
						<div class="text-lg font-bold">
							{file.name}
						</div>
						{#await file.qsosPromise}
							<span class="loading loading-spinner loading-sm" />
						{:then value}
							<div>
								{#if value}
									<div>
										{value.length} QSOs
									</div>
									<div>
										From:
										{new Date(
											value.reduce(
												(acc, qso) => Math.min(acc, new Date(qso.datetime).valueOf()),
												Infinity
											)
										).toLocaleString()}
									</div>
									<div>
										To:
										{new Date(
											value.reduce((acc, qso) => Math.max(acc, new Date(qso.datetime).valueOf()), 0)
										).toLocaleString()}
									</div>
								{:else}
									<div>Invalid ADIF file</div>
									<button
										class="btn btn-outline btn-sm mt-2"
										on:click={() => (file.qsosPromise = Promise.resolve(undefined))}>Analyze</button
									>
								{/if}
							</div>
						{/await}
					</div>
				{/each}
			</div>
		</div>

		{#await Promise.all(fileInfo.map((file) => file.qsosPromise))}
			<span class="loading loading-spinner" />
		{:then value}
			{#if value.every((v) => v)}
				<button class="btn btn-primary" on:click={submit}>Import</button>
			{/if}
		{/await}
	{/if}
</div>
