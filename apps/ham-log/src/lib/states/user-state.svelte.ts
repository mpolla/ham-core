import { supabase, type IUserInfo } from '$lib/supabase';
import type { User } from '@supabase/supabase-js';
import { getContext, setContext } from 'svelte';

function createUserState() {
	let loggedIn = $state<boolean>();
	let user = $state<User>();
	let info = $state<IUserInfo>();

	async function getUser(u?: User) {
		const res = await getUserState(u);
		loggedIn = !!res;
		user = res?.user;
		info = res?.info;
	}

	async function login(email: string, password: string) {
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			console.error('Error:', error.message);
			return false;
		}
		getUser(data?.user);
		return true;
	}

	async function logout() {
		await supabase.auth.signOut();
		loggedIn = false;
		user = undefined;
		info = undefined;
	}

	function setDefaultLog(logId: number) {
		if (!loggedIn) return;
		supabase
			.from('user_info')
			.update({ default_log_id: logId })
			.eq('user_id', user!.id)
			.then(() => {
				if (!info) return;
				info.default_log_id = logId;
			});
	}

	getUser();

	return {
		get loggedIn() {
			return loggedIn;
		},
		get id() {
			return user?.id;
		},
		get name() {
			return info?.name;
		},
		get call() {
			return info?.call;
		},
		get defaultLogId() {
			return info?.default_log_id;
		},
		set defaultLogId(logId: number | null | undefined) {
			if (!logId) return;
			setDefaultLog(logId);
		},
		login,
		logout
	};
}

async function getUserState(user?: User) {
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

export type UserState = ReturnType<typeof createUserState>;

const USER_STATE = 'USER_STATE';

export function setUserContext() {
	return setContext<UserState>(USER_STATE, createUserState());
}

export function getUserContext() {
	return getContext<UserState>(USER_STATE);
}
