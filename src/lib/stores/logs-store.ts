import { supabase, type ILog } from '$lib/supabase';
import { writable } from 'svelte/store';
import { userStore } from './user-store';

export const logsStore = writable<ILog[] | undefined>(undefined);

userStore.subscribe((user) => {
	if (!user) logsStore.set(undefined);
	else fetchLogs().then(logsStore.set);
});

async function fetchLogs(): Promise<ILog[]> {
	const res = await supabase.from('log').select('*');
	return res.data?.sort((a, b) => a.id - b.id) ?? [];
}
