import type { Metadata } from 'next';

import ProducerEditView from 'src/sections/producer/view/producer-edit-view';

export const metadata: Metadata = { title: 'Termelő Szerkesztése' };

export default function Page() {
  return <ProducerEditView />;
}