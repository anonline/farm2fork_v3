import type { Metadata } from 'next';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: 'Farm2Fork - Szezonális zöldségek és gyümölcsök',
    description:
        'Szezonális zöldségek és gyümölcsök hazai termelőktől. Nagy hangsúlyt fektetünk a környezetbarát megoldásokra és a bio alapanyagok beszerzésére. ',
};

export default function Page() {
    return <HomeView />;
}
