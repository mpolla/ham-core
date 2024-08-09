import { PUBLIC_SUPABASE_ANON, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON);

export type IUserInfo = Database['public']['Tables']['user_info']['Row'];
export type ILog = Database['public']['Tables']['log']['Row'];
export type IQso = Database['public']['Tables']['qso']['Row'];

export const getLogs = () => supabase.from('log').select('*').is('deleted_at', null);

export const getQsos = (count: 'exact' | 'estimated' | 'planned' | undefined = undefined) =>
	supabase.from('qso').select('*', { count }).is('deleted_at', null);
