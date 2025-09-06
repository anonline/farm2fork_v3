import type { Metadata } from 'next';

import ProducerCreateView from 'src/sections/producer/view/producer-create-view';

export const metadata: Metadata = { title: 'Új Termelő' };

export default function Page() {
    return <ProducerCreateView />;
}
