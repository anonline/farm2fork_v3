import type { Metadata } from 'next';

import ShippingCostListView from 'src/sections/shipping-cost/view/shipping-cost-list-view';

export const metadata: Metadata = { title: 'Szállítási díjak és módok' };

export default function Page() {
    return <ShippingCostListView />;
}
