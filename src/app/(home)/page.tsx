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

    const options = await Promise.all(optionKeys.map(getOption));
    // Handle both cache object and direct Option object
    function extractValue(opt: any) {
        if (!opt) return '';
        if (opt.value && typeof opt.value === 'object' && 'value' in opt.value) {
            return opt.value.value ?? '';
        }
        if (typeof opt.value !== 'undefined') {
            return opt.value;
        }
        // If it's a cache object
        if ('value' in opt && opt.value && typeof opt.value === 'object' && 'value' in opt.value) {
            return opt.value.value ?? '';
        }
        return '';
    }
    const [
        heroImg,
        heroHeight,
        heroTitle,
        heroPrimaryBtnText,
        heroSecondaryBtnText,
        heroImgOverlay,
    ] = options.map(extractValue);

    const HomeViewProps = {
        heroImg,
        heroHeight,
        heroTitle,
        heroPrimaryBtnText,
        heroSecondaryBtnText,
        heroImgOverlay,
    };

    return <HomeView {...HomeViewProps} />;
}
