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
    const optionKeys = [
        OptionsEnum.HomeHeroBgImage,
        OptionsEnum.HomeHeroMinHeight,
        OptionsEnum.HomeHeroTitle,
        OptionsEnum.HomeHeroPrimaryBtnText,
        OptionsEnum.HomeHeroSecondaryBtnText,
        OptionsEnum.HomeHeroOverlay,
    ];

    const [
        heroImg,
        heroHeight,
        heroTitle,
        heroPrimaryBtnText,
        heroSecondaryBtnText,
        heroImgOverlay,
    ] = await Promise.all(optionKeys.map(getOption));

    const HomeViewProps = {
        heroImg: heroImg?.value || '',
        heroHeight: heroHeight?.value || '',
        heroTitle: heroTitle?.value || '',
        heroPrimaryBtnText: heroPrimaryBtnText?.value || '',
        heroSecondaryBtnText: heroSecondaryBtnText?.value || '',
        heroImgOverlay: heroImgOverlay?.value || '',
    };

    return <HomeView {...HomeViewProps} />;
}
