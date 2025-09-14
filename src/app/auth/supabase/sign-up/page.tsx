import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import SupabaseSignUpView from 'src/auth/view/supabase/supabase-sign-up-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Regisztráció - ${CONFIG.appName}` };

export default function Page() {
    return <SupabaseSignUpView />;
}
