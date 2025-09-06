import type { Metadata } from 'next';

import Layout from './layout';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: 'Szállítási Zónák' };

export default function Page() {
    return <Layout />;
}
