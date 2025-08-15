import type { Metadata } from 'next';

import PaymentMethodListView from 'src/sections/payment-method/view/payment-method-list-view';

export const metadata: Metadata = { title: 'Fizetési Módok' };

export default function Page() {
  return <PaymentMethodListView />;
}