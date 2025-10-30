import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { fetchDeniedShippingDates } from 'src/actions/denied-shipping-date';

import { DeniedShippingDatesView } from 'src/sections/dashboard/settings/denied-dates/denied-shipping-dates-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Letiltott szállítási dátumok | Dashboard - ${CONFIG.appName}`,
};

export default async function Page() {
  const deniedDates = await fetchDeniedShippingDates();

  return <DeniedShippingDatesView deniedDates={deniedDates} />;
}
