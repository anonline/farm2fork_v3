import type { Metadata } from 'next';
import { getOption } from 'src/actions/option-ssr';

import { HomeView } from 'src/sections/home/view';
import { OptionsEnum } from 'src/types/option';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
    title: 'Farm2Fork - Szezonális zöldségek és gyümölcsök',
    description:
        'Szezonális zöldségek és gyümölcsök hazai termelőktől. Nagy hangsúlyt fektetünk a környezetbarát megoldásokra és a bio alapanyagok beszerzésére. ',
};

export default async function Page() {
    const heroImg = await getOption(OptionsEnum.HomeHeroBgImage);
    const heroHeight = await getOption(OptionsEnum.HomeHeroMinHeight);

    return <HomeView heroImg={heroImg?.value} heroHeight={heroHeight?.value} />;
}
