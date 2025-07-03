'use client';

import { Box, Container, Stack } from '@mui/material';

import { CategoryProvider } from 'src/contexts/category-context';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeHero } from '../home-hero';
import { HomeCategoryList } from '../home-category-list';
import { HomeAdvertisement } from '../home-advertisement';
import { HomeFAQs } from '../home-faqs';
import { HomeForDesigner } from '../home-for-designer';
import { HomeHighlightFeatures } from '../home-highlight-features';
import { HomeHugePackElements } from '../home-hugepack-elements';
import { HomeIntegrations } from '../home-integrations';
import { HomeMinimal } from '../home-minimal';
import { HomeTestimonials } from '../home-testimonials';
import { HomeZoneUI } from '../home-zone-ui';
import { background } from 'src/theme';
import { varBgColor } from 'src/components/animate';


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
    const oddBoxStyle = {
        backgroundColor: "#e0e7e1",
        width:"100%"
    };
    const evenBoxStyle = {
        backgroundColor: "background.default",
        width:"100%",
    };
    const containerStyle = {
        width: { md: "100%", lg: "80%" }
    };
    return (
        <>
            <Box sx={oddBoxStyle}>
                <Container maxWidth={false} sx={containerStyle}>
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

                </Container>
            </Box>

            <Box sx={evenBoxStyle}>
                <Container maxWidth={false} sx={containerStyle}>
                    <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
                        <CategoryProvider>
                            <HomeCategoryList />
                        </CategoryProvider>
                    </Stack>
                </Container>
            </Box>

            <Box sx={oddBoxStyle}>
                <Container maxWidth={false} sx={containerStyle}>
                    <HomeMinimal />
                </Container>
            </Box>

            <Box sx={evenBoxStyle}>
                <Container maxWidth={false} sx={containerStyle}>

                </Container>
            </Box>
            {/*<HomeHugePackElements />

                <HomeForDesigner />

                <HomeHighlightFeatures />

                <HomeIntegrations />

                <HomePricing />

                <HomeTestimonials />

                <HomeFAQs />

                <HomeZoneUI />

                <HomeAdvertisement />*/}

        </>

    );
}
