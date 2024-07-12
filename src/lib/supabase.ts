import { PUBLIC_SUPABASE_ANON, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON);

export type Profile = Database['public']['Tables']['profile']['Row'];
export type QsoType = Database['public']['Tables']['qso']['Row'];
