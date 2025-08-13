import type { Metadata } from 'next';

import DeliveryListView from 'src/sections/delivery/view/delivery-list-view';

export const metadata: Metadata = { title: 'Futárok' };

export default function Page() {
  return <DeliveryListView />;
}