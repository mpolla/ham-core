import { supabase } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

export const userStore = writable<User | null | undefined>(undefined, (set) => {
	supabase.auth.getUser().then((res) => set(res.data.user));
});

export const signIn = async (email: string, password: string): Promise<boolean> => {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		console.error('Error:', error.message);
		return false;
	}
	userStore.set(data.user);
	return true;
};

export const signOut = async () => {
	await supabase.auth.signOut();
	userStore.set(null);
};
