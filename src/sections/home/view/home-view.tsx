'use client';

import { Box, Stack, Container } from '@mui/material';

import { CategoryProvider } from 'src/contexts/category-context';
import { FeaturedProductsProvider, ProductsProvider, StarProductsContext, StarProductsProvider } from 'src/contexts/products-context';

import { BackToTopButton } from 'src/components/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeHero } from '../home-hero';
import { HomeMinimal } from '../home-minimal';
import HomeHighlight from '../home-highlight';
import HomeIntegrations from '../home-integrations';
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
    const oddBoxStyle = {
        backgroundColor: "#f5f5f5",
        width: "100%"
    };
    const evenBoxStyle = {
        backgroundColor: "background.default",
        width: "100%",
    };

    return (
        <>
            <Box sx={{ backgroundColor: "#e0e7e1" }}>
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

            </Box>

            <Box sx={evenBoxStyle}>
                <Container maxWidth="lg">
                    <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
                        <CategoryProvider>
                            <HomeCategoryList />
                        </CategoryProvider>
                    </Stack>
                </Container>
            </Box>

            <Box sx={oddBoxStyle}>
                <Container maxWidth="lg">
                    
                            <HomeMinimal />
                </Container>
            </Box>

            <Box sx={evenBoxStyle}>
                <Container maxWidth="lg">
                    <HomeHighlight />
                </Container>
            </Box>

            <Box sx={oddBoxStyle}>
                <Container maxWidth="lg">
                    <HomeIntegrations />
                </Container>
            </Box>

        </>

    );
}
