import type { Database } from '$lib/database.types';
import { supabase, type IQso } from '$lib/supabase';
import { derived, get, writable } from 'svelte/store';
import { logsStore } from './logs-store';
import { userStore } from './user-store';

interface Filter {
	callsign?: string;
	band?: string;
	mode?: string;
}

interface Params {
	logId?: number;
	offset: number;
	limit: number;
	filter: Filter;
}

interface QsoStore {
	qsos: IQso[];
	total_qsos: number;
	isLoading: boolean;
	hasError: boolean;
}

interface LogbookStore {
	params: Params;
	result?: QsoStore;
}

const _paramsStore = writable<Params>({ offset: 0, limit: 100, filter: {} });
const _paramssStore = derived<[typeof _paramsStore, typeof userStore, typeof logsStore], Params>(
	[_paramsStore, userStore, logsStore],
	([$p, $u, $l]) => ({ ...$p, logId: $p.logId ?? $u?.info?.default_log_id ?? $l?.[0]?.id })
);
const _qsosStore = writable<QsoStore | undefined>(undefined);

_paramssStore.subscribe(({ logId, offset, limit, filter }) => {
	_qsosStore.update((old) => ({
		qsos: old?.qsos ?? [],
		total_qsos: old?.total_qsos ?? 0,
		isLoading: true,
		hasError: false
	}));
	let q = supabase
		.from('qso')
		.select('*', { count: 'exact' })
		.order('datetime', { ascending: false })
		.range(offset, offset + limit - 1);
	if (logId) q = q.eq('log_id', logId);
	if (filter.callsign) q = q.ilike('call', `%${filter.callsign}%`);
	if (filter.band) q = q.eq('band', filter.band);
	if (filter.mode) q = q.eq('mode', filter.mode);
	q.then((res) => {
		if (res.error) {
			console.error(res.error);
			_qsosStore.set({ qsos: [], total_qsos: 0, isLoading: false, hasError: true });
			return;
		}
		_qsosStore.set({
			qsos: res.data ?? [],
			total_qsos: res.count ?? 0,
			isLoading: false,
			hasError: false
		});
	});
});

export const logbookStore = derived<[typeof _paramssStore, typeof _qsosStore], LogbookStore>(
	[_paramssStore, _qsosStore],
	([$params, $qsos]) => ({
		params: $params,
		result: $qsos
	})
);

export async function insertQso(
	qso: Database['public']['Tables']['qso']['Insert']
): Promise<boolean> {
	const res = await supabase.from('qso').insert(qso);
	if (res.error) {
		console.error(res.error);
		return false;
	}

	// TODO Better way to update the store
	_paramsStore.update((s) => {
		return { ...s, offset: 0 };
	});
	return true;
}

export function selectLog(logId: number): void {
	_paramsStore.update((old) => ({ ...old, logId, offset: 0 }));
}

export function setLimit(limit: number) {
	_paramsStore.update((s) => {
		return { ...s, limit };
	});
}

export function updateFilter(filter: Filter) {
	_paramsStore.update((s) => {
		return { ...s, filter: { ...s.filter, ...filter }, offset: 0 };
	});
}

export function lastPage() {
	_paramsStore.update((s) => {
		const total = get(logbookStore).result?.total_qsos ?? 0;
		const pages = Math.ceil(total / s.limit);
		return { ...s, offset: Math.max(0, (pages - 1) * s.limit) };
	});
}

export function nextPage() {
	_paramsStore.update((s) => {
		return { ...s, offset: s.offset + s.limit };
	});
}

export function firstPage() {
	_paramsStore.update((s) => {
		return { ...s, offset: 0 };
	});
}

export function prevPage() {
	_paramsStore.update((s) => {
		return { ...s, offset: Math.max(0, s.offset - s.limit) };
	});
}
