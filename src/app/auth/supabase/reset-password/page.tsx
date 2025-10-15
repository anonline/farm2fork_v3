import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SupabaseResetPasswordView } from 'src/auth/view/supabase';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Elfelejtett jelszó kérése - ${CONFIG.appName}` };

export default function Page() {
    return <SupabaseResetPasswordView />;
}
