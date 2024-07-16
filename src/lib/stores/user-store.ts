import { supabase, type IUserInfo } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import { writable } from 'svelte/store';

interface UserStore {
	user: User;
	info?: IUserInfo;
}

export const userStore = writable<UserStore | null | undefined>(undefined);

getUserStore().then(userStore.set);

export const signIn = async (email: string, password: string): Promise<boolean> => {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		console.error('Error:', error.message);
		return false;
	}
	userStore.set(await getUserStore(data?.user));
	return true;
};

export const signOut = async () => {
	await supabase.auth.signOut();
	userStore.set(null);
};

async function getUserStore(user?: User): Promise<UserStore | null> {
	if (!user) {
		const userRes = await supabase.auth.getUser();
		user = userRes?.data.user ?? undefined;
	}
	if (!user) return null;

	const infoRes = await supabase.from('user_info').select('*').eq('user_id', user.id).maybeSingle();
	return {
		user,
		info: infoRes.data ?? undefined
	};
}
