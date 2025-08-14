'use client';

import { ShippingProvider } from 'src/contexts/shipping-context';

import ShippingListView from 'src/sections/shipping/view/shipping-list-view';


// ----------------------------------------------------------------------

export default function Layout() {
  return (
    <ShippingProvider>
        <ShippingListView />
    </ShippingProvider>
  );
}