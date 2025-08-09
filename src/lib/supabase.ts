import type { SupabaseClient } from '@supabase/supabase-js';

import { createBrowserClient } from '@supabase/ssr';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const isSupabase = CONFIG.auth.method === 'supabase';

const supabaseUrl = CONFIG.supabase.url;
const supabaseKey = CONFIG.supabase.key;

export const supabase = isSupabase
  ? createBrowserClient(supabaseUrl, supabaseKey)
  : ({} as SupabaseClient<any, 'public', any>);



