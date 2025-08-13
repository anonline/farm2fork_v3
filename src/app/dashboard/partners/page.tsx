import type { Metadata } from 'next';

import PartnerListView from 'src/sections/partners/view/partner-list-view';

export const metadata: Metadata = { title: 'Partnerek' };

export default function Page() {
  return <PartnerListView />;
}