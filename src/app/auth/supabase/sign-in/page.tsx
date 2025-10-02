import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SupabaseSignInView } from 'src/auth/view/supabase';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Bejelentkezés - ${CONFIG.appName}` };

export default function Page() {
    return <SupabaseSignInView />;
}
