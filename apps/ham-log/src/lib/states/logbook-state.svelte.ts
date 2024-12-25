import type { Database } from '$lib/database.types';
import { getQsos, supabase, type IQso } from '$lib/supabase';
import { getContext, setContext } from 'svelte';
import type { UserState } from './user-state.svelte';
import type { LogsState } from './logs-state.svelte';
import { createPersistedState } from './persisted-state.svelte';

interface Filter {
	callsign?: string;
	band?: string;
	mode?: string;
}

interface PersistedLogbook {
	limit: number;
	logId: number | undefined;
}

const LOGBOOK_KEY = 'logbook-state';

function createLogbookState(user: UserState, logsState: LogsState) {
	const { value: persisted } = createPersistedState<PersistedLogbook>(LOGBOOK_KEY, {
		limit: 100,
		logId: undefined
	});
	// TODO on major typia version remove
	if (typeof persisted.limit !== 'number') persisted.limit = 100;
	if (typeof persisted.logId !== 'number') persisted.logId = undefined;

	let offset = $state(0);
	let filter: Filter = $state({});
	const logId = $derived(persisted.logId ?? user.defaultLogId ?? logsState.logs?.[0]?.id);
	let qsos: IQso[] = $state([]);
	let total_qsos: number = $state(0);
	let isLoading: boolean = $state(false);
	let hasError: boolean = $state(false);

	async function refresh() {
		isLoading = true;
		hasError = false;

		let q = getQsos('exact')
			.order('datetime', { ascending: false })
			.range(offset, offset + persisted.limit - 1);
		if (logId) q = q.eq('log_id', logId);
		if (filter.callsign) q = q.ilike('call', `${filter.callsign}%`);
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
			return persisted.limit;
		},
		set limit(value) {
			persisted.limit = value;
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
			persisted.logId = value;
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
			const pages = Math.ceil(total_qsos / persisted.limit);
			offset = Math.max(0, (pages - 1) * persisted.limit);
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
