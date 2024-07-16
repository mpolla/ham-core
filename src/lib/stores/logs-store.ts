import { supabase, type ILog } from '$lib/supabase';
import { writable } from 'svelte/store';

export const logsStore = writable<ILog[]>([]);

fetchLogs().then(logsStore.set);

async function fetchLogs(): Promise<ILog[]> {
	const res = await supabase.from('log').select('*');
	return res.data ?? [];
}
