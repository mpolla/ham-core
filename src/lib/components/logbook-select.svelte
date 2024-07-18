<script lang="ts">
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import type { ILog } from '$lib/supabase';

	$: selectedValue = $logbookStore.params.logId ?? 0;

	let className = '';
	export { className as class };

	function buildLogTitle(log: ILog) {
		if (!log.title) return log.call;
		if (log.title.includes(log.call)) return log.title;
		return `${log.title} - ${log.call}`;
	}
</script>

<label class={`form-control ${className}`}>
	<div class="label">
		<span class="label-text">Logbook</span>
	</div>
	<select
		class="select select-bordered w-full"
		on:change={(v) => selectLog(+v.currentTarget.value)}
		value={selectedValue}
	>
		<option value="0" disabled>Select Log</option>
		{#each $logsStore ?? [] as log}
			<option value={log.id}>
				{buildLogTitle(log)}
			</option>
		{/each}
	</select>
</label>
