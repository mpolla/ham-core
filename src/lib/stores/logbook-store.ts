import type { Database } from '$lib/database.types';
import { supabase, type IQso } from '$lib/supabase';
import { derived, get, writable } from 'svelte/store';

interface Filter {
	log_id?: number;
	callsign?: string;
	band?: string;
	mode?: string;
}

interface Params {
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
const _qsosStore = writable<QsoStore | undefined>(undefined);

_paramsStore.subscribe(({ offset, limit, filter }) => {
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
		.range(offset, offset + limit);
	if (filter.log_id) q = q.eq('log_id', filter.log_id);
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

export const logbookStore = derived<[typeof _paramsStore, typeof _qsosStore], LogbookStore>(
	[_paramsStore, _qsosStore],
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
