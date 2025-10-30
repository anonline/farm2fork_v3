import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { getAllTranslations } from 'src/actions/translation-management';

import { TranslationListView } from 'src/sections/translation/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { 
    title: `Statikus fordítások | Dashboard - ${CONFIG.appName}` 
};

// Force dynamic rendering since this page requires authentication
export const dynamic = 'force-dynamic';

export default async function Page() {
    const translations = await getAllTranslations();

    return <TranslationListView translations={translations} />;
}
