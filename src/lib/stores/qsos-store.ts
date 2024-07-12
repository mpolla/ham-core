import { Qso } from '$lib/models/qso';
import { supabase } from '$lib/supabase';
import { writable } from 'svelte/store';

interface IQsosStore {
	qsos: Qso[];
}

export const qsosStore = writable<IQsosStore>({ qsos: [] }, (set) => {
	supabase
		.from('qso')
		.select('*')
		.order('datetime', { ascending: false })
		.limit(200)
		.then((res) => {
			set({ qsos: res.data?.map((r) => new Qso(r)) ?? [] });
		});
});
