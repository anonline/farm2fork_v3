'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import { ShippingProvider } from 'src/contexts/shipping-context';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ShippingListView from 'src/sections/shipping/view/shipping-list-view';


// ----------------------------------------------------------------------

export default function Layout() {
  return (
    <ShippingProvider>
      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Szállítási Zónák"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Szállítási Zónák' },
          ]}
        />
        <ShippingListView />
      </DashboardContent>
    </ShippingProvider>
  );
}