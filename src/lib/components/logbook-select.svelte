<script lang="ts">
	import { getLogbookContext } from '$lib/states/logbook-state.svelte';
	import { getLogsContext } from '$lib/states/logs-state.svelte';
	import type { ILog } from '$lib/supabase';

	const logsState = getLogsContext();
	const logbookState = getLogbookContext();

	const selectedValue = $derived(logbookState.logId ?? 0);

	interface Props {
		class?: string;
		canBeEmpty?: boolean;
	}

	let { class: className = '', canBeEmpty = true }: Props = $props();

	const showError = $derived(!canBeEmpty && !selectedValue);

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
		onchange={(v) => (logbookState.logId = +v.currentTarget.value)}
		value={selectedValue}
	>
		<option value={0} disabled={!canBeEmpty}>All</option>
		{#each logsState.logs ?? [] as log}
			<option value={log.id}>
				{buildLogTitle(log)}
			</option>
		{/each}
	</select>
</label>
