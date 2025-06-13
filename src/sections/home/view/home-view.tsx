'use client';

import { Stack } from '@mui/material';

import { CategoryProvider } from 'src/contexts/category-context';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeHero } from '../home-hero';
import { HomeCategoryList } from '../home-category-list';


// ----------------------------------------------------------------------
type HomeViewProps = {
    heroImg: string;
    heroHeight: string;
    heroTitle: string;
    heroPrimaryBtnText: string;
    heroSecondaryBtnText: string;
    heroImgOverlay: string;
}
export function HomeView(props: Readonly<HomeViewProps>) {
    const pageProgress = useScrollProgress();

    return (
        <>
            <ScrollProgress
                variant="linear"
                progress={pageProgress.scrollYProgress}
                sx={[(theme) => ({ position: 'fixed', zIndex: theme.zIndex.appBar + 1 })]}
            />

            <BackToTopButton />

            <BackToTopButton />

            <HomeHero
                heroImg={props.heroImg}
                heroHeight={props.heroHeight}
                heroTitle={props.heroTitle}
                heroPrimaryBtnText={props.heroPrimaryBtnText}
                heroSecondaryBtnText={props.heroSecondaryBtnText}
                heroImgOverlay={props.heroImgOverlay}
            />

            <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>

                <CategoryProvider>
                    <HomeCategoryList />
                </CategoryProvider>
            </Stack>

            

            {/*<Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        
<HomeMinimal />

        <HomeHugePackElements />

        <HomeForDesigner />

        <HomeHighlightFeatures />

        <HomeIntegrations />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeZoneUI />

        <HomeAdvertisement />
      </Stack>*/}
        </>
    );
}
