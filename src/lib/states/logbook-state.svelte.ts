import type { Database } from '$lib/database.types';
import { getQsos, supabase, type IQso } from '$lib/supabase';
import { getContext, setContext } from 'svelte';
import type { UserState } from './user-state.svelte';
import type { LogsState } from './logs-state.svelte';

interface Filter {
	callsign?: string;
	band?: string;
	mode?: string;
}

function createLogbookState(user: UserState, logsState: LogsState) {
	let offset = $state(0);
	let limit = $state(100);
	let filter: Filter = $state({});
	let _logId: number | undefined = $state();
	const logId = $derived(_logId ?? user.defaultLogId ?? logsState.logs?.[0]?.id);
	let qsos: IQso[] = $state([]);
	let total_qsos: number = $state(0);
	let isLoading: boolean = $state(false);
	let hasError: boolean = $state(false);

	async function refresh() {
		isLoading = true;
		hasError = false;

		let q = getQsos('exact')
			.order('datetime', { ascending: false })
			.range(offset, offset + limit - 1);
		if (logId) q = q.eq('log_id', logId);
		if (filter.callsign) q = q.ilike('call', `%${filter.callsign}%`);
		if (filter.band) q = q.eq('band', filter.band);
		if (filter.mode) q = q.eq('mode', filter.mode);

		const res = await q;
		qsos = res.data ?? [];
		total_qsos = res.count ?? 0;
		isLoading = false;

		if (res.error) {
			console.error(res.error);
			hasError = true;
		}
	}

	$effect(() => {
		refresh();
	});

	async function insert(qso: Database['public']['Tables']['qso']['Insert']) {
		const res = await supabase.from('qso').insert(qso);
		if (res.error) {
			console.error(res.error);
			return false;
		}

		// TODO Better way to update the store
		refresh();
		return true;
	}

	return {
		get offset() {
			return offset;
		},
		set offset(value) {
			offset = Math.max(0, value);
		},
		get limit() {
			return limit;
		},
		set limit(value) {
			limit = value;
		},
		get filter() {
			return filter;
		},
		set filter(value) {
			filter = value;
		},
		get logId() {
			return logId;
		},
		set logId(value) {
			_logId = value;
			offset = 0;
		},
		get selectedLog() {
			return logsState.logs?.find((l) => l.id === logId);
		},
		get qsos() {
			return qsos;
		},
		get total_qsos() {
			return total_qsos;
		},
		get isLoading() {
			return isLoading;
		},
		get hasError() {
			return hasError;
		},
		refresh,
		insert,
		lastPage: () => {
			const pages = Math.ceil(total_qsos / limit);
			offset = Math.max(0, (pages - 1) * limit);
			refresh();
		}
	};
}

export type LogbookState = ReturnType<typeof createLogbookState>;

const LOGBOOK_STATE = 'LOGBOOK_STATE';

export function setLogbookContext(user: UserState, logsState: LogsState) {
	return setContext<LogbookState>(LOGBOOK_STATE, createLogbookState(user, logsState));
}

export function getLogbookContext() {
	return getContext<LogbookState>(LOGBOOK_STATE);
}
