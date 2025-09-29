import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import GetDocuments from 'src/lib/billingo';
import { getOption } from 'src/actions/option-ssr';

import { InvoiceListView } from 'src/sections/invoice/view';

import { OptionsEnum } from 'src/types/option';

// ----------------------------------------------------------------------

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: `Invoice list | Dashboard - ${CONFIG.appName}` };

export default async function Page() {
    const billingoApiKey = await getOption(OptionsEnum.BillingoV3ApiKey);
    const documents = await GetDocuments(); // Fetch documents from Billingo API
    const hasBillingoApiKey = billingoApiKey && billingoApiKey.value;
    return <InvoiceListView documents={documents} hasKey={hasBillingoApiKey} />;
}
