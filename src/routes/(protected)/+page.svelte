<script lang="ts">
	import QsoForm from '$lib/components/qso-form.svelte';
	import QsoList from '$lib/components/qso-list.svelte';
	import { logsStore } from '$lib/stores/logs-store';
	import { userStore } from '$lib/stores/user-store';
	import type { ILog } from '$lib/supabase';
	import { logbookStore, updateFilter } from '../../lib/stores/logbook-store';

	userStore.subscribe((value) => {
		if (value?.info?.default_log_id) {
			updateFilter({ log_id: value.info.default_log_id });
		}
	});

	logsStore.subscribe((value) => {
		if (value && $logbookStore?.params.filter.log_id === undefined) {
			updateFilter({ log_id: value[0].id });
		}
	});

	$: console.log($logbookStore);

	function buildLogTitle(log: ILog) {
		if (!log.title) return log.call;
		if (log.title.includes(log.call)) return log.title;
		return `${log.title} - ${log.call}`;
	}
</script>

<div class="flex flex-col gap-10">
	<div class="flex items-center gap-2">
		{#if $logsStore}
			<div>Logbook:</div>
			<select
				class="select select-bordered select-sm w-full max-w-xs"
				on:change={(v) => {
					updateFilter({ log_id: parseInt(v.currentTarget.value) });
				}}
				value={$logbookStore.params.filter.log_id}
			>
				<option value={undefined}>All</option>
				{#each $logsStore as log}
					<option value={log.id}>
						{buildLogTitle(log)}
					</option>
				{/each}
			</select>
		{/if}
		<a href="/adif-import" class="btn btn-sm ml-auto">Import ADIF</a>
		<!-- <a href="/settings" class="btn btn-sm">Settings</a> -->
	</div>

	<QsoForm />

	<QsoList />
</div>
