<script lang="ts">
	import QsoForm from '$lib/components/qso-form.svelte';
	import QsoList from '$lib/components/qso-list.svelte';
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import type { ILog } from '$lib/supabase';

	function buildLogTitle(log: ILog) {
		if (!log.title) return log.call;
		if (log.title.includes(log.call)) return log.title;
		return `${log.title} - ${log.call}`;
	}
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-wrap items-center gap-4">
		{#if $logsStore}
			<div class="flex w-full items-center gap-2 sm:w-auto">
				<div>Logbook:</div>
				<select
					class="select select-bordered select-sm w-full"
					on:change={(v) => selectLog(+v.currentTarget.value)}
					value={$logbookStore.params.logId ?? 0}
				>
					<option value={0}>All</option>
					{#each $logsStore as log}
						<option value={log.id}>
							{buildLogTitle(log)}
						</option>
					{/each}
				</select>
			</div>
		{/if}
		<a href="/adif-import" class="btn btn-sm ml-auto">Import ADIF</a>
		<!-- <a href="/settings" class="btn btn-sm">Settings</a> -->
	</div>

	<QsoForm />

	<QsoList />
</div>
