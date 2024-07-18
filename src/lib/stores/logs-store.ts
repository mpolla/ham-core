import { supabase, type ILog } from '$lib/supabase';
import { get, writable } from 'svelte/store';

export const logsStore = writable<ILog[] | undefined>(undefined, (set) => {
	if (get(logsStore) === undefined) fetchLogs().then(set);
});

async function fetchLogs(): Promise<ILog[]> {
	const res = await supabase.from('log').select('*');
	return res.data?.sort((a, b) => a.id - b.id) ?? [];
}
