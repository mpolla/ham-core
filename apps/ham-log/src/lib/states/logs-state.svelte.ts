import { getLogs, type ILog } from '$lib/supabase';
import { getContext, setContext } from 'svelte';

function createLogState() {
	let logs = $state<ILog[]>();

	async function refresh() {
		const res = await getLogs();
		logs = res.data?.sort((a, b) => a.id - b.id) ?? [];
	}

	refresh();

	return {
		get logs() {
			return logs;
		},
		refresh
	};
}

export type LogsState = ReturnType<typeof createLogState>;

const LOGS_STATE = 'LOGS_STATE';

export function setLogsContext() {
	return setContext<LogsState>(LOGS_STATE, createLogState());
}

export function getLogsContext() {
	return getContext<LogsState>(LOGS_STATE);
}
