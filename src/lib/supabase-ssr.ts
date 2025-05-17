import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

import { createServerClient } from '@supabase/ssr'

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const supabaseUrl = CONFIG.supabase.url;
const supabaseKey = CONFIG.supabase.key;
const service_role_key = CONFIG.supabase.service_key;

export const supabaseSSR = async (cookieStore:ReadonlyRequestCookies) => (await createSSRClient(supabaseUrl, supabaseKey, cookieStore));

export const supabaseAdmin = async (cookieStore:ReadonlyRequestCookies) => (await createSSRClient(supabaseUrl, service_role_key, cookieStore)).auth.admin;

async function createSSRClient(url:string, key:string, cookieStore: ReadonlyRequestCookies) {

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}