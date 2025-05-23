'use client';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';
import { HomeHero } from '../home-hero';


// ----------------------------------------------------------------------
type HomeViewProps = {
    heroImg : string;
    heroHeight:string;
}
export function HomeView({heroImg, heroHeight}:Readonly<HomeViewProps>) {
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

            <HomeHero heroImg={heroImg} heroHeight={heroHeight} />

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
