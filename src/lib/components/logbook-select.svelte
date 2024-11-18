<script lang="ts">
	import { logbookStore, selectLog } from '$lib/stores/logbook-store';
	import { logsStore } from '$lib/stores/logs-store';
	import type { ILog } from '$lib/supabase';

	let selectedValue = $derived($logbookStore.params.logId ?? 0);

	interface Props {
		class?: string;
		canBeEmpty?: boolean;
	}

	let { class: className = '', canBeEmpty = true }: Props = $props();

	let showError = $derived(!canBeEmpty && !selectedValue);

	function buildLogTitle(log: ILog) {
		if (!log.title) return log.call;
		if (log.title.includes(log.call)) return log.title;
		return `${log.title} - ${log.call}`;
	}
</script>

<label class={`form-control ${className}`}>
	<div class="label">
		<span class="label-text">Logbook</span>
		{#if showError}
			<span class="label-text-alt text-error">Please select logbook</span>
		{/if}
	</div>
	<select
		class={`select select-bordered w-full ${showError ? 'select-error' : ''}`}
		onchange={(v) => selectLog(+v.currentTarget.value)}
		value={selectedValue}
	>
		<option value={0} disabled={!canBeEmpty}>All</option>
		{#each $logsStore ?? [] as log}
			<option value={log.id}>
				{buildLogTitle(log)}
			</option>
		{/each}
	</select>
</label>
